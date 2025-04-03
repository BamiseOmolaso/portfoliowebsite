import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const { newsletterId, tags } = await request.json();

    if (!newsletterId) {
      return NextResponse.json({ error: 'Newsletter ID is required' }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Get the newsletter
    const { data: newsletter, error: newsletterError } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', newsletterId)
      .single();

    if (newsletterError) {
      console.error('Error fetching newsletter:', newsletterError);
      return NextResponse.json({ error: 'Failed to fetch newsletter' }, { status: 500 });
    }
    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    // Get subscribers based on tags if provided
    let subscribersQuery = supabase.from('newsletter_subscribers').select('*');

    if (tags && tags.length > 0) {
      const { data: taggedSubscribers } = await supabase
        .from('subscriber_tags')
        .select('subscriber_id')
        .in('tag_id', tags);

      if (taggedSubscribers && taggedSubscribers.length > 0) {
        subscribersQuery = subscribersQuery.in(
          'id',
          taggedSubscribers.map(st => st.subscriber_id)
        );
      } else {
        return NextResponse.json(
          { error: 'No subscribers found with selected tags' },
          { status: 404 }
        );
      }
    }

    const { data: subscribers, error: subscribersError } = await subscribersQuery;

    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No subscribers found' }, { status: 404 });
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send emails to all subscribers
    for (const subscriber of subscribers) {
      try {
        // Check if newsletter_sends record already exists
        const { data: existingSend } = await supabase
          .from('newsletter_sends')
          .select('id')
          .eq('newsletter_id', newsletterId)
          .eq('subscriber_id', subscriber.id)
          .single();

        if (existingSend) {
          console.log(`Newsletter already sent to ${subscriber.email}, skipping...`);
          continue;
        }

        // Create newsletter_sends record
        const { error: sendError } = await supabase.from('newsletter_sends').insert([
          {
            newsletter_id: newsletterId,
            subscriber_id: subscriber.id,
            status: 'pending',
          },
        ]);

        if (sendError) throw sendError;

        // Send the email with Resend
        const { data, error } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'newsletter@resend.dev',
          to: subscriber.email,
          subject: newsletter.subject,
          html: newsletter.content || '<p>No content available</p>',
          text: newsletter.content.replace(/<[^>]*>/g, ''),
          // Add tracking and analytics
          headers: {
            'X-Entity-Ref-ID': newsletterId,
          },
        });

        if (error) {
          throw error;
        }

        // Update newsletter_sends status
        await supabase
          .from('newsletter_sends')
          .update({ status: 'sent' })
          .eq('newsletter_id', newsletterId)
          .eq('subscriber_id', subscriber.id);
      } catch (err) {
        console.error(`Failed to send to ${subscriber.email}:`, err);
        // Update newsletter_sends status with error
        await supabase
          .from('newsletter_sends')
          .update({
            status: 'failed',
            error_message: err instanceof Error ? err.message : 'Unknown error',
          })
          .eq('newsletter_id', newsletterId)
          .eq('subscriber_id', subscriber.id);
      }
    }

    // Update newsletter status
    await supabase
      .from('newsletters')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', newsletterId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return NextResponse.json({ error: 'Failed to send newsletter' }, { status: 500 });
  }
}
