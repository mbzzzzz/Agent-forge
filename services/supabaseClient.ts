import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Always log in both dev and prod for debugging
console.log('Supabase Config Check:', {
  url: supabaseUrl ? '✅ Set' : '❌ MISSING',
  key: supabaseAnonKey ? '✅ Set' : '❌ MISSING',
  urlValue: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'N/A'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing Supabase environment variables!', {
    url: supabaseUrl ? 'Set' : 'MISSING',
    key: supabaseAnonKey ? 'Set' : 'MISSING',
    allEnvVars: Object.keys(import.meta.env).filter(k => k.includes('SUPABASE'))
  });
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not set! Check Vercel environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    flowType: 'pkce',
  },
});

// Debug: Log connection status
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection error:', error);
  } else {
    console.log('✅ Supabase connected successfully', {
      hasSession: !!data.session,
      userEmail: data.session?.user?.email || 'No user'
    });
  }
}).catch(err => {
  console.error('❌ Failed to get Supabase session:', err);
});


