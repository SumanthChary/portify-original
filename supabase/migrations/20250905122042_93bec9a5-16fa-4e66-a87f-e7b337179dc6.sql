-- Create migration_sessions table for storing migration data
CREATE TABLE IF NOT EXISTS public.migration_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  source_platform TEXT NOT NULL,
  destination_platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  products_data JSONB,
  credentials JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.migration_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
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

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_migration_sessions_updated_at
BEFORE UPDATE ON public.migration_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();