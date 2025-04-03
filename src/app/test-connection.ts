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

    const { data, error } = await supabase.from('blog_posts').select('*').limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return;
    }

    console.log('Connection successful!');
    console.log('Data:', data);
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testConnection();
