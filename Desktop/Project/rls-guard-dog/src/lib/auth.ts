import { createSupabaseServerClient } from './supabase';

// Check if the current user is authenticated
export async function isAuthenticated() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

// Get the current user's session
export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Get the current user's profile including role
export async function getUserProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  return profile;
}

// Check if the current user is a teacher
export async function isTeacher() {
  const profile = await getUserProfile();
  return profile?.role === 'teacher';
}

// Check if the current user is a student
export async function isStudent() {
  const profile = await getUserProfile();
  return profile?.role === 'student';
}

// Middleware to redirect unauthenticated users
export async function requireAuth(redirectTo = '/login') {
  const isAuthed = await isAuthenticated();
  
  if (!isAuthed) {
    return Response.redirect(new URL(redirectTo, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  }
  
  return null;
}

// Middleware to redirect users who are not teachers
export async function requireTeacher(redirectTo = '/dashboard') {
  const isAuthed = await isAuthenticated();
  
  if (!isAuthed) {
    return Response.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  }
  
  const teacher = await isTeacher();
  
  if (!teacher) {
    return Response.redirect(new URL(redirectTo, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  }
  
  return null;
}

// Middleware to redirect users who are not students
export async function requireStudent(redirectTo = '/dashboard') {
  const isAuthed = await isAuthenticated();
  
  if (!isAuthed) {
    return Response.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  }
  
  const student = await isStudent();
  
  if (!student) {
    return Response.redirect(new URL(redirectTo, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  }
  
  return null;
}