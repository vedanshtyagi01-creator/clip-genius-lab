import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting video transcription...');
    
    // Initialize Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user) throw new Error('User not authenticated');

    const { videoId } = await req.json();
    console.log('Processing video:', videoId);

    // Get video details
    const { data: video, error: videoError } = await supabaseClient
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', user.id)
      .single();

    if (videoError || !video) {
      throw new Error('Video not found');
    }

    // Get video file from storage
    const { data: fileData, error: fileError } = await supabaseClient.storage
      .from('videos')
      .download(video.file_path);

    if (fileError || !fileData) {
      throw new Error('Failed to download video file');
    }

    console.log('Video file downloaded, sending to OpenAI...');

    // Convert blob to array buffer then to form data
    const arrayBuffer = await fileData.arrayBuffer();
    const formData = new FormData();
    const blob = new Blob([arrayBuffer], { type: 'video/mp4' });
    formData.append('file', blob, 'video.mp4');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'word');

    const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const transcription = await openaiResponse.json();
    console.log('Transcription received, updating database...');

    // Update video with transcript
    const { error: updateError } = await supabaseClient
      .from('videos')
      .update({ 
        transcript: transcription,
        status: 'transcribed'
      })
      .eq('id', videoId);

    if (updateError) {
      console.error('Failed to update video:', updateError);
      throw new Error('Failed to update video with transcript');
    }

    console.log('Video transcription completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        transcript: transcription.text,
        segments: transcription.segments || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in transcribe-video function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});