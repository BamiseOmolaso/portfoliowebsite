-- Add preferences token columns to newsletter_subscribers table
ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS preferences_token TEXT,
ADD COLUMN IF NOT EXISTS preferences_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for preferences_token
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_preferences_token 
ON newsletter_subscribers(preferences_token); 