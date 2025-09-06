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
    console.log('Starting clip generation...');
    
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
    console.log('Generating clips for video:', videoId);

    // Get video with transcript
    const { data: video, error: videoError } = await supabaseClient
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', user.id)
      .single();

    if (videoError || !video || !video.transcript) {
      throw new Error('Video not found or not transcribed');
    }

    // Check user subscription limits
    const { data: subscriber } = await supabaseClient
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const isSubscribed = subscriber?.subscribed || false;
    const clipsUsed = subscriber?.clips_used_this_month || 0;

    if (!isSubscribed && clipsUsed >= 2) {
      throw new Error('Free plan limit reached. Upgrade to generate more clips.');
    }

    // Extract segments from transcript
    const segments = video.transcript.segments || [];
    if (!segments.length) {
      throw new Error('No transcript segments found');
    }

    console.log(`Found ${segments.length} transcript segments`);

    // Generate clips (30-60 second segments)
    const clips = [];
    const targetDuration = 45; // Target 45 seconds
    const minDuration = 30;
    const maxDuration = 60;

    let currentStart = 0;
    let currentText = '';
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const segmentDuration = segment.end - currentStart;
      
      currentText += segment.text + ' ';
      
      // Create clip if we've reached target duration or max duration
      if (segmentDuration >= targetDuration || segmentDuration >= maxDuration) {
        if (segmentDuration >= minDuration) {
          clips.push({
            title: `Clip ${clips.length + 1}: ${currentText.substring(0, 50)}...`,
            start_time: currentStart,
            end_time: segment.end,
            duration: segmentDuration,
            text: currentText.trim()
          });
        }
        
        // Reset for next clip
        currentStart = segment.end;
        currentText = '';
      }
    }

    // Handle remaining content
    if (currentText.trim() && segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      const duration = lastSegment.end - currentStart;
      if (duration >= minDuration) {
        clips.push({
          title: `Clip ${clips.length + 1}: ${currentText.substring(0, 50)}...`,
          start_time: currentStart,
          end_time: lastSegment.end,
          duration: duration,
          text: currentText.trim()
        });
      }
    }

    console.log(`Generated ${clips.length} clips`);

    // Save clips to database
    const clipRecords = clips.map(clip => ({
      user_id: user.id,
      video_id: videoId,
      title: clip.title,
      start_time: clip.start_time,
      end_time: clip.end_time,
      duration: clip.duration,
      status: 'ready'
    }));

    const { error: insertError } = await supabaseClient
      .from('clips')
      .insert(clipRecords);

    if (insertError) {
      console.error('Failed to save clips:', insertError);
      throw new Error('Failed to save clips');
    }

    // Update subscriber usage
    if (subscriber) {
      await supabaseClient
        .from('subscribers')
        .update({ clips_used_this_month: clipsUsed + clips.length })
        .eq('user_id', user.id);
    } else {
      await supabaseClient
        .from('subscribers')
        .insert({
          user_id: user.id,
          email: user.email || '',
          clips_used_this_month: clips.length
        });
    }

    console.log('Clip generation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        clips: clips.length,
        message: `Generated ${clips.length} clips successfully`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-clips function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});