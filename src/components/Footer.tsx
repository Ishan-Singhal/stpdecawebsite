import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { name: "About DECA", href: "#about" },
    { name: "Events", href: "#events" },
    { name: "Competitions", href: "#competitions" },
    { name: "Resources", href: "#resources" },
    { name: "Join Us", href: "#join" },
    { name: "Contact", href: "#contact" }
  ];

  const externalLinks = [
    { name: "National DECA", href: "https://www.deca.org" },
    { name: "Texas DECA", href: "https://www.texasdeca.org/" },
    { name: "DECA Points", href: "#points" },
    { name: "Chapter Calendar", href: "#events" }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <span className="text-secondary-foreground font-bold text-lg">SP</span>
              </div>
              <div>
                <h1 className="font-bold text-xl">Stony Point DECA</h1>
                <p className="text-primary-foreground/80 text-sm">Empowering Future Business Leaders</p>
              </div>
            </div>
            <p className="text-primary-foreground/90 mb-6 max-w-md">
              Join our dynamic community of high school students passionate about business, 
              marketing, and entrepreneurship. Compete, learn, and grow with us!
            </p>
            <div className="bg-primary-foreground/10 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <MessageSquare className="mr-2" size={16} />
                <span className="font-semibold">Join Our Remind</span>
              </div>
              <p className="text-sm">
                Text <span className="font-bold text-secondary">@stpdeca25</span> to <span className="font-bold text-secondary">81010</span>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* External Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Resources</h3>
            <ul className="space-y-3">
              {externalLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors duration-200 flex items-center"
                    target={link.href.startsWith('http') ? '_blank' : '_self'}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
                  >
                    {link.name}
                    {link.href.startsWith('http') && <ExternalLink className="w-3 h-3 ml-1" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Meeting Info */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="bg-primary-foreground/10 rounded-lg p-6 text-center">
            <h4 className="font-semibold text-lg mb-2">Chapter Meetings</h4>
            <p className="text-primary-foreground/90">
              Every Tuesday at 4:30 PM in Room D106 • New members welcome!
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/80">
          <p>&copy; 2024 Stony Point DECA. All rights reserved.</p>
          <p className="text-sm mt-2">
            Preparing emerging leaders and entrepreneurs for careers in marketing, finance, hospitality, and management.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;