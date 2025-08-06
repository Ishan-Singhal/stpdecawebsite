import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";
import heroImage from "@/assets/deca-hero.jpg";

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="DECA Students at Competition" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Welcome to{" "}
            <span className="text-secondary font-bold">
              Stony Point DECA!
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 leading-relaxed">
            Empowering the next generation of business leaders through competition, 
            leadership development, and real-world experience.
          </p>


          {/* Remind Instructions */}
          <div className="bg-background/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/20">
            <h3 className="text-lg font-semibold text-primary-foreground mb-2">
              Stay Connected with Remind
            </h3>
            <p className="text-primary-foreground/90">
              Text <span className="font-bold text-secondary">@stpdeca26</span> to{" "}
              <span className="font-bold text-secondary">81010</span> for important updates and announcements
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;