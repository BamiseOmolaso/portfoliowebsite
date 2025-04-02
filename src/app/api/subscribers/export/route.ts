import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Get all subscribers
    const { data: subscribers, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Convert to CSV format
    const csvContent = [
      ['Email', 'Name', 'Subscribed At'],
      ...subscribers.map(subscriber => [
        subscriber.email,
        subscriber.name || '',
        new Date(subscriber.created_at).toLocaleString(),
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    // Create response with CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="subscribers.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to export subscribers' },
      { status: 500 }
    );
  }
} 