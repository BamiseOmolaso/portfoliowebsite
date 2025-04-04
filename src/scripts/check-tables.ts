import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    // Get all tables
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error checking projects table:', error);
      return;
    }

    if (data) {
      console.log('Projects table exists and contains data:', data);
    } else {
      console.log('Projects table exists but is empty');
    }

    // Get table schema
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
    console.error('Error:', err);
  }
}

checkTables(); 