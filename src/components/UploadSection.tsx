import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Link, Video } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UploadSectionProps {
  onUploadComplete?: () => void;
}

export const UploadSection = ({ onUploadComplete }: UploadSectionProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type
      if (!selectedFile.type.startsWith('video/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a video file.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 500MB for UploadThing)
      if (selectedFile.size > 500 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a video file smaller than 500MB.",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !user || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a video file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Save video record to database
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          file_path: uploadData.path,
          file_size: file.size,
          status: 'uploaded',
        });

      if (dbError) throw dbError;

      toast({
        title: "Upload successful!",
        description: "Your video has been uploaded. Click 'Process Video' to start transcription.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setFile(null);
      onUploadComplete?.();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleYouTubeUpload = async () => {
    if (!youtubeUrl.trim() || !user || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title and YouTube URL.",
        variant: "destructive",
      });
      return;
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(youtubeUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid YouTube URL.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Save YouTube video record to database
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          file_path: '', // Empty for YouTube videos
          youtube_url: youtubeUrl.trim(),
          status: 'pending_download',
        });

      if (dbError) throw dbError;

      toast({
        title: "YouTube link added!",
        description: "Your YouTube video has been queued for processing.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setYoutubeUrl("");
      onUploadComplete?.();
    } catch (error: any) {
      toast({
        title: "Failed to add YouTube video",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Upload className="w-5 h-5" />
          Upload Video
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="youtube">YouTube Link</TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="space-y-4 mt-4">
            <div>
              <Input
                placeholder="Video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
              />
            </div>
            
            <div>
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                rows={3}
              />
            </div>

            <div>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="video-upload"
                disabled={uploading}
              />
              
              {!file ? (
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('video-upload')?.click()}
                  disabled={uploading}
                  className="w-full h-20 border-dashed border-2 text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Video className="w-8 h-8" />
                    <span>Click to select video file</span>
                    <span className="text-xs">Max size: 500MB</span>
                  </div>
                </Button>
              ) : (
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    <span className="text-sm text-foreground">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  {!uploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={handleFileUpload}
              disabled={!file || !title.trim() || uploading}
              className="w-full"
            >
              {uploading ? "Uploading..." : "Upload Video"}
            </Button>
          </TabsContent>

          <TabsContent value="youtube" className="space-y-4 mt-4">
            <div>
              <Input
                placeholder="Video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
              />
            </div>
            
            <div>
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                rows={3}
              />
            </div>

            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="YouTube URL (e.g., https://youtube.com/watch?v=...)"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                disabled={uploading}
                className="pl-10"
              />
            </div>

            <Button
              onClick={handleYouTubeUpload}
              disabled={!youtubeUrl.trim() || !title.trim() || uploading}
              className="w-full"
            >
              {uploading ? "Adding..." : "Add YouTube Video"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};