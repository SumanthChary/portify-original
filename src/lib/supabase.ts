
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yvvqfcwhskthbbjspcvi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dnFmY3doc2t0aGJianNwY3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTgwNzAsImV4cCI6MjA2MDI3NDA3MH0.T-DAvL0-4pEWF0QSaM3nQcgJhou8gUQHeKK-vMV7KIk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
