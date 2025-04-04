import { createBrowserClient } from '@supabase/ssr';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createBrowserClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing connection to Supabase...');
    console.log('URL:', supabaseUrl);

    // Test projects table
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (projectsError) {
      console.error('Error accessing projects table:', projectsError);
      return;
    }

    console.log('Projects table connection successful!');
    console.log('Projects data:', projects);

    // Test table schema
    const { data: schema, error: schemaError } = await supabase
      .from('projects')
      .select('*')
      .limit(0);

    if (schemaError) {
      console.error('Error getting schema:', schemaError);
      return;
    }

    console.log('Table schema:', schema);
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testConnection();
