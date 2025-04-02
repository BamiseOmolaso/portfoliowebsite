import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import pool from '@/lib/db';
import { ratelimit } from '@/lib/rate-limit';
import { sendContactEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'anonymous';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many requests. Please try again later.',
          limit,
          reset,
          remaining,
        },
        { status: 429 }
      );
    }

    const { name, email, subject, message } = await request.json();

    // Validate input
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

    // Insert into database
    const [result] = await pool.execute(
      'INSERT INTO contact_messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())',
      [name, email, subject, message]
    );

    // Send email notification
    await sendContactEmail({ name, email, subject, message });

    return NextResponse.json(
      { 
        message: 'Message sent successfully',
        limit,
        reset,
        remaining,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 