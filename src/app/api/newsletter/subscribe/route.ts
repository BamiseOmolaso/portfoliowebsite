import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/resend';
import { sendAdminNotification } from '@/lib/resend';
import { withRateLimit, apiLimiter } from '@/lib/rate-limit';
import { 
  isIPBlacklisted, 
  blacklistIP, 
  trackFailedAttempt, 
  isCaptchaRequired, 
  verifyCaptcha 
} from '@/lib/security';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Input validation and sanitization
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

function validateInputs(email: string, name: string): { isValid: boolean; error?: string } {
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { isValid: false, error: 'Please provide a valid email address' };
  }

  // Email length check
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  // Name validation (if provided)
  if (name) {
    if (name.length > 100) {
      return { isValid: false, error: 'Name is too long' };
    }
    if (!/^[a-zA-Z\s-']+$/.test(name)) {
      return { isValid: false, error: 'Name contains invalid characters' };
    }
  }

  return { isValid: true };
}

async function getLocationFromIP(ip: string) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`https://ip-api.com/json/${ip}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('IP geolocation rate limit reached');
        return 'Unknown';
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.country || 'Unknown';
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('IP geolocation request timed out');
    } else {
      console.error('Error fetching location:', error);
    }
    return 'Unknown';
  }
}

export const POST = withRateLimit(apiLimiter, 'newsletter-subscribe', async (request: Request) => {
  try {
    const body = await request.json();
    const { email, name, captchaToken } = body;

    // Get user's IP address and user agent
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if IP is blacklisted
    if (await isIPBlacklisted(ip)) {
      return NextResponse.json(
        { error: 'Access denied. Please contact support if you believe this is an error.' },
        { status: 403 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = name ? sanitizeInput(name) : '';

    // Validate inputs
    const validation = validateInputs(sanitizedEmail, sanitizedName);
    if (!validation.isValid) {
      await trackFailedAttempt(ip, sanitizedEmail, userAgent);
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check if CAPTCHA is required
    if (await isCaptchaRequired(ip, sanitizedEmail)) {
      if (!captchaToken) {
        return NextResponse.json(
          { error: 'CAPTCHA verification required', requiresCaptcha: true },
          { status: 400 }
        );
      }

      // Verify CAPTCHA
      const isCaptchaValid = await verifyCaptcha(captchaToken);
      if (!isCaptchaValid) {
        await trackFailedAttempt(ip, sanitizedEmail, userAgent);
        return NextResponse.json(
          { error: 'Invalid CAPTCHA. Please try again.', requiresCaptcha: true },
          { status: 400 }
        );
      }
    }

    // Check if subscriber already exists
    const { data: existingSubscriber, error: fetchError } = await supabase
      .from('newsletter_subscribers')
      .select('is_subscribed, unsubscribe_reason, subscription_count')
      .eq('email', sanitizedEmail)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking subscriber:', fetchError);
      return NextResponse.json(
        { error: 'Failed to check subscription status' },
        { status: 500 }
      );
    }

    if (existingSubscriber?.is_subscribed) {
      return NextResponse.json(
        { error: 'You are already subscribed to our newsletter' },
        { status: 400 }
      );
    }

    // Generate tokens
    const unsubscribeToken = crypto.randomUUID();
    const preferencesToken = crypto.randomUUID();
    const tokenExpiration = new Date();
    tokenExpiration.setDate(tokenExpiration.getDate() + 30); // 30 days from now

    // Get location
    const location = await getLocationFromIP(ip);

    // Insert or update subscriber
    const { data: subscriber, error: upsertError } = await supabase
      .from('newsletter_subscribers')
      .upsert({
        email: sanitizedEmail,
        name: sanitizedName,
        is_subscribed: true,
        unsubscribe_token: unsubscribeToken,
        preferences_token: preferencesToken,
        unsubscribe_token_expires_at: tokenExpiration,
        preferences_token_expires_at: tokenExpiration,
        location,
        preferences: {
          frequency: 'weekly',
          categories: []
        },
        last_updated_at: new Date().toISOString(),
        subscription_count: existingSubscriber ? (existingSubscriber.subscription_count || 0) + 1 : 1
      }, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Error upserting subscriber:', upsertError);
      return NextResponse.json(
        { error: 'Failed to subscribe to newsletter' },
        { status: 500 }
      );
    }

    // Send welcome email
    await sendWelcomeEmail(sanitizedEmail, sanitizedName, unsubscribeToken, preferencesToken);

    // Send admin notification
    await sendAdminNotification(sanitizedEmail, sanitizedName);

    return NextResponse.json(
      { message: 'Successfully subscribed to newsletter' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in subscribe route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
