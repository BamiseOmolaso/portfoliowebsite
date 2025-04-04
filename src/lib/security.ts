import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// IP blacklist table structure
interface BlacklistedIP {
  id: string;
  ip_address: string;
  reason: string;
  created_at: string;
  expires_at: string | null;
}

// Track failed attempts
interface FailedAttempt {
  ip_address: string;
  email: string;
  timestamp: string;
  user_agent: string;
}

// Check if IP is blacklisted
export async function isIPBlacklisted(ip: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('blacklisted_ips')
    .select('*')
    .eq('ip_address', ip)
    .is('expires_at', null)
    .or('expires_at.gt.now()')
    .single();

  if (error || !data) return false;
  return true;
}

// Add IP to blacklist
export async function blacklistIP(ip: string, reason: string, durationHours: number = 24): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + durationHours);

  await supabase.from('blacklisted_ips').insert({
    ip_address: ip,
    reason,
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString()
  });
}

// Track failed attempt
export async function trackFailedAttempt(ip: string, email: string, userAgent: string): Promise<void> {
  await supabase.from('failed_attempts').insert({
    ip_address: ip,
    email,
    timestamp: new Date().toISOString(),
    user_agent: userAgent
  });
}

// Check if CAPTCHA is required
export async function isCaptchaRequired(ip: string, email: string): Promise<boolean> {
  // Check recent failed attempts
  const { data: recentAttempts } = await supabase
    .from('failed_attempts')
    .select('timestamp')
    .or(`ip_address.eq.${ip},email.eq.${email}`)
    .order('timestamp', { ascending: false })
    .limit(5);

  if (!recentAttempts || recentAttempts.length < 3) return false;

  const oldestAttempt = new Date(recentAttempts[recentAttempts.length - 1].timestamp);
  const now = new Date();
  const hoursSinceOldest = (now.getTime() - oldestAttempt.getTime()) / (1000 * 60 * 60);

  return hoursSinceOldest < 1; // Require CAPTCHA if 3+ attempts in last hour
}

// Verify CAPTCHA token
export async function verifyCaptcha(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error);
    return false;
  }
}

// Clean up old records
export async function cleanupOldRecords(): Promise<void> {
  // Remove expired blacklisted IPs
  await supabase
    .from('blacklisted_ips')
    .delete()
    .lt('expires_at', new Date().toISOString());

  // Remove failed attempts older than 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  await supabase
    .from('failed_attempts')
    .delete()
    .lt('timestamp', oneDayAgo.toISOString());
} 