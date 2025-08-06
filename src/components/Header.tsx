import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Menu, X, Lock, LogOut, Eye, EyeOff, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const { toast } = useToast();

  // Admin password - you can change this
  const ADMIN_PASSWORD = "DECAofficer2024";

  // Check admin status on component mount
  useEffect(() => {
    const adminStatus = localStorage.getItem("deca-admin-logged-in") === "true";
    setIsAdmin(adminStatus);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem("deca-admin-logged-in", "true");
        setIsAdmin(true);
        setPassword("");
        setDropdownOpen(false);
        setMobileDropdownOpen(false);
        toast({
          title: "Admin Access Granted",
          description: "You now have access to admin settings",
        });
        // Trigger a storage event to notify other components
        window.dispatchEvent(new Event('storage'));
      } else {
        toast({
          title: "Access Denied",
          description: "Incorrect password. Contact an advisor if you need access.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    localStorage.removeItem("deca-admin-logged-in");
    setIsAdmin(false);
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
    toast({
      title: "Logged Out",
      description: "Admin access has been removed",
    });
    // Trigger a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  };

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Events", href: "#events" },
    { name: "Points", href: "#points" },
    { name: "Resources", href: "#resources" },
    { name: "Join Us", href: "#join" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
              <img 
                src="/stpdeca.png" 
                alt="Stony Point High School Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-xl text-primary">
                Stony Point DECA
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
                >
                  {item.name}
                </a>
              ))}
            </nav>
            
            {/* Admin Dropdown */}
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant={isAdmin ? "default" : "outline"} size="sm" className="ml-4">
                  {isAdmin ? <Shield className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  {isAdmin ? "Admin" : "Login"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-4 bg-background border shadow-lg z-50" align="end">
                {isAdmin ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-primary flex items-center justify-center text-primary-foreground mb-2">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold">Admin Access Active</h3>
                      <p className="text-sm text-muted-foreground">You have administrator privileges</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="w-full">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-primary flex items-center justify-center text-primary-foreground mb-2">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold">Admin Login</h3>
                      <p className="text-sm text-muted-foreground">Enter password to access admin settings</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="admin-password">Admin Password</Label>
                        <div className="relative">
                          <Input
                            id="admin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter admin password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading || !password}>
                        {isLoading ? "Verifying..." : "Login"}
                      </Button>
                    </form>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground text-center">
                        Only DECA officers and advisors have access
                      </p>
                    </div>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Admin Button */}
            <DropdownMenu open={mobileDropdownOpen} onOpenChange={setMobileDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant={isAdmin ? "default" : "outline"} size="sm">
                  {isAdmin ? <Shield className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-4 bg-background border shadow-lg z-50" align="end">
                {isAdmin ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-primary flex items-center justify-center text-primary-foreground mb-2">
                        <Shield className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold">Admin Access Active</h3>
                      <p className="text-sm text-muted-foreground">Administrator privileges</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="w-full">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto rounded-full bg-primary flex items-center justify-center text-primary-foreground mb-2">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold">Admin Login</h3>
                      <p className="text-sm text-muted-foreground">Enter password for admin access</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="mobile-admin-password">Admin Password</Label>
                        <div className="relative">
                          <Input
                            id="mobile-admin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter admin password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading || !password}>
                        {isLoading ? "Verifying..." : "Login"}
                      </Button>
                    </form>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:text-primary transition-colors duration-200 font-medium py-2 px-4 hover:bg-muted rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;