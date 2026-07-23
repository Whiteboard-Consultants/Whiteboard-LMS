import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { MANAGER_PERMISSION_CATALOG } from '@/lib/permissions';
import { requireAdmin } from '@/lib/admin-auth';

const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const permissionKeys = [
  '*',
  ...MANAGER_PERMISSION_CATALOG.map((p) => p.key),
] as const;

const createUserSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['student', 'instructor', 'admin', 'manager']),
    status: z.enum(['pending', 'approved']),
    phone: z.union([z.string(), z.null(), z.undefined()]).optional(),
    permissions: z.array(z.enum(permissionKeys as unknown as [string, ...string[]])).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'manager') {
      if (!data.permissions || data.permissions.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Managers require at least one permission (or ALL)',
          path: ['permissions'],
        });
      }
    }
  });

const updatePermissionsSchema = z.object({
  userId: z.string().uuid(),
  permissions: z.array(z.enum(permissionKeys as unknown as [string, ...string[]])).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    const profileData: Record<string, unknown> = {
      id: crypto.randomUUID(),
      name: validatedData.name,
      email: validatedData.email,
      role: validatedData.role,
      status: validatedData.status || 'pending',
    };

    if (validatedData.phone) {
      profileData.phone = validatedData.phone;
    }

    if (validatedData.role === 'manager') {
      profileData.permissions = validatedData.permissions;
      profileData.status = 'approved';

      const email = validatedData.email.trim().toLowerCase();
      profileData.email = email;

      // Readable temp password that meets common Supabase password rules
      const tempPassword = `Mgr${Math.floor(100000 + Math.random() * 900000)}Aa!`;

      let authUserId: string | null = null;

      // Reuse existing auth user if a previous failed create left one behind
      const { data: listed, error: listError } =
        await supabaseServiceRole.auth.admin.listUsers({ perPage: 1000 });
      if (listError) {
        console.warn('Could not list users while creating manager:', listError.message);
      }
      const existingAuth = listed?.users?.find(
        (u) => u.email?.toLowerCase() === email
      );

      if (existingAuth) {
        const { data: updatedAuth, error: updateAuthError } =
          await supabaseServiceRole.auth.admin.updateUserById(existingAuth.id, {
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              name: validatedData.name,
              role: 'manager',
            },
          });

        if (updateAuthError || !updatedAuth.user) {
          return NextResponse.json(
            {
              error: `Failed to reset manager login: ${updateAuthError?.message || 'Unknown error'}`,
            },
            { status: 400 }
          );
        }
        authUserId = updatedAuth.user.id;
      } else {
        const { data: authData, error: authError } =
          await supabaseServiceRole.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
              name: validatedData.name,
              role: 'manager',
            },
          });

        if (authError || !authData.user) {
          return NextResponse.json(
            {
              error: `Failed to create manager login: ${authError?.message || 'Unknown error'}`,
            },
            { status: 400 }
          );
        }
        authUserId = authData.user.id;

        // Ensure password is applied (some projects need an explicit update)
        await supabaseServiceRole.auth.admin.updateUserById(authUserId, {
          password: tempPassword,
          email_confirm: true,
        });
      }

      profileData.id = authUserId;

      const { data: userProfile, error: profileError } = await supabaseServiceRole
        .from('users')
        .upsert([profileData], { onConflict: 'id' })
        .select()
        .single();

      if (profileError) {
        console.error('Manager profile creation error:', profileError);

        const hint =
          profileError.message?.includes('permissions') ||
          profileError.message?.includes('manager') ||
          profileError.code === '42703'
            ? ' Database migration required: run migrations/20260722_add_manager_role_permissions.sql in the Supabase SQL Editor.'
            : '';

        return NextResponse.json(
          { error: `Profile creation failed: ${profileError.message}.${hint}` },
          { status: 400 }
        );
      }

      // Also update by email in case a trigger created a mismatched row
      await supabaseServiceRole
        .from('users')
        .update({
          name: validatedData.name,
          role: 'manager',
          status: 'approved',
          permissions: validatedData.permissions,
        })
        .eq('email', email);

      // Verify credentials work before telling the admin success
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const verifyRes = await fetch(
        `${supabaseUrl}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({ email, password: tempPassword }),
        }
      );

      if (!verifyRes.ok) {
        const verifyBody = await verifyRes.text();
        console.error('Manager password verification failed:', verifyBody);
        return NextResponse.json(
          {
            error:
              'Manager profile was saved, but login verification failed. Use "Set Temporary Password" on the user row, then try again.',
            user: userProfile,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        user: userProfile,
        temporaryPassword: tempPassword,
        message:
          'Manager created with login access. Share the temporary password securely, then ask them to change it.',
      });
    }

    const { data: userProfile, error: profileError } = await supabaseServiceRole
      .from('users')
      .insert([profileData])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        { error: `Profile creation failed: ${profileError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userProfile,
      message: `User profile created successfully! The user can now register normally using the sign-up page.`,
    });
  } catch (error: any) {
    console.error('User creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/** Update manager permissions (admin-only). */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 403 });
    }

    const body = await request.json();
    const { userId, permissions } = updatePermissionsSchema.parse(body);

    const { data: existing, error: fetchError } = await supabaseServiceRole
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (existing.role !== 'manager') {
      return NextResponse.json(
        { error: 'Permissions can only be set on manager accounts' },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabaseServiceRole
      .from('users')
      .update({ permissions })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
