import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Trophy, Users, Heart } from "lucide-react";
import competitionImage from "@/assets/deca-competition.jpg";
import leadershipImage from "@/assets/deca-leadership.jpg";
import funImage from "@/assets/deca-fun.jpg";

const WhyJoinDeca = () => {
  const benefits = [
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Business Career Exploration",
      description: "DECA provides opportunities to explore business and marketing careers through industry visits, guest speakers, and networking events",
      image: null,
      gradient: "from-primary to-primary-hover"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Competition",
      description: "Members can test their business knowledge and skills in competitions at local, state, and international levels, with opportunities to win scholarships and awards highly recognized by universities",
      image: competitionImage,
      gradient: "from-secondary to-secondary-hover"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Leadership Opportunities",
      description: "Develop leadership skills through chapter officer positions, community service projects, and organizing school business events",
      image: leadershipImage,
      gradient: "from-primary to-secondary"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Have Fun!",
      description: "From networking socials and workshops to field trips and team-building events, we focus on building friendships and having fun while learning",
      image: funImage,
      gradient: "from-secondary to-primary"
    }
  ];

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Why Join DECA?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover the incredible opportunities that await you as a member of Stony Point DECA
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-background/80 backdrop-blur-sm overflow-hidden">
              {benefit.image && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={benefit.image} 
                    alt={benefit.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader className="pb-4">
                <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-primary-foreground mb-4 group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {benefit.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed text-muted-foreground">
                  {benefit.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyJoinDeca;