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
    title: "AI Scene Detection",
    description: "Our AI automatically identifies the most engaging moments in your videos",
    badge: "Smart AI"
  },
  {
    icon: Scissors,
    title: "Auto-Editing",
    description: "Cuts your content into perfect 30-60 second highlights automatically",
    badge: "Time Saver"
  },
  {
    icon: Type,
    title: "Smart Captions",
    description: "Auto-generate stylish subtitles that boost engagement and accessibility",
    badge: "Engagement+"
  },
  {
    icon: Share2,
    title: "Direct Publishing",
    description: "Share directly to TikTok, Instagram Reels, and YouTube Shorts",
    badge: "One-Click"
  },
  {
    icon: Clock,
    title: "Batch Processing",
    description: "Process multiple videos simultaneously to maximize your productivity",
    badge: "Efficiency"
  },
  {
    icon: Target,
    title: "Audience Targeting",
    description: "Optimize clips for specific platforms and audience preferences",
    badge: "Precision"
  },
  {
    icon: Wand2,
    title: "Style Templates",
    description: "Choose from trending templates and customize your brand aesthetic",
    badge: "Creative"
  },
  {
    icon: Download,
    title: "HD Export",
    description: "Download your clips in high quality formats ready for any platform",
    badge: "Quality"
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