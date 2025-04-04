-- Create blacklisted IPs table
CREATE TABLE IF NOT EXISTS blacklisted_ips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by TEXT DEFAULT 'system'
);

-- Create failed attempts table
CREATE TABLE IF NOT EXISTS failed_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL,
    email TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    action_type TEXT NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blacklisted_ips_ip_address 
ON blacklisted_ips(ip_address);

CREATE INDEX IF NOT EXISTS idx_blacklisted_ips_expires_at 
ON blacklisted_ips(expires_at);

CREATE INDEX IF NOT EXISTS idx_failed_attempts_ip_address 
ON failed_attempts(ip_address);

CREATE INDEX IF NOT EXISTS idx_failed_attempts_email 
ON failed_attempts(email);

CREATE INDEX IF NOT EXISTS idx_failed_attempts_timestamp 
ON failed_attempts(timestamp);

-- Enable RLS
ALTER TABLE blacklisted_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow system to manage blacklisted IPs" ON blacklisted_ips
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow system to manage failed attempts" ON failed_attempts
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_security_tables()
RETURNS void AS $$
BEGIN
    -- Remove expired blacklisted IPs
    DELETE FROM blacklisted_ips
    WHERE expires_at < CURRENT_TIMESTAMP;

    -- Remove failed attempts older than 24 hours
    DELETE FROM failed_attempts
    WHERE timestamp < CURRENT_TIMESTAMP - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view to monitor security status
CREATE OR REPLACE VIEW security_status AS
SELECT 
    (SELECT COUNT(*) FROM blacklisted_ips) as blacklisted_ips_count,
    (SELECT COUNT(*) FROM failed_attempts 
     WHERE timestamp > CURRENT_TIMESTAMP - INTERVAL '1 hour') as recent_failed_attempts,
    (SELECT COUNT(*) FROM blacklisted_ips 
     WHERE expires_at < CURRENT_TIMESTAMP) as expired_blacklists; 