-- Update RLS policies for newsletter tables
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow authenticated users to manage subscribers" ON newsletter_subscribers;
    DROP POLICY IF EXISTS "Allow authenticated users to manage newsletters" ON newsletters;
    DROP POLICY IF EXISTS "Allow authenticated users to manage newsletter sends" ON newsletter_sends;
    DROP POLICY IF EXISTS "Enable insert for all users" ON newsletter_subscribers;
    DROP POLICY IF EXISTS "Enable update for all users" ON newsletter_subscribers;
    DROP POLICY IF EXISTS "Enable read access for all users" ON newsletter_subscribers;
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON newsletters;
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON newsletter_sends;

    -- Create new policies for newsletter_subscribers
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'newsletter_subscribers'
        AND policyname = 'Enable insert for all users'
    ) THEN
        CREATE POLICY "Enable insert for all users" ON newsletter_subscribers
        FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'newsletter_subscribers'
        AND policyname = 'Enable update for all users'
    ) THEN
        CREATE POLICY "Enable update for all users" ON newsletter_subscribers
        FOR UPDATE USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'newsletter_subscribers'
        AND policyname = 'Enable read access for all users'
    ) THEN
        CREATE POLICY "Enable read access for all users" ON newsletter_subscribers
        FOR SELECT USING (true);
    END IF;

    -- Create policies for newsletters (admin only)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'newsletters'
        AND policyname = 'Enable all for authenticated users'
    ) THEN
        CREATE POLICY "Enable all for authenticated users" ON newsletters
        FOR ALL USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');
    END IF;

    -- Create policies for newsletter_sends (admin only)
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'newsletter_sends'
        AND policyname = 'Enable all for authenticated users'
    ) THEN
        CREATE POLICY "Enable all for authenticated users" ON newsletter_sends
        FOR ALL USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$; 