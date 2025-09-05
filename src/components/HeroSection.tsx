import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Play, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-video-editing.jpg";

export const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="pt-24 pb-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Video Magic</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Transform Long Videos into
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Viral Clips</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Help content creators automatically repurpose long-form videos into engaging 
            short clips for TikTok, Instagram Reels, and YouTube Shorts.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              <Upload className="w-5 h-5" />
              Upload Your Video
            </Button>
            <Button variant="glass" size="lg" className="text-lg px-8 py-6">
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>
        </div>
        
        <Card className="p-8 bg-gradient-card border-primary/20 shadow-elevated">
          <div className="relative">
            <img 
              src={heroImage} 
              alt="ClipMagic video editing interface"
              className="w-full rounded-lg shadow-glow"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-lg" />
          </div>
        </Card>
        
        <div className="text-center mt-8 text-muted-foreground">
          <p className="text-sm">Trusted by 10,000+ content creators worldwide</p>
        </div>
      </div>
    </section>
  );
};