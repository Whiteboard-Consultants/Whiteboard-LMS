
import { changePassword as supabaseChangePassword } from '@/lib/supabase-auth';

export async function changePassword(currentPassword: string, newPassword: string) {
  try {
    const { data, error } = await supabaseChangePassword(newPassword);
    if (error) {
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message: string }).message;
      }
      return { success: false, error: errorMessage };
    }
    return { success: true };
  } catch (error: unknown) {
    console.error('Error changing password:', error);
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
