import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch all subscribers with their tags
    const { data: subscribers, error: subscribersError } = await supabase
      .from('newsletter_subscribers')
      .select(`
        *,
        subscriber_tags (
          tag:newsletter_tags (
            id,
            name,
            description
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (subscribersError) {
      throw subscribersError;
    }

    // Convert to CSV format
    const headers = ['Email', 'Name', 'Subscribed At', 'Tags'];
    const rows = subscribers.map(subscriber => {
      const tags = subscriber.subscriber_tags
        .map((st: any) => st.tag.name)
        .join('; ');
      return [
        subscriber.email,
        subscriber.name || '',
        new Date(subscriber.created_at).toLocaleString(),
        tags,
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Create response with CSV content
    const response = new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="subscribers.csv"',
      },
    });

    return response;
  } catch (err: unknown) {
    console.error('Error exporting subscribers:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to export subscribers' },
      { status: 500 }
    );
  }
}
