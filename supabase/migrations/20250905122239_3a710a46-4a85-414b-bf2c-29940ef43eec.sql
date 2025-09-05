-- Update migration_sessions table to use JSONB for credentials
ALTER TABLE public.migration_sessions 
ALTER COLUMN credentials TYPE JSONB USING credentials::jsonb;

-- Add products_data column if it doesn't exist
ALTER TABLE public.migration_sessions 
ADD COLUMN IF NOT EXISTS products_data JSONB;