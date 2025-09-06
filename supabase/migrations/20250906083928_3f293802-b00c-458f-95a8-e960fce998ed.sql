-- Add missing columns and tables for ClipGenius Lab
-- Add subscribers table for Stripe subscriptions
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  clips_used_this_month INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add new columns to videos table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='transcript') THEN
    ALTER TABLE public.videos ADD COLUMN transcript JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='videos' AND column_name='youtube_url') THEN
    ALTER TABLE public.videos ADD COLUMN youtube_url TEXT;
  END IF;
END $$;

-- Enable RLS on subscribers table
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Subscribers policies
CREATE POLICY "Users can view their own subscription" ON public.subscribers
FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Edge functions can manage subscriptions" ON public.subscribers
FOR ALL USING (true);

-- Add clips storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
SELECT 'clips', 'clips', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'clips');

-- Clips storage policies
CREATE POLICY "Users can view their own clips" ON storage.objects
FOR SELECT USING (
  bucket_id = 'clips' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own clips" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'clips' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Service can manage clips" ON storage.objects
FOR ALL USING (bucket_id = 'clips');