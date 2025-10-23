import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'customer' | 'staff' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Customer sign up
export async function signUpCustomer(data: SignUpData) {
  const { email, password, fullName, phone } = data;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'customer',
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('User creation failed');

  // Create customer profile
  const { error: profileError } = await supabase.from('customers').insert({
    id: authData.user.id,
    email,
    full_name: fullName,
    phone: phone || null,
  });

  if (profileError) throw profileError;

  return authData;
}

// Staff/Admin sign up (should only be done by admins)
export async function signUpStaff(data: SignUpData & { role: 'staff' | 'admin' }) {
  const { email, password, fullName, phone, role } = data;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('User creation failed');

  // Create staff profile
  const { error: profileError } = await supabase.from('staff_members').insert({
    id: authData.user.id,
    email,
    full_name: fullName,
    phone: phone || null,
    role,
    is_active: true,
  });

  if (profileError) throw profileError;

  return authData;
}

// Sign in
export async function signIn(data: SignInData) {
  const { email, password } = data;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return authData;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// Get current user with role
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session?.user) return null;

  const role = session.user.user_metadata?.role as UserRole;
  
  return {
    id: session.user.id,
    email: session.user.email!,
    role: role || 'customer',
    fullName: session.user.user_metadata?.full_name,
  };
}

// Check if user has specific role
export async function hasRole(requiredRole: UserRole | UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }

  return user.role === requiredRole;
}

// Reset password
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_PUBLIC_APP_URL}/reset-password`,
  });

  if (error) throw error;
}

// Update password
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });
}
