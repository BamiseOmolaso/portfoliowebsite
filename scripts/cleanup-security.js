require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing required environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runCleanup() {
  try {
    console.log('Running security cleanup...');
    
    const { data, error } = await supabase.rpc('cleanup_security_tables');
    
    if (error) {
      console.error('Error running cleanup:', error);
      return;
    }

    // Get security status
    const { data: status, error: statusError } = await supabase
      .from('security_status')
      .select('*')
      .single();

    if (statusError) {
      console.error('Error getting security status:', statusError);
      return;
    }

    console.log('Security cleanup completed:', {
      timestamp: new Date().toISOString(),
      blacklistedIPs: status.blacklisted_ips_count,
      recentFailedAttempts: status.recent_failed_attempts,
      expiredBlacklists: status.expired_blacklists
    });
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run cleanup immediately
runCleanup();

// Run cleanup every hour
setInterval(runCleanup, 60 * 60 * 1000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping security cleanup...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping security cleanup...');
  process.exit(0);
}); 