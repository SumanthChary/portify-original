-- Core tables for Portify SaaS multi-step migrations

-- Ensure required extensions are available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Platform connections store per-user credentials (encrypted)
CREATE TABLE IF NOT EXISTS public.platform_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    connection_type TEXT NOT NULL CHECK (connection_type IN ('api', 'browser', 'hybrid')),
    display_name TEXT,
    encrypted_payload TEXT NOT NULL,
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, platform)
);

ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their platform connections" ON public.platform_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their platform connections" ON public.platform_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their platform connections" ON public.platform_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their platform connections" ON public.platform_connections
    FOR DELETE USING (auth.uid() = user_id);

-- Payments table to track checkout sessions and statuses
CREATE TABLE IF NOT EXISTS public.migration_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.migration_sessions(session_id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('paypal', 'dodo')),
    provider_payment_id TEXT,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('pending', 'requires_action', 'paid', 'failed', 'refunded', 'cancelled', 'bypassed')),
    plan TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at TIMESTAMPTZ,
    failure_reason TEXT
);

ALTER TABLE public.migration_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their payments" ON public.migration_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their payments" ON public.migration_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their payments" ON public.migration_payments
    FOR UPDATE USING (auth.uid() = user_id);

-- Migration jobs table coordinates each migration execution after payment
CREATE TABLE IF NOT EXISTS public.migration_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.migration_sessions(session_id) ON DELETE CASCADE,
    payment_id UUID REFERENCES public.migration_payments(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_platform TEXT NOT NULL,
    destination_platform TEXT NOT NULL,
    plan TEXT NOT NULL,
    automation_mode TEXT NOT NULL CHECK (automation_mode IN ('api', 'browser', 'hybrid')),
    worker_endpoint TEXT,
    product_count INTEGER NOT NULL CHECK (product_count > 0),
    total_amount NUMERIC(10,2),
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'bypassed')),
    processing_status TEXT NOT NULL DEFAULT 'queued' CHECK (processing_status IN ('queued', 'assigning', 'running', 'succeeded', 'failed', 'cancelled')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    failure_reason TEXT
);

ALTER TABLE public.migration_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their migration jobs" ON public.migration_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their migration jobs" ON public.migration_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their migration jobs" ON public.migration_jobs
    FOR UPDATE USING (auth.uid() = user_id);

-- Migration items represent each product in a job
CREATE TABLE IF NOT EXISTS public.migration_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.migration_jobs(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.universal_products(id) ON DELETE CASCADE,
    source_product_id TEXT NOT NULL,
    destination_product_id TEXT,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'skipped')),
    last_error TEXT,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.migration_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their migration items" ON public.migration_items
    FOR SELECT USING (
        job_id IN (
            SELECT id FROM public.migration_jobs WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their migration items" ON public.migration_items
    FOR INSERT WITH CHECK (
        job_id IN (
            SELECT id FROM public.migration_jobs WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their migration items" ON public.migration_items
    FOR UPDATE USING (
        job_id IN (
            SELECT id FROM public.migration_jobs WHERE user_id = auth.uid()
        )
    );

-- Helper function for updated_at timestamps (idempotent)
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers
CREATE TRIGGER platform_connections_touch_updated_at
    BEFORE UPDATE ON public.platform_connections
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER migration_payments_touch_updated_at
    BEFORE UPDATE ON public.migration_payments
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER migration_jobs_touch_updated_at
    BEFORE UPDATE ON public.migration_jobs
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER migration_items_touch_updated_at
    BEFORE UPDATE ON public.migration_items
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_platform_connections_user_platform
    ON public.platform_connections(user_id, platform);

CREATE INDEX IF NOT EXISTS idx_migration_payments_session_status
    ON public.migration_payments(session_id, status);

CREATE INDEX IF NOT EXISTS idx_migration_jobs_user_status
    ON public.migration_jobs(user_id, processing_status);

CREATE INDEX IF NOT EXISTS idx_migration_jobs_payment_status
    ON public.migration_jobs(payment_status);

CREATE INDEX IF NOT EXISTS idx_migration_items_job_status
    ON public.migration_items(job_id, status);
