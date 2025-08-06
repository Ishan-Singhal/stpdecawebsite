import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Video, Download, ExternalLink, BookOpen, Award, RefreshCw, Eye, FileIcon, Play, GraduationCap, Target, Users, TrendingUp } from "lucide-react";
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

  const getCategoryIcon = (title: string, index: number) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'Competition Prep Materials': <Target className="w-7 h-7" />,
      'Study Guides & Materials': <GraduationCap className="w-7 h-7" />,
      'Training Videos': <Play className="w-7 h-7" />,
      'Competition': <Target className="w-7 h-7" />,
      'Study': <GraduationCap className="w-7 h-7" />,
      'Video': <Play className="w-7 h-7" />,
      'Training': <Play className="w-7 h-7" />,
      'Materials': <GraduationCap className="w-7 h-7" />
    };

    // Try exact match first
    if (iconMap[title]) return iconMap[title];
    
    // Try partial matches
    for (const [key, icon] of Object.entries(iconMap)) {
      if (title.toLowerCase().includes(key.toLowerCase())) return icon;
    }
    
    // Fallback based on index
    const defaultIcons = [
      <Target className="w-7 h-7" />,
      <GraduationCap className="w-7 h-7" />, 
      <Play className="w-7 h-7" />
    ];
    return defaultIcons[index % defaultIcons.length];
  };

  // Gradient mapping for categories
  const getCategoryGradient = (title: string, index: number) => {
    const gradientMap: { [key: string]: string } = {
      'Competition Prep Materials': 'from-amber-500 to-orange-600',
      'Study Guides & Materials': 'from-blue-500 to-indigo-600',
      'Training Videos': 'from-purple-500 to-pink-600',
      'Competition': 'from-amber-500 to-orange-600',
      'Study': 'from-blue-500 to-indigo-600',
      'Video': 'from-purple-500 to-pink-600',
      'Training': 'from-purple-500 to-pink-600',
      'Materials': 'from-blue-500 to-indigo-600'
    };

    // Try exact match first
    if (gradientMap[title]) return gradientMap[title];
    
    // Try partial matches
    for (const [key, gradient] of Object.entries(gradientMap)) {
      if (title.toLowerCase().includes(key.toLowerCase())) return gradient;
    }
    
    // Fallback based on index
    const defaultGradients = [
      'from-amber-500 to-orange-600',
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600'
    ];
    return defaultGradients[index % defaultGradients.length];
  };


  const resourceCategories = resources?.categories;
  const quickLinks = defaultQuickLinks;

  // Only map if resourceCategories is an array
  const enhancedCategories = Array.isArray(resourceCategories)
    ? resourceCategories.map((category: any, index: number) => ({
        ...category,
        icon: getCategoryIcon(category.title, index),
        gradient: getCategoryGradient(category.title, index)
      }))
    : [];


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
          {enhancedCategories.length > 0 ? (
            enhancedCategories.map((category: any, index: number) => (
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
                    {Array.isArray(category.resources) && category.resources.length > 0 ? (
                      category.resources.map((resource: any, resourceIndex: number) => (
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
                      ))
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : null}
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