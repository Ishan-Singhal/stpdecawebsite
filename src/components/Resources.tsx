import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Play, 
  ExternalLink, 
  RefreshCw, 
  Eye, 
  FileIcon, 
  Target, 
  Download,
  Presentation,
  Sheet,
  Image,
  FileType,
  Globe
} from "lucide-react";
import DECAConfig from "@/lib/DECAConfig";

const QUICK_LINKS = [
  { name: "Official DECA Website", url: "https://www.deca.org", description: "National DECA organization resources" },
  { name: "Texas DECA", url: "https://www.texasdeca.org/", description: "State-level information and competitions" },
  { name: "List of Competitions", url: "https://www.deca.org/compete#competitive-events", description: "Browse all DECA competitive events and categories" },
  { name: "Corporate Challenges", url: "https://www.deca.org/challenges", description: "Real-world business challenges from industry partners" }
];

const Resources = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = () => {
      const adminStatus = localStorage.getItem("deca-admin-logged-in") === "true";
      setIsAdmin(adminStatus);
    };

    const loadResourcesFromGoogle = async () => {
      const GOOGLE_APPS_SCRIPT_URL = await DECAConfig.getGoogleAppsScriptUrl();
      try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?type=resources`);
        const data = await response.json();
        if (data.resources) {
          setResources(data.resources);
        }
      } catch (error) {
        console.log("Resource loading failed");
      }
    };

    checkAdminStatus();
    loadResourcesFromGoogle();
    window.addEventListener('storage', checkAdminStatus);
    return () => {
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, []);

  const handleRefreshResources = async () => {
    const GOOGLE_APPS_SCRIPT_URL = await DECAConfig.getGoogleAppsScriptUrl();
    setIsLoading(true);
    try {
      const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?type=resources`);
      const data = await response.json();
      if (data.resources) {
        setResources(data.resources);
      }
      toast({
        title: "Resources Refreshed",
        description: "Resource list has been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh resources.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "PDF": 
        return <FileText className="w-5 h-5 text-red-500" />;
      case "Video": 
        return <Play className="w-5 h-5 text-purple-500" />;
      case "Document": 
        return <FileText className="w-5 h-5 text-blue-500" />;
      case "Presentation": 
        return <Presentation className="w-5 h-5 text-orange-500" />;
      case "Spreadsheet": 
        return <Sheet className="w-5 h-5 text-green-500" />;
      case "Image": 
        return <Image className="w-5 h-5 text-pink-500" />;
      case "Form": 
        return <FileType className="w-5 h-5 text-indigo-500" />;
      case "Website": 
        return <Globe className="w-5 h-5 text-cyan-500" />;
      case "Text": 
        return <FileText className="w-5 h-5 text-gray-500" />;
      default: 
        return <FileIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (type: string, originalMimeType?: string) => {
    // Show conversion info for Google Workspace files
    if (originalMimeType) {
      switch (originalMimeType) {
        case 'application/vnd.google-apps.document':
          return 'Google Doc (PDF)';
        case 'application/vnd.google-apps.spreadsheet':
          return 'Google Sheet (Excel)';
        case 'application/vnd.google-apps.presentation':
          return 'Google Slides (PDF)';
        case 'application/vnd.google-apps.drawing':
          return 'Google Drawing (PDF)';
        default:
          return type;
      }
    }
    return type;
  };

  const handleDownload = async (resource: any) => {
    // This function is now simplified to just open in Google Drive
    if (resource.url === '#') {
      toast({
        title: "Resource Not Available",
        description: "This resource is coming soon!",
        variant: "destructive",
      });
      return;
    }

    // Open the Google Drive view for all file types
    window.open(resource.urls?.view || resource.url, '_blank');
    toast({
      title: "Opening in Google Drive",
      description: `Opening ${resource.name} in Google Drive where you can download it.`,
    });
  };

  const handlePreview = async (resource: any) => {
    if (resource.url === '#') {
      toast({
        title: "Resource Not Available",
        description: "This resource is coming soon!",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use preview URL if available, otherwise use view URL
      let previewUrl = resource.urls?.preview || resource.urls?.view || resource.url;
      
      window.open(previewUrl, '_blank');
      toast({
        title: "Opening Preview",
        description: `Opening ${resource.name} preview...`,
      });
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "Preview Failed",
        description: "Unable to preview this resource.",
        variant: "destructive",
      });
    }
  };

  // Group resources by type
  const allResources = resources?.categories?.flatMap(cat => cat.resources) || [];
  const prepMaterials = allResources.filter(r => r.type !== "Video");
  const videos = allResources.filter(r => r.type === "Video");

  const resourceCategories = [
    {
      title: "Competition Prep Materials",
      icon: <Target className="w-7 h-7" />,
      resources: prepMaterials
    },
    {
      title: "Training Videos",
      icon: <Play className="w-7 h-7" />,
      resources: videos
    }
  ];

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

        {/* User guidance message */}
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">How to Access Resources</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Click the <ExternalLink className="w-4 h-4 inline mx-1" /> button to view files in Google Drive, where you can download them directly. 
              </p>
            </div>
          </div>
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
        <div className="flex flex-col lg:flex-row justify-center items-center gap-12 mb-16">
          {resourceCategories.map((category, index) => (
            <Card key={index} className="group flex-1 max-w-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-background to-muted/30">
              <CardHeader className="pb-6 flex flex-col items-start">
                <div className="w-14 h-14 rounded-xl bg-white shadow-lg flex items-center justify-center mb-6">
                  {category.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 text-left">
                  {category.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {category.resources && category.resources.map((resource, resourceIndex) => (
                    <div key={resourceIndex} className="group/resource flex items-center justify-between p-4 rounded-xl bg-background/60 hover:bg-background/80 transition-all duration-300 border border-border/50 hover:border-primary/20 hover:shadow-md">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="p-2 rounded-lg bg-muted/50 group-hover/resource:bg-primary/10 transition-colors duration-200">
                          {getIcon(resource.type)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-foreground group-hover/resource:text-primary transition-colors duration-200">
                            {resource.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {getFileTypeLabel(resource.type, resource.originalMimeType)}
                          </div>
                          {resource.description && (
                            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {resource.description}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/resource:opacity-100 transition-opacity duration-200">
                        {/* Preview button for supported file types */}
                        {(resource.type === 'PDF' || resource.type === 'Document' || resource.type === 'Presentation' || resource.type === 'Spreadsheet' || resource.type === 'Image') && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={resource.url === '#'}
                            onClick={() => handlePreview(resource)}
                            className="hover:bg-primary/10 hover:text-primary"
                            title="Preview"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {/* Open in Google Drive button */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          disabled={resource.url === '#'}
                          onClick={() => window.open(resource.urls?.view || resource.url, '_blank')}
                          className="hover:bg-primary/10 hover:text-primary"
                          title="Open in Google Drive"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show message if no resources in category */}
                  {(!category.resources || category.resources.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No resources available in this category yet.</p>
                      <p className="text-sm">Check back later for updates!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resource Summary */}
        {resources && resources.categories && (
          <div className="mb-8 p-4 bg-background/50 rounded-lg border">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span>
                Total Resources: {allResources.length}
              </span>
              <span>•</span>
              <span>
                Documents: {allResources.filter(r => ['PDF', 'Document', 'Presentation', 'Spreadsheet'].includes(r.type)).length}
              </span>
              <span>•</span>
              <span>
                Videos: {allResources.filter(r => r.type === 'Video').length}
              </span>
              <span>•</span>
              <span>
                Other: {allResources.filter(r => !['PDF', 'Document', 'Presentation', 'Spreadsheet', 'Video'].includes(r.type)).length}
              </span>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-background/80 backdrop-blur-sm rounded-xl p-8 border">
          <h3 className="text-2xl font-bold mb-6 text-center">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUICK_LINKS.map((link, index) => (
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

        {/* Loading State */}
        {!resources && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading resources...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Resources;