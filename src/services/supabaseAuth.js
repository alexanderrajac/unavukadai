import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://efncxyhwgxozdzcbpgjy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbmN4eWh3Z3hvemR6Y2JwZ2p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MTg5MjUsImV4cCI6MjEwNjA5NDkyNX0.Pt2h--CxM01KP8dQ-BOzUyJH2pmOACbzz6KSLOjctNk';

export const SUPABASE_OAUTH_CLIENT_ID = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_OAUTH_CLIENT_ID) || 
  '32fe1233-09e8-4538-a822-6324b7bbaf5a';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Check if Google Provider is enabled in the Supabase Dashboard
export async function checkGoogleProviderStatus() {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/authorize?provider=google`, {
      method: 'GET'
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        enabled: false,
        code: data.code || res.status,
        msg: data.msg || 'Unsupported provider: provider is not enabled'
      };
    }
    return { enabled: true };
  } catch {
    // If network or CORS, assume not enabled for external redirect
    return { enabled: false, msg: 'Unable to connect to Supabase OAuth endpoint' };
  }
}

// Trigger Supabase Google OAuth login flow with callback to current origin
export async function signInWithGoogleOAuth(options = {}) {
  try {
    const redirectUrl = options.redirectTo || (typeof window !== 'undefined' ? window.location.origin : '');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) {
      console.warn('Supabase Google OAuth error:', error.message);
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
