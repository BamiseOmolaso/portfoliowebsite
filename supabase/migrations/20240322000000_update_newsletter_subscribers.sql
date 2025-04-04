-- Add new columns to newsletter_subscribers table
ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT,
ADD COLUMN IF NOT EXISTS unsubscribe_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS unsubscribe_reason TEXT,
ADD COLUMN IF NOT EXISTS unsubscribe_feedback TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Create index for unsubscribe_token
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_unsubscribe_token 
ON newsletter_subscribers(unsubscribe_token);

-- Create index for is_subscribed
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_is_subscribed 
ON newsletter_subscribers(is_subscribed);

-- Update RLS policies to allow public access for subscription operations
DROP POLICY IF EXISTS "Allow authenticated users to manage subscribers" ON newsletter_subscribers;
CREATE POLICY "Allow public subscription operations" ON newsletter_subscribers
FOR ALL USING (true) WITH CHECK (true); 