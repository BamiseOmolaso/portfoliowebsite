-- Create newsletter_subscribers table if it doesn't exist
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletters table
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, scheduled, sent
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletter_sends table to track which subscribers received which newsletters
CREATE TABLE IF NOT EXISTS newsletter_sends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  UNIQUE(newsletter_id, subscriber_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_scheduled_for ON newsletters(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_newsletter_sends_status ON newsletter_sends(status);

-- Enable Row Level Security (RLS)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'newsletter_subscribers'
        AND policyname = 'Allow authenticated users to manage subscribers'
    ) THEN
        CREATE POLICY "Allow authenticated users to manage subscribers"
        ON newsletter_subscribers FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'newsletters'
        AND policyname = 'Allow authenticated users to manage newsletters'
    ) THEN
        CREATE POLICY "Allow authenticated users to manage newsletters"
        ON newsletters FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'newsletter_sends'
        AND policyname = 'Allow authenticated users to manage newsletter sends'
    ) THEN
        CREATE POLICY "Allow authenticated users to manage newsletter sends"
        ON newsletter_sends FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$; 