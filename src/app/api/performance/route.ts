import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const metrics = await request.json();

    // Store metrics in Supabase
    const { error } = await supabase.from('performance_metrics').insert({
      metrics,
      url: request.headers.get('referer'),
      user_agent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('Error storing performance metrics:', error);
      return NextResponse.json({ error: 'Failed to store metrics' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing performance metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
