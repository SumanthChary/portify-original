-- FIX ALL POTENTIAL ERRORS IN ONE GO

-- 1. Fix universal_products table constraints and nullable issues
ALTER TABLE public.universal_products DROP CONSTRAINT IF EXISTS universal_products_migration_status_check;
ALTER TABLE public.universal_products DROP CONSTRAINT IF EXISTS universal_products_status_check;

-- Add comprehensive status constraints
ALTER TABLE public.universal_products 
ADD CONSTRAINT universal_products_migration_status_check 
CHECK (migration_status IN ('pending', 'ready', 'extracting', 'extracted', 'migrating', 'in_progress', 'migrated', 'completed', 'failed', 'cancelled', 'error'));

ALTER TABLE public.universal_products 
ADD CONSTRAINT universal_products_status_check 
CHECK (status IN ('active', 'draft', 'archived', 'pending', 'published'));

-- 2. Fix migration_results table if it has similar issues
ALTER TABLE public.migration_results DROP CONSTRAINT IF EXISTS migration_results_source_platform_check;
ALTER TABLE public.migration_results DROP CONSTRAINT IF EXISTS migration_results_destination_platform_check;

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_universal_products_session_id ON public.universal_products(session_id);
CREATE INDEX IF NOT EXISTS idx_universal_products_migration_status ON public.universal_products(migration_status);
CREATE INDEX IF NOT EXISTS idx_universal_products_source_platform ON public.universal_products(source_platform);

-- 4. Add indexes for migration_results
CREATE INDEX IF NOT EXISTS idx_migration_results_session_id ON public.migration_results(session_id);
CREATE INDEX IF NOT EXISTS idx_migration_results_source_platform ON public.migration_results(source_platform);

-- 5. Add missing constraints for data integrity
ALTER TABLE public.universal_products 
ADD CONSTRAINT check_price_non_negative 
CHECK (price >= 0);

-- 6. Ensure proper defaults
ALTER TABLE public.universal_products ALTER COLUMN images SET DEFAULT '[]'::jsonb;
ALTER TABLE public.universal_products ALTER COLUMN files SET DEFAULT '[]'::jsonb;
ALTER TABLE public.universal_products ALTER COLUMN variants SET DEFAULT '[]'::jsonb;
ALTER TABLE public.universal_products ALTER COLUMN tags SET DEFAULT '{}'::text[];