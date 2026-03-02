import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxdwpnuxxcpsfgjfmxax.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4ZHdwbnV4eGNwc2ZnamZteGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzU1MDcsImV4cCI6MjA4NzI1MTUwN30.WgfkMMHrg8adsz8iPfqRA66toy6Qi4hOiEw6unRFPPs';

export const supabase = createClient(supabaseUrl, supabaseKey);
