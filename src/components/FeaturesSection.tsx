import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Scissors, 
  Type, 
  Share2, 
  Clock, 
  Target,
  Wand2,
  Download
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Transcription",
    description: "OpenAI Whisper automatically transcribes your videos with precise timestamps",
    badge: "Smart AI"
  },
  {
    icon: Scissors,
    title: "Auto Clipping",
    description: "Intelligently splits videos into 30-60 second clips at natural break points",
    badge: "Time Saver"
  },
  {
    icon: Type,
    title: "YouTube Integration",
    description: "Simply paste a YouTube URL - no downloads required, we handle everything",
    badge: "Easy Input"
  },
  {
    icon: Share2,
    title: "Multiple Formats",
    description: "Upload MP4, MOV files or process directly from YouTube links",
    badge: "Flexible"
  },
  {
    icon: Clock,
    title: "Fast Processing",
    description: "Transcription and clip generation completed in minutes, not hours",
    badge: "Speed"
  },
  {
    icon: Target,
    title: "Smart Segmentation",
    description: "AI identifies optimal clip boundaries based on speech patterns and pauses",
    badge: "Precision"
  },
  {
    icon: Wand2,
    title: "Subscription Plans",
    description: "Free plan: 2 clips/month. Paid plan: unlimited clip generation",
    badge: "Scalable"
  },
  {
    icon: Download,
    title: "Instant Preview",
    description: "Preview all clips in your dashboard and download the perfect ones",
    badge: "Control"
  }
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Everything You Need to Create
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Viral Content</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful AI tools designed specifically for content creators who want to maximize their reach
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 bg-gradient-card border-primary/20 hover:shadow-card transition-smooth hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {feature.badge}
                </Badge>
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};