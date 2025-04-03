import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { withRateLimit, contactFormLimiter } from '@/lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

export const POST = withRateLimit(contactFormLimiter, 'contact-form', async (request: Request) => {
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

    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Insert into Supabase
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert([
        {
          name,
          email,
          subject,
          message
        }
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Generate a personalized response based on the subject and message content
    const responseMessage = generatePersonalizedResponse(name, subject, message);

    // Send email notification to admin
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: process.env.CONTACT_EMAIL || 'your-email@example.com',
        subject: `New Contact Form Submission: ${subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        `
      });
    } catch (emailError) {
      console.error('Admin email error:', emailError);
      // Don't return error here since the message was saved to the database
    }

    // Send response email to the user
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: `Re: ${subject}`,
        html: responseMessage
      });
    } catch (responseEmailError) {
      console.error('Response email error:', responseEmailError);
      // Don't return error here since the message was saved to the database
    }

    return NextResponse.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
});

// Function to generate a personalized response based on the subject and message content
function generatePersonalizedResponse(name: string, subject: string, message: string): string {
  // Extract the first name for a more personal touch
  const firstName = name.split(' ')[0];
  
  // Check for keywords in the subject and message to customize the response
  const lowerSubject = subject.toLowerCase();
  const lowerMessage = message.toLowerCase();
  
  let responseContent = '';
  
  // Check for job opportunities or collaboration requests
  if (lowerSubject.includes('job') || lowerSubject.includes('opportunity') || 
      lowerSubject.includes('collaboration') || lowerSubject.includes('work together') ||
      lowerMessage.includes('job') || lowerMessage.includes('opportunity') || 
      lowerMessage.includes('collaboration') || lowerMessage.includes('work together')) {
    responseContent = `
      <p>Thank you for your interest in working together! I'm always excited to explore new opportunities and collaborations.</p>
      <p>I've received your message and will review it carefully. I'll get back to you with more specific information about how we might work together.</p>
      <p>In the meantime, feel free to check out my portfolio to see more of my work.</p>
    `;
  } 
  // Check for project inquiries
  else if (lowerSubject.includes('project') || lowerMessage.includes('project')) {
    responseContent = `
      <p>Thank you for your interest in my projects! I appreciate you taking the time to reach out.</p>
      <p>I've received your message and will review it carefully. I'll get back to you with more specific information about the project you mentioned.</p>
      <p>If you have any specific requirements or questions in the meantime, feel free to send a follow-up email.</p>
    `;
  }
  // Check for general questions or support
  else if (lowerSubject.includes('question') || lowerSubject.includes('help') || 
           lowerMessage.includes('question') || lowerMessage.includes('help')) {
    responseContent = `
      <p>Thank you for your question! I appreciate you taking the time to reach out.</p>
      <p>I've received your message and will review it carefully. I'll get back to you with a detailed response as soon as possible.</p>
      <p>If you have any additional questions in the meantime, feel free to send a follow-up email.</p>
    `;
  }
  // Default response for other types of messages
  else {
    responseContent = `
      <p>Thank you for reaching out! I appreciate you taking the time to contact me.</p>
      <p>I've received your message and will review it carefully. I'll get back to you with a more detailed response as soon as possible.</p>
      <p>If you have any additional information to share in the meantime, feel free to send a follow-up email.</p>
    `;
  }
  
  // Construct the full email with a professional signature
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2 style="color: #4f46e5;">Thank you for your message, ${firstName}!</h2>
      
      ${responseContent}
      
      <p>Best regards,<br>Oluwabamise Omolaso</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>This is an automated response to your contact form submission. I'll respond more personally soon.</p>
      </div>
    </div>
  `;
}
