-- Add preferences column to newsletter_subscribers table
ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"frequency": "weekly", "categories": []}'::jsonb; 