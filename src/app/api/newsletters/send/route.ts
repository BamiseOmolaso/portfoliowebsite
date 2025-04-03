import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { convert } from 'html-to-text';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Secure HTML sanitization and text conversion utility
const sanitizeAndConvertToText = (dirtyHtml: string): string => {
  // Step 1: Sanitize HTML
  const { window } = new JSDOM('');
  const cleanHtml = DOMPurify(window).sanitize(dirtyHtml, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe'],
    FORBID_ATTR: ['on*'], // Block all event handlers
  });

  // Step 2: Convert to plain text
  const plainText = convert(cleanHtml, {
    wordwrap: 130,
    selectors: [
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
      { selector: 'img', format: 'skip' }
    ]
  });

  // Step 3: Verify no HTML tags remain
  if (/<[a-z][\s\S]*>/i.test(plainText)) {
    throw new Error('Security: HTML tags detected in plaintext output');
  }

  return plainText;
};

export const POST = async (request: Request) => {
  try {
    const { newsletterId } = await request.json();

    if (!newsletterId) {
      return NextResponse.json(
        { error: 'Newsletter ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Get newsletter content
    const { data: newsletter, error: newsletterError } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', newsletterId)
      .single();

    if (newsletterError || !newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // Get subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('email, name')
      .eq('status', 'active');

    if (subscribersError || !subscribers) {
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

    // Initialize Resend client
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Sanitize HTML content
    const { window } = new JSDOM('');
    const sanitizedHtml = DOMPurify(window).sanitize(newsletter.content, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ['script', 'style', 'iframe'],
      FORBID_ATTR: ['on*'],
    });

    // Create plain text version using the secure utility
    const plainText = sanitizeAndConvertToText(sanitizedHtml);

    // Send emails to subscribers
    const emailPromises = subscribers.map(subscriber => {
      const personalizedContent = sanitizedHtml.replace(
        /{name}/g,
        subscriber.name || 'there'
      );

      return resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: subscriber.email,
        subject: newsletter.subject,
        html: personalizedContent,
        text: plainText,
      });
    });

    await Promise.all(emailPromises);

    // Update newsletter status
    const { error: updateError } = await supabase
      .from('newsletters')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', newsletterId);

    if (updateError) {
      console.error('Error updating newsletter status:', updateError);
    }

    return NextResponse.json({ message: 'Newsletter sent successfully' });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to send newsletter' },
      { status: 500 }
    );
  }
};
