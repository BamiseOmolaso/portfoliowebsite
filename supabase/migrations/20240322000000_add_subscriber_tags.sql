-- Create tags table
CREATE TABLE IF NOT EXISTS newsletter_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriber_tags junction table
CREATE TABLE IF NOT EXISTS subscriber_tags (
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES newsletter_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (subscriber_id, tag_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriber_tags_subscriber_id ON subscriber_tags(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_subscriber_tags_tag_id ON subscriber_tags(tag_id);

-- Enable Row Level Security (RLS)
ALTER TABLE newsletter_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriber_tags ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'newsletter_tags'
        AND policyname = 'Allow authenticated users to manage tags'
    ) THEN
        CREATE POLICY "Allow authenticated users to manage tags"
        ON newsletter_tags FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'subscriber_tags'
        AND policyname = 'Allow authenticated users to manage subscriber tags'
    ) THEN
        CREATE POLICY "Allow authenticated users to manage subscriber tags"
        ON subscriber_tags FOR ALL
        TO authenticated
        USING (true)
        WITH CHECK (true);
    END IF;
END $$; 