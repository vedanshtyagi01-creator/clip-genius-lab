import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Play, Download, Wand2, MessageSquare, Scissors } from "lucide-react";

interface Video {
  id: string;
  title: string;
  description?: string;
  file_path: string;
  status: string;
  created_at: string;
  transcript?: any;
  youtube_url?: string;
}

interface Clip {
  id: string;
  title: string;
  start_time: number;
  end_time: number;
  duration: number;
  status: string;
  created_at: string;
}

interface VideoProcessingProps {
  videos: Video[];
  onRefresh: () => void;
}

export const VideoProcessing = ({ videos, onRefresh }: VideoProcessingProps) => {
  const [processing, setProcessing] = useState<{[key: string]: boolean}>({});
  const [clips, setClips] = useState<{[key: string]: Clip[]}>({});
  const { user } = useAuth();
  const { toast } = useToast();

  const handleTranscribe = async (videoId: string) => {
    if (!user) return;

    setProcessing(prev => ({ ...prev, [`transcribe-${videoId}`]: true }));

    try {
      const { error } = await supabase.functions.invoke('transcribe-video', {
        body: { videoId }
      });

      if (error) throw error;

      toast({
        title: "Transcription started",
        description: "Your video is being transcribed. This may take a few minutes.",
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Transcription failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(prev => ({ ...prev, [`transcribe-${videoId}`]: false }));
    }
  };

  const handleGenerateClips = async (videoId: string) => {
    if (!user) return;

    setProcessing(prev => ({ ...prev, [`clips-${videoId}`]: true }));

    try {
      const { error } = await supabase.functions.invoke('generate-clips', {
        body: { videoId }
      });

      if (error) throw error;

      toast({
        title: "Clips generated!",
        description: "Your video has been split into clips. Refresh to see them.",
      });

      // Fetch clips for this video
      await fetchClips(videoId);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Clip generation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(prev => ({ ...prev, [`clips-${videoId}`]: false }));
    }
  };

  const fetchClips = async (videoId: string) => {
    try {
      const { data, error } = await supabase
        .from('clips')
        .select('*')
        .eq('video_id', videoId)
        .order('start_time', { ascending: true });

      if (error) throw error;

      setClips(prev => ({ ...prev, [videoId]: data || [] }));
    } catch (error: any) {
      console.error('Error fetching clips:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Badge variant="secondary">Uploaded</Badge>;
      case 'transcribed':
        return <Badge variant="default">Transcribed</Badge>;
      case 'processing':
        return <Badge variant="outline">Processing</Badge>;
      case 'pending_download':
        return <Badge variant="secondary">Pending Download</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {videos.map((video) => (
        <Card key={video.id} className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">{video.title}</CardTitle>
                {video.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {video.description}
                  </p>
                )}
              </div>
              {getStatusBadge(video.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Process buttons */}
            <div className="flex gap-2 flex-wrap">
              {video.status === 'uploaded' && !video.transcript && (
                <Button
                  onClick={() => handleTranscribe(video.id)}
                  disabled={processing[`transcribe-${video.id}`]}
                  variant="outline"
                  size="sm"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {processing[`transcribe-${video.id}`] ? "Transcribing..." : "Transcribe"}
                </Button>
              )}
              
              {video.transcript && (
                <Button
                  onClick={() => handleGenerateClips(video.id)}
                  disabled={processing[`clips-${video.id}`]}
                  variant="outline"
                  size="sm"
                >
                  <Scissors className="w-4 h-4 mr-2" />
                  {processing[`clips-${video.id}`] ? "Generating..." : "Generate Clips"}
                </Button>
              )}

              <Button
                onClick={() => fetchClips(video.id)}
                variant="ghost"
                size="sm"
              >
                <Play className="w-4 h-4 mr-2" />
                View Clips
              </Button>
            </div>

            {/* Clips display */}
            {clips[video.id] && clips[video.id].length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Generated Clips ({clips[video.id].length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {clips[video.id].map((clip) => (
                    <div
                      key={clip.id}
                      className="p-3 bg-muted/30 rounded-md border border-border"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground truncate">
                            {clip.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(clip.start_time)} - {formatDuration(clip.end_time)} 
                            ({formatDuration(clip.duration)})
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show transcript preview if available */}
            {video.transcript && (
              <div className="mt-4 p-3 bg-muted/20 rounded-md">
                <h4 className="text-sm font-medium text-foreground mb-2">Transcript Preview</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {video.transcript.text?.substring(0, 200)}...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};