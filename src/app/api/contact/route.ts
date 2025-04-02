import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { withRateLimit, contactFormLimiter } from '@/lib/rate-limit';

export const POST = withRateLimit(
  contactFormLimiter,
  'contact-form',
  async (request: Request) => {
    try {
      const { name, email, subject, message } = await request.json();

      // Validate required fields
      if (!name || !email || !subject || !message) {
        return NextResponse.json(
          { error: 'All fields are required' },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }

      const supabase = createServerComponentClient({ cookies });

      // Insert the message into the contact_messages table
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name,
            email,
            subject,
            message,
          },
        ]);

      if (error) {
        console.error('Error inserting message:', error);
        return NextResponse.json(
          { error: 'Failed to send message' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'Message sent successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error processing contact form:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
); 