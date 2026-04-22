import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock, User, MessageSquare } from "lucide-react";

const Contact = () => {
  const advisors = [
    {
      name: "Errick Prince", // Change this to your actual advisor's name
      title: "DECA Advisor",
      email: "errick_prince@roundrockisd.org", // Change this to the real email
      phone: "512-428-7234", // Change this to the real phone number
      office: "Portable 12A", // Change this to the actual room number
    },
    {
      name: "Anthony Ripley", // Change this to your assistant advisor's name
      title: "Assistant DECA Advisor",
      email: "anthony_ripley@roundrockisd.org", // Change this to the real email
      phone: "512-428-7137", // Change this to the real phone number
      office: "Room D106", // Change this to the actual room number
    }
  ];

  const contactMethods = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Remind",
      description: "Text @stpdeca26 to 81010",
      primary: true
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email", 
      description: "stp_deca@roundrockisd.org",
      primary: false
    }
  ];

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Contact Us
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions? Want to learn more? Our advisors and officers are here to help!
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 max-w-2xl mx-auto">
          {contactMethods.map((method, index) => (
            <Card key={index} className={`text-center group hover:shadow-xl transition-all duration-300 ${method.primary ? 'border-primary border-2' : ''}`}>
              <CardHeader className="pb-4">
                <div className={`w-16 h-16 mx-auto rounded-xl ${method.primary ? 'bg-primary' : 'bg-muted'} flex items-center justify-center ${method.primary ? 'text-primary-foreground' : 'text-muted-foreground'} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {method.icon}
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {method.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {method.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chapter Advisors */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Chapter Advisors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {advisors.map((advisor, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform duration-300">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-foreground">
                        {advisor.name}
                      </CardTitle>
                      <CardDescription className="text-base text-muted-foreground">
                        {advisor.title}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{advisor.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{advisor.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{advisor.office}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Meeting Information */}
        <div className="mt-16 bg-background/80 backdrop-blur-sm rounded-xl p-8 border text-center">
          <p className="text-muted-foreground">
            New members are always welcome! No prior business experience required.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;