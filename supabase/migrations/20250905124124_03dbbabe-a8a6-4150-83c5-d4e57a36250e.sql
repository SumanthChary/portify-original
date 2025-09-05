-- Fix migration_sessions table issues

-- 1. Drop the existing check constraint to see what it was
ALTER TABLE public.migration_sessions DROP CONSTRAINT IF EXISTS migration_sessions_status_check;

-- 2. Make user_id NOT NULL since it's used in RLS policies
ALTER TABLE public.migration_sessions ALTER COLUMN user_id SET NOT NULL;

-- 3. Add proper status check constraint with all needed values
ALTER TABLE public.migration_sessions 
ADD CONSTRAINT migration_sessions_status_check 
CHECK (status IN ('pending', 'authenticated', 'extracting', 'extracted', 'migrating', 'in_progress', 'completed', 'failed', 'cancelled'));

-- 4. Add index on user_id for better performance with RLS
CREATE INDEX IF NOT EXISTS idx_migration_sessions_user_id ON public.migration_sessions(user_id);