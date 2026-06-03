import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';

const registerProfileSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['student', 'instructor', 'admin']),
});

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { userId, email, name, role } = registerProfileSchema.parse(
      await request.json()
    );

    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser?.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (
      authUser.user.email?.toLowerCase() !== email.toLowerCase()
    ) {
      return NextResponse.json(
        { error: 'Invalid registration request' },
        { status: 403 }
      );
    }

    const status = role === 'instructor' ? 'pending' : 'approved';
    const now = new Date().toISOString();

    // Brief pause so auth trigger can create the row first
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ name, role, status, updated_at: now })
      .eq('id', userId);

    if (updateError) {
      const { error: insertError } = await supabaseAdmin.from('users').insert({
        id: userId,
        email: authUser.user.email,
        name,
        role,
        status,
        created_at: now,
        updated_at: now,
      });

      if (insertError) {
        console.error('register-profile failed:', updateError, insertError);
        return NextResponse.json(
          { error: insertError.message || updateError.message },
          { status: 500 }
        );
      }
    }

    // Local dev: skip email confirmation gate so login works immediately
    if (process.env.NODE_ENV !== 'production') {
      const { error: confirmError } =
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          email_confirm: true,
        });

      if (confirmError) {
        console.warn('Dev email auto-confirm failed:', confirmError.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('register-profile error:', error);
    return NextResponse.json(
      { error: 'Failed to complete registration profile' },
      { status: 500 }
    );
  }
}
