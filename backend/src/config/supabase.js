const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Les variables d\'environnement SUPABASE_URL et SUPABASE_ANON_KEY sont requises');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase; 