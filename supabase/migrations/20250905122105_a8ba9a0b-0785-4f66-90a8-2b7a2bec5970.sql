-- Update migration_sessions table to use JSONB for credentials and add products_data
ALTER TABLE public.migration_sessions 
DROP COLUMN IF EXISTS credentials,
ADD COLUMN IF NOT EXISTS credentials JSONB,
ADD COLUMN IF NOT EXISTS products_data JSONB;