-- Add unsubscribe-related fields to newsletter_subscribers table
ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS unsubscribe_token VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS unsubscribe_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS unsubscribe_reason VARCHAR(50),
ADD COLUMN IF NOT EXISTS unsubscribe_feedback TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_is_subscribed ON newsletter_subscribers(is_subscribed);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_unsubscribe_token ON newsletter_subscribers(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_unsubscribe_token_expires ON newsletter_subscribers(unsubscribe_token_expires_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_unsubscribe_reason ON newsletter_subscribers(unsubscribe_reason); 