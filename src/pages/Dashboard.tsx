import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadSection } from "@/components/UploadSection";
import { VideoProcessing } from "@/components/VideoProcessing";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Video, LogOut, User, CreditCard } from "lucide-react";

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

interface Subscription {
  subscribed: boolean;
  subscription_tier: string;
  clips_used: number;
  clips_limit: string | number;
}

const Dashboard = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchVideos();
    checkSubscription();
  }, [user, navigate]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading videos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data);
    } catch (error: any) {
      console.error('Error checking subscription:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">ClipGenius Lab</span>
            </div>
            
            <div className="flex items-center gap-4">
              {subscription && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">
                    {subscription.subscription_tier} Plan: {subscription.clips_used}/{subscription.clips_limit} clips
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <UploadSection onUploadComplete={fetchVideos} />
          </div>

          {/* Video Processing */}
          <div className="lg:col-span-3">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Video className="w-5 h-5" />
                  Your Videos & Clips
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading your videos...
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No videos uploaded yet. Upload your first video to get started!
                  </div>
                ) : (
                  <VideoProcessing videos={videos} onRefresh={fetchVideos} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;