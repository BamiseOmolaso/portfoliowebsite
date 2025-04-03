import { createServerClient, CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Required environment variables are not set');
}

const SUPABASE_URL = supabaseUrl as string;
const SUPABASE_ANON_KEY = supabaseAnonKey as string;

export async function checkAuth() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
          },
        },
      }
    );

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session) {
      redirect('/login');
    }

    return session;
  } catch (err: unknown) {
    console.error('Auth error:', err instanceof Error ? err.message : err);
    redirect('/login');
  }
}

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          // 🔧 ADDED: parse JSON safely
          try {
            const cookie = cookieStore.get(name)?.value;
            return cookie ? JSON.parse(cookie) : undefined;
          } catch (err) {
            console.error('Error parsing cookie:', err);
            return undefined;
          }
        },
        set(name: string, value: any, options: CookieOptions) {
          // 🔧 CHANGED: store as JSON
          try {
            cookieStore.set({ name, value: JSON.stringify(value), ...options });
          } catch (error) {
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', expires: new Date(0), ...options });
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (err: unknown) {
    console.error('Sign in error:', err instanceof Error ? err.message : err);
    throw err;
  }
}

export async function signOut() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
          },
        },
      }
    );

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err: unknown) {
    console.error('Sign out error:', err instanceof Error ? err.message : err);
    throw err;
  }
}