// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yvvqfcwhskthbbjspcvi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2dnFmY3doc2t0aGJianNwY3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTgwNzAsImV4cCI6MjA2MDI3NDA3MH0.T-DAvL0-4pEWF0QSaM3nQcgJhou8gUQHeKK-vMV7KIk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);