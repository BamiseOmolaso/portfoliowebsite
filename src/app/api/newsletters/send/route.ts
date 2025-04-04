import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { convert } from 'html-to-text';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';
import { randomBytes } from 'crypto';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

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

export const POST = withRateLimit(apiLimiter, 'newsletter-send', async (request: Request) => {
  try {
    const { newsletterId } = await request.json();

    if (!newsletterId) {
      return NextResponse.json(
        { error: 'Newsletter ID is required' },
        { status: 400 }
      );
    }

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
      .from('newsletter_subscribers')
      .select('id, email, name, unsubscribe_token')
      .eq('is_subscribed', true);

    if (subscribersError || !subscribers) {
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      );
    }

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
    const emailPromises = subscribers.map(async subscriber => {
      // Generate unsubscribe token if not exists
      if (!subscriber.unsubscribe_token) {
        const unsubscribeToken = randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date();
        tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30); // Token expires in 30 days

        await supabase
          .from('newsletter_subscribers')
          .update({ 
            unsubscribe_token: unsubscribeToken,
            unsubscribe_token_expires_at: tokenExpiresAt.toISOString()
          })
          .eq('id', subscriber.id);
      }

      const unsubscribeLink = `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?token=${subscriber.unsubscribe_token}`;
      const personalizedContent = sanitizedHtml.replace(
        /{name}/g,
        subscriber.name || 'there'
      );

      // Add unsubscribe link to the email content
      const emailContent = `
        ${personalizedContent}
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>You received this email because you subscribed to our newsletter.</p>
          <p>If you no longer wish to receive these emails, you can <a href="${unsubscribeLink}" style="color: #6c63ff;">unsubscribe here</a>.</p>
          <p style="font-size: 11px; color: #999;">This unsubscribe link will expire in 30 days for security reasons.</p>
        </div>
      `;

      return resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: subscriber.email,
        subject: newsletter.subject,
        html: emailContent,
        text: plainText + `\n\nTo unsubscribe, visit: ${unsubscribeLink}\n\nNote: This link will expire in 30 days.`,
        headers: {
          'List-Unsubscribe': `<${unsubscribeLink}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
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
});
