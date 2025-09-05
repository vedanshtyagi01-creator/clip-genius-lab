import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Brain, Scissors, Download, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Video",
    description: "Drop your video file or paste a YouTube link",
    detail: "Supports MP4, MOV, AVI formats up to 2GB"
  },
  {
    icon: Brain,
    title: "AI Analysis",
    description: "Our AI identifies key moments and highlights",
    detail: "Advanced scene detection and engagement scoring"
  },
  {
    icon: Scissors,
    title: "Auto-Edit",
    description: "Creates multiple short clips with captions",
    detail: "30-60 second clips optimized for each platform"
  },
  {
    icon: Download,
    title: "Export & Share",
    description: "Download or publish directly to social media",
    detail: "One-click publishing to TikTok, IG, YouTube"
  }
];

export const WorkflowSection = () => {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            From Upload to Viral in
            <span className="bg-gradient-secondary bg-clip-text text-transparent"> 4 Simple Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our streamlined workflow gets you from raw footage to shareable content in minutes
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="p-6 bg-gradient-card border-primary/20 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Step {index + 1}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {step.description}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {step.detail}
                </p>
              </Card>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Average processing time: <span className="text-primary font-semibold">2-5 minutes</span>
          </p>
        </div>
      </div>
    </section>
  );
};