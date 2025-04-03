import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Verify environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Required environment variables are not set');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { value, url } = await request.json();

    // Store LCP metric in Supabase
    const { error } = await supabase.from('lcp_metrics').insert({
      value,
      url,
      user_agent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('Error storing LCP metric:', error);
      return NextResponse.json({ error: 'Failed to store LCP metric' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Error processing LCP metric:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
