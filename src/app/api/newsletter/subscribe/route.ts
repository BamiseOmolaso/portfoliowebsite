import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';
import { sendWelcomeEmail } from '@/lib/resend';

export const POST = withRateLimit(
  apiLimiter,
  'newsletter-subscribe',
  async (request: Request) => {
    try {
      const { email, name } = await request.json();

      // Validate email
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: 'Please provide a valid email address' },
          { status: 400 }
        );
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
          },
        }
      );

      // Check if subscriber already exists
      const { data: existingSubscriber } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', email)
        .single();

      if (existingSubscriber) {
        return NextResponse.json(
          { error: 'You are already subscribed to the newsletter' },
          { status: 400 }
        );
      }

      // Insert the email into the newsletter_subscribers table
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email, name }]);

      if (error) {
        console.error('Error subscribing to newsletter:', error);
        return NextResponse.json(
          { error: 'Failed to subscribe to newsletter' },
          { status: 500 }
        );
      }

      // Send welcome email
      try {
        await sendWelcomeEmail(email, name);
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail the subscription if the welcome email fails
      }

      return NextResponse.json(
        { message: 'Successfully subscribed to newsletter' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error processing newsletter subscription:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
); 