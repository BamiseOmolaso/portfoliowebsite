import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import DOMPurify from 'isomorphic-dompurify';

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
        // Check if we've already sent this newsletter to this subscriber
        const { data: existingSend } = await supabase
          .from('newsletter_sends')
          .select('id')
          .eq('newsletter_id', newsletterId)
          .eq('subscriber_id', subscriber.id)
          .single();

        if (existingSend) {
          console.log(`Newsletter already sent to ${subscriber.email}`);
          continue;
        }

        // Sanitize HTML content
        const sanitizedHtml = DOMPurify.sanitize(newsletter.content || '<p>No content available</p>', {
          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a'],
          ALLOWED_ATTR: ['href', 'target', 'rel'],
        });

        // Create plain text version
        const plainText = sanitizedHtml
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();

        // Send email
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: 'Bamise Omolaso <davidbams3@gmail.com>',
          to: subscriber.email,
          subject: newsletter.subject,
          html: sanitizedHtml,
          text: plainText,
        });

        if (emailError) {
          throw emailError;
        }

        // Record the send
        const { error: sendError } = await supabase.from('newsletter_sends').insert([
          {
            newsletter_id: newsletterId,
            subscriber_id: subscriber.id,
            status: 'sent',
            sent_at: new Date().toISOString(),
          },
        ]);

        if (sendError) {
          throw sendError;
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
        console.error(`Error sending to ${subscriber.email}:`, errorMessage);
        
        // Record the failed send
        await supabase.from('newsletter_sends').insert([
          {
            newsletter_id: newsletterId,
            subscriber_id: subscriber.id,
            status: 'failed',
            error: errorMessage,
            sent_at: new Date().toISOString(),
          },
        ]);
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
  } catch (err: unknown) {
    console.error('Error sending newsletter:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}
