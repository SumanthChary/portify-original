-- Create universal migration system tables

-- Migration sessions table
CREATE TABLE public.migration_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  source_platform TEXT NOT NULL,
  destination_platform TEXT NOT NULL,
  credentials TEXT NOT NULL, -- encrypted credentials
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'authenticated', 'migrating', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Migration results table
CREATE TABLE public.migration_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES migration_sessions(session_id),
  source_platform TEXT NOT NULL,
  destination_platform TEXT NOT NULL,
  results JSONB NOT NULL,
  summary JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Universal products table
CREATE TABLE public.universal_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES migration_sessions(session_id),
  source_product_id TEXT NOT NULL,
  source_platform TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  images JSONB DEFAULT '[]',
  files JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  extracted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  migrated_at TIMESTAMP WITH TIME ZONE,
  destination_product_id TEXT,
  migration_status TEXT DEFAULT 'pending' CHECK (migration_status IN ('pending', 'migrating', 'completed', 'failed'))
);

-- Platform credentials table
CREATE TABLE public.platform_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  platform TEXT NOT NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('api', 'browser')),
  encrypted_credentials TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS on all tables
ALTER TABLE public.migration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.migration_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for migration_sessions
CREATE POLICY "Users can view their own migration sessions" 
ON public.migration_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own migration sessions" 
ON public.migration_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own migration sessions" 
ON public.migration_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for migration_results
CREATE POLICY "Users can view their own migration results" 
ON public.migration_results 
FOR SELECT 
USING (session_id IN (SELECT session_id FROM migration_sessions WHERE user_id = auth.uid()));

CREATE POLICY "Service role can insert migration results" 
ON public.migration_results 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for universal_products
CREATE POLICY "Users can view their own universal products" 
ON public.universal_products 
FOR SELECT 
USING (session_id IN (SELECT session_id FROM migration_sessions WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own universal products" 
ON public.universal_products 
FOR INSERT 
WITH CHECK (session_id IN (SELECT session_id FROM migration_sessions WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own universal products" 
ON public.universal_products 
FOR UPDATE 
USING (session_id IN (SELECT session_id FROM migration_sessions WHERE user_id = auth.uid()));

-- RLS Policies for platform_credentials
CREATE POLICY "Users can view their own platform credentials" 
ON public.platform_credentials 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own platform credentials" 
ON public.platform_credentials 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own platform credentials" 
ON public.platform_credentials 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own platform credentials" 
ON public.platform_credentials 
FOR DELETE 
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_migration_sessions_user_id ON migration_sessions(user_id);
CREATE INDEX idx_migration_sessions_status ON migration_sessions(status);
CREATE INDEX idx_migration_results_session_id ON migration_results(session_id);
CREATE INDEX idx_universal_products_session_id ON universal_products(session_id);
CREATE INDEX idx_universal_products_status ON universal_products(migration_status);
CREATE INDEX idx_platform_credentials_user_id ON platform_credentials(user_id);
CREATE INDEX idx_platform_credentials_platform ON platform_credentials(platform);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_migration_sessions_updated_at
    BEFORE UPDATE ON public.migration_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_credentials_updated_at
    BEFORE UPDATE ON public.platform_credentials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();