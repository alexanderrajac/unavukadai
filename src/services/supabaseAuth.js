import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://efncxyhwgxozdzcbpgjy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbmN4eWh3Z3hvemR6Y2JwZ2p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MTg5MjUsImV4cCI6MjEwNjA5NDkyNX0.Pt2h--CxM01KP8dQ-BOzUyJH2pmOACbzz6KSLOjctNk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Trigger real Supabase Google OAuth login flow
export async function signInWithGoogleOAuth() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      console.warn('Supabase Google OAuth initialization notice:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.warn('Google OAuth exception:', err.message);
    return { success: false, error: err.message };
  }
}

// Sign out from Supabase Auth
export async function signOutSupabase() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase sign out error:', err.message);
  }
}

// Listen for Supabase Auth state changes
export function subscribeToAuthChanges(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return subscription;
}
