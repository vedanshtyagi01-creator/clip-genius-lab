import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Play, Zap, LogOut } from "lucide-react";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ClipGenius Lab</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-smooth">
              Pricing
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-smooth">
              How it Works
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.email}
                </span>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
                <Button variant="hero" size="sm" onClick={() => navigate("/dashboard")}>
                  <Play className="w-4 h-4" />
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={handleAuthClick}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" onClick={handleAuthClick}>
                  <Play className="w-4 h-4" />
                  Start Creating
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};