-- Add audit logging columns
ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_reason TEXT;

-- Create audit log table
CREATE TABLE IF NOT EXISTS newsletter_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_id UUID REFERENCES newsletter_subscribers(id),
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_newsletter_audit_log_subscriber_id 
ON newsletter_audit_log(subscriber_id);

CREATE INDEX IF NOT EXISTS idx_newsletter_audit_log_created_at 
ON newsletter_audit_log(created_at);

-- Create function to update audit log
CREATE OR REPLACE FUNCTION log_newsletter_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO newsletter_audit_log (
        subscriber_id,
        action,
        details,
        ip_address,
        user_agent
    ) VALUES (
        NEW.id,
        CASE
            WHEN TG_OP = 'INSERT' THEN 'subscribe'
            WHEN TG_OP = 'UPDATE' THEN 
                CASE 
                    WHEN NEW.is_subscribed = false AND OLD.is_subscribed = true THEN 'unsubscribe'
                    WHEN NEW.is_subscribed = true AND OLD.is_subscribed = false THEN 'resubscribe'
                    ELSE 'update'
                END
            WHEN TG_OP = 'DELETE' THEN 'delete'
        END,
        jsonb_build_object(
            'email', NEW.email,
            'name', NEW.name,
            'is_subscribed', NEW.is_subscribed,
            'location', NEW.location,
            'preferences', NEW.preferences
        ),
        current_setting('request.headers')::json->>'x-forwarded-for',
        current_setting('request.headers')::json->>'user-agent'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS newsletter_audit_trigger ON newsletter_subscribers;
CREATE TRIGGER newsletter_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION log_newsletter_activity();

-- Update RLS policies to include audit log
ALTER TABLE newsletter_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read audit log" ON newsletter_audit_log
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow system to write audit log" ON newsletter_audit_log
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Update existing RLS policies to include soft delete
DROP POLICY IF EXISTS "Allow public subscription operations" ON newsletter_subscribers;
CREATE POLICY "Allow public subscription operations" ON newsletter_subscribers
    FOR ALL USING (NOT is_deleted) WITH CHECK (NOT is_deleted); 