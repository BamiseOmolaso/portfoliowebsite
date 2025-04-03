import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
  } catch (error) {
    console.error('Error processing LCP metric:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
