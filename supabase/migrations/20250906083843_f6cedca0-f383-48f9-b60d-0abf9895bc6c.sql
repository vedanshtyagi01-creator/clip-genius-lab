-- Update branding and add new tables for ClipGenius Lab
-- Add clips table to store generated video clips
CREATE TABLE public.clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time NUMERIC NOT NULL,
  end_time NUMERIC NOT NULL,
  duration NUMERIC NOT NULL,
  file_path TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add subscribers table for Stripe subscriptions
CREATE TABLE public.subscribers (
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

-- Add transcript column to videos table
ALTER TABLE public.videos ADD COLUMN transcript JSONB;
ALTER TABLE public.videos ADD COLUMN youtube_url TEXT;

-- Enable RLS on new tables
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Clips policies
CREATE POLICY "Users can view their own clips" ON public.clips
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clips" ON public.clips
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clips" ON public.clips
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clips" ON public.clips
FOR DELETE USING (auth.uid() = user_id);

-- Subscribers policies
CREATE POLICY "Users can view their own subscription" ON public.subscribers
FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "Edge functions can manage subscriptions" ON public.subscribers
FOR ALL USING (true);

-- Add triggers for clips
CREATE TRIGGER update_clips_updated_at
BEFORE UPDATE ON public.clips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add clips storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('clips', 'clips', false);

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