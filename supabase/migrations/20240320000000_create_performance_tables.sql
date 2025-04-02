-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metrics JSONB NOT NULL,
  url TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lcp_metrics table
CREATE TABLE IF NOT EXISTS lcp_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  value NUMERIC NOT NULL,
  url TEXT NOT NULL,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_lcp_metrics_timestamp ON lcp_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_lcp_metrics_url ON lcp_metrics(url);

-- Set up Row Level Security (RLS)
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lcp_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to view performance metrics"
  ON performance_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to view LCP metrics"
  ON lcp_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert for performance metrics"
  ON performance_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow insert for LCP metrics"
  ON lcp_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true); 