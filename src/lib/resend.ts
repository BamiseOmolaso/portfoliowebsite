import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'newsletter@resend.dev',
      to: email,
      subject: 'Welcome to My Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5;">Welcome${name ? ` ${name}` : ''}!</h1>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            Thank you for subscribing to my newsletter! 🎉
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            You'll now receive updates about my latest projects, blog posts, and other exciting content.
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            If you have any questions or suggestions, feel free to reply to this email.
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #333; margin-top: 20px;">
            Best regards,<br>
            Oluwabamise Omolaso
          </p>
        </div>
      `,
      text: `Welcome${name ? ` ${name}` : ''}!\n\nThank you for subscribing to my newsletter! 🎉\n\nYou'll now receive updates about my latest projects, blog posts, and other exciting content.\n\nIf you have any questions or suggestions, feel free to reply to this email.\n\nBest regards,\nYour Name`,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    throw error;
  }
}

export async function sendAdminNotification(email: string, name?: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'newsletter@resend.dev',
      to: process.env.CONTACT_EMAIL || 'davidbams3@gmail.com',
      subject: '🎉 New Newsletter Subscriber!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5;">New Newsletter Subscriber!</h1>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; line-height: 1.5; color: #333; margin: 0;">
              <strong>Email:</strong> ${email}
            </p>
            ${name ? `
            <p style="font-size: 16px; line-height: 1.5; color: #333; margin: 10px 0 0 0;">
              <strong>Name:</strong> ${name}
            </p>
            ` : ''}
            <p style="font-size: 16px; line-height: 1.5; color: #333; margin: 10px 0 0 0;">
              <strong>Subscribed at:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            A new subscriber has joined your newsletter! 🎉
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending admin notification:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in sendAdminNotification:', error);
    throw error;
  }
}

export { resend };
