import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Video, Download, ExternalLink, BookOpen, Award, RefreshCw } from "lucide-react";
import DECAConfig from "@/lib/DECAConfig";

const Resources = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<any>(null);
  const { toast } = useToast();

  // Check admin status on component mount and listen for changes
  useEffect(() => {
    const checkAdminStatus = () => {
      const adminStatus = localStorage.getItem("deca-admin-logged-in") === "true";
      setIsAdmin(adminStatus);
    };

    const loadResourcesFromGoogle = async () => {
      // Get URL from centralized config
      const GOOGLE_APPS_SCRIPT_URL = DECAConfig.getGoogleAppsScriptUrl();
      
      try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?type=resources`);
        const data = await response.json();
        if (data.resources) {
          setResources(data.resources);
        }
      } catch (error) {
        console.log("Using default resources - Google integration not set up yet");
      }
    };

    checkAdminStatus();
    loadResourcesFromGoogle();
    
    // Listen for storage events from the header login
    window.addEventListener('storage', checkAdminStatus);
    
    return () => {
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, []);

  // Sample/fallback data structure
  const defaultResourceCategories = [
    {
      title: "Competition Prep Materials",
      icon: <Award className="w-6 h-6" />,
      resources: [
        { name: "Business Plan Templates", type: "PDF", url: "#", description: "Complete templates for business plan competitions" },
        { name: "Marketing Case Study Examples", type: "PDF", url: "#", description: "Real-world case studies for practice" },
        { name: "Presentation Guidelines", type: "PDF", url: "#", description: "Professional presentation standards" },
        { name: "Roleplay Scenarios Practice", type: "PDF", url: "#", description: "Practice scenarios for competitions" }
      ]
    },
    {
      title: "Study Guides & Materials",
      icon: <BookOpen className="w-6 h-6" />,
      resources: [
        { name: "Business Fundamentals Guide", type: "PDF", url: "#", description: "Essential business concepts" },
        { name: "Marketing Principles Handbook", type: "PDF", url: "#", description: "Core marketing strategies and concepts" },
        { name: "Entrepreneurship Basics", type: "PDF", url: "#", description: "Starting and running a business" },
        { name: "Finance & Accounting Primer", type: "PDF", url: "#", description: "Financial management essentials" }
      ]
    },
    {
      title: "Training Videos",
      icon: <Video className="w-6 h-6" />,
      resources: [
        { name: "Competition Strategy Workshop", type: "Video", url: "#", description: "Winning strategies for DECA competitions" },
        { name: "Public Speaking for Business", type: "Video", url: "#", description: "Professional presentation skills" },
        { name: "Team Building & Leadership", type: "Video", url: "#", description: "Developing leadership abilities" },
        { name: "Networking Best Practices", type: "Video", url: "#", description: "Building professional relationships" }
      ]
    }
  ];

  const defaultQuickLinks = [
    { name: "Official DECA Website", url: "https://www.deca.org", description: "National DECA organization resources" },
    { name: "Texas DECA", url: "https://www.texasdeca.org/", description: "State-level information and competitions" },
    { name: "List of Competitions", url: "https://www.deca.org/compete#competitive-events", description: "Browse all DECA competitive events and categories" },
    { name: "Corporate Challenges", url: "https://www.deca.org/challenges", description: "Real-world business challenges from industry partners" }
  ];

  const handleRefreshResources = async () => {
    const GOOGLE_APPS_SCRIPT_URL = DECAConfig.getGoogleAppsScriptUrl();
    
    setIsLoading(true);
    try {
      const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?type=resources`);
      const data = await response.json();
      if (data.resources) {
        setResources(data.resources);
      }

      toast({
        title: "Resources Refreshed",
        description: "Resource list has been updated from your Google Drive.",
      });
    } catch (error) {
      console.error('Refresh failed:', error);
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh resources. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use dynamic resources if available, otherwise use defaults
  const resourceCategories = resources?.categories || defaultResourceCategories;
  const quickLinks = resources?.quickLinks || defaultQuickLinks;

  const getIcon = (type: string) => {
    switch (type) {
      case "PDF": return <FileText className="w-4 h-4" />;
      case "Video": return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <section id="resources" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Resources & Materials
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to succeed in DECA competitions and develop your business skills
          </p>
        </div>

        {isAdmin && (
          <div className="mb-8 flex gap-2">
            <Button 
              onClick={handleRefreshResources}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {isLoading ? 'Refreshing...' : 'Refresh Resources'}
            </Button>
          </div>
        )}

        {/* Resource Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {resourceCategories.map((category: any, index: number) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.resources.map((resource: any, resourceIndex: number) => (
                    <div key={resourceIndex} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200">
                      <div className="flex items-center space-x-3 flex-1">
                        {getIcon(resource.type)}
                        <div className="flex-1">
                          <div className="text-sm font-medium">{resource.name}</div>
                          {resource.description && (
                            <div className="text-xs text-muted-foreground">{resource.description}</div>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" disabled={resource.url === '#'}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-background/80 backdrop-blur-sm rounded-xl p-8 border">
          <h3 className="text-2xl font-bold mb-6 text-center">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickLinks.map((link: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200">
                <div>
                  <h4 className="font-semibold text-foreground">{link.name}</h4>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open(link.url, '_blank')}
                  disabled={link.url === '#'}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Resources;