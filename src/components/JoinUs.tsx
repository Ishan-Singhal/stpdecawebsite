import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Calendar, Star } from "lucide-react";

const JoinUs = () => {
  const benefits = [
    {
      icon: <Star className="w-6 h-6" />,
      title: "Exclusive Member Benefits",
      description: "Access to competitions, workshops, networking events, and scholarship opportunities"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Regular Events",
      description: "Monthly meetings, competition prep sessions, and fun social activities"
    }
  ];

const steps = [
  {
    number: "1",
    title: "Join Our Remind",
    description: "Text @stpdeca26 to 81010 to stay updated on all announcements and meetings"
  },
  {
    number: "2",
    title: "Fill Out the Membership Form",
    description: (
      <>
        <a 
          href="https://forms.gle/X63yrGVmeVeqGwYY9" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary underline font-bold"
        >
          Click here
        </a> to complete the membership form online
      </>
    )
  },
  {
    number: "3",
    title: "Attend a Meeting",
    description: "Come to our next chapter meeting to learn more and meet current members"
  },
  {
    number: "4",
    title: "Start Competing",
    description: "Choose your competition events and begin preparation with our team"
  }
];

  return (
    <section id="join" className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Join Stony Point DECA
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to take your business skills to the next level? Here's how to become part of our amazing community
          </p>
        </div>

        {/* Member Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 mx-auto rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-4 group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {benefit.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How to Join Steps */}
        <div className="max-w-4xl mx-auto mb-16">
          <h3 className="text-3xl font-bold text-center mb-12">How to Join</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-primary"></div>
                  )}
                </div>
                <h4 className="text-lg font-semibold mb-3 text-foreground">{step.title}</h4>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-primary rounded-xl p-8 text-center text-primary-foreground">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join Hundreds of DECA members who are already building their future in business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-background/20 rounded-lg p-4 inline-block">
              <div className="flex items-center justify-center mb-2">
                <MessageSquare className="mr-2" size={20} />
                <span className="text-lg font-semibold">Join Remind Now</span>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-background/10 rounded-lg">
            <p className="text-sm">
              Text <span className="font-bold">@stpdeca26</span> to <span className="font-bold">81010</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinUs;