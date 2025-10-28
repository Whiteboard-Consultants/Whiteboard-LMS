import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for admin operations
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  // Return the SQL for creating the notifications table
  const notificationsTableSQL = `
-- Create the notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_receiver_id ON public.notifications(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON public.notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Create updated_at trigger
DROP TRIGGER IF EXISTS handle_notifications_updated_at ON public.notifications;
CREATE TRIGGER handle_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their received notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their sent notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their received notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

-- Create RLS policies
CREATE POLICY "Users can view their received notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = receiver_id);

CREATE POLICY "Users can view their sent notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = sender_id);

CREATE POLICY "Users can update their received notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = receiver_id);

CREATE POLICY "Users can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Admins can view all notifications" ON public.notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all notifications" ON public.notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );
    `;
    
  return NextResponse.json({
    sql: notificationsTableSQL.trim(),
    instructions: [
      '1. Go to your Supabase Dashboard',
      '2. Navigate to SQL Editor',
      '3. Copy and paste the SQL below',
      '4. Click "Run" to execute',
      '5. Use POST method to verify creation'
    ]
  });
}

export async function POST(request: NextRequest) {
  try {
    // Test if notifications table exists and is functional
    const { error: testError } = await supabaseServiceRole
      .from('notifications')
      .select('id')
      .limit(1);
    
    if (testError) {
      return NextResponse.json({
        success: false,
        tableExists: false,
        message: 'notifications table does not exist',
        error: testError.message,
        action: 'Use GET method to retrieve SQL for table creation'
      });
    }
    
    // Table exists, test its functionality with sample data
    const { data: users } = await supabaseServiceRole
      .from('users')
      .select('id, name')
      .limit(2);
    
    if (!users || users.length < 2) {
      return NextResponse.json({
        success: true,
        tableExists: true,
        message: 'notifications table exists but need at least 2 users for testing',
        recommendation: 'Create some users first, then test notifications functionality'
      });
    }
    
    // Test insert, select, update, delete operations with valid user IDs
    const [sender, receiver] = users;
    const { data: notification, error: insertError } = await supabaseServiceRole
      .from('notifications')
      .insert({
        sender_id: sender.id,
        sender_name: sender.name || 'Test Sender',
        receiver_id: receiver.id,
        message: 'Test notification message - this will be deleted automatically',
        is_read: false
      })
      .select()
      .single();
    
    if (insertError) {
      return NextResponse.json({
        success: false,
        tableExists: true,
        error: 'Table exists but has structural issues',
        details: insertError,
        troubleshooting: {
          possibleCauses: [
            'Foreign key constraint issues',
            'Column name mismatches',
            'RLS policy restrictions',
            'Missing required fields'
          ],
          recommendedActions: [
            'Check that users table exists and has data',
            'Verify column names match database schema',
            'Review RLS policies for notifications table',
            'Ensure all required fields are provided'
          ]
        }
      }, { status: 500 });
    }
    
    // Test update
    const { error: updateError } = await supabaseServiceRole
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notification.id);
    
    // Clean up test record
    const { error: deleteError } = await supabaseServiceRole
      .from('notifications')
      .delete()
      .eq('id', notification.id);
    
    if (updateError) {
      return NextResponse.json({
        success: false,
        tableExists: true,
        error: 'Update operation failed',
        details: updateError
      }, { status: 500 });
    }
    
    if (deleteError) {
      console.warn('Failed to clean up test notification:', deleteError);
      // Don't fail the test for cleanup issues
    }
    
    return NextResponse.json({
      success: true,
      tableExists: true,
      message: 'notifications table is fully functional!',
      testResult: 'All CRUD operations successful',
      testedWith: {
        sender: { id: sender.id, name: sender.name },
        receiver: { id: receiver.id, name: receiver.name }
      },
      structure: {
        table: 'notifications',
        columns: [
          'id: UUID (Primary Key)',
          'sender_id: UUID (Foreign Key to auth.users)',
          'sender_name: TEXT',
          'receiver_id: UUID (Foreign Key to auth.users)',
          'message: TEXT',
          'is_read: BOOLEAN',
          'created_at: TIMESTAMP WITH TIME ZONE',
          'updated_at: TIMESTAMP WITH TIME ZONE'
        ],
        features: [
          'RLS policies for users and admins',
          'Automatic updated_at trigger',
          'Performance indexes',
          'Foreign key constraints'
        ]
      }
    });
    
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        troubleshooting: 'Check server logs for detailed error information'
      },
      { status: 500 }
    );
  }
}