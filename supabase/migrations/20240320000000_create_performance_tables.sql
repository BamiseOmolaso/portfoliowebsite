-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  metrics JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lcp_metrics table
CREATE TABLE IF NOT EXISTS lcp_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  value DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_lcp_metrics_timestamp ON lcp_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_lcp_metrics_url ON lcp_metrics(url);

-- Enable Row Level Security (RLS)
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lcp_metrics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'performance_metrics'
        AND policyname = 'Allow authenticated users to view performance metrics'
    ) THEN
        CREATE POLICY "Allow authenticated users to view performance metrics"
        ON performance_metrics FOR SELECT
        TO authenticated
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'performance_metrics'
        AND policyname = 'Allow authenticated users to insert performance metrics'
    ) THEN
        CREATE POLICY "Allow authenticated users to insert performance metrics"
        ON performance_metrics FOR INSERT
        TO authenticated
        WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'lcp_metrics'
        AND policyname = 'Allow authenticated users to view LCP metrics'
    ) THEN
        CREATE POLICY "Allow authenticated users to view LCP metrics"
        ON lcp_metrics FOR SELECT
        TO authenticated
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'lcp_metrics'
        AND policyname = 'Allow authenticated users to insert LCP metrics'
    ) THEN
        CREATE POLICY "Allow authenticated users to insert LCP metrics"
        ON lcp_metrics FOR INSERT
        TO authenticated
        WITH CHECK (true);
    END IF;
END
$$; 