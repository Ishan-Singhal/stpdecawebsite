import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Trophy, Calendar, Users, Award, Star } from "lucide-react";
import DECAConfig from "@/lib/DECAConfig";

const PointsTracker = () => {
  const [studentId, setStudentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [memberData, setMemberData] = useState<any>(null);
  const { toast } = useToast();

  // Check admin status and load member data from Google Sheets
  useEffect(() => {
    const checkAdminStatus = () => {
      const adminStatus = localStorage.getItem("deca-admin-logged-in") === "true";
      setIsAdmin(adminStatus);
    };

    const loadMemberDataFromGoogle = async () => {
      // Get URL from centralized config
      const GOOGLE_APPS_SCRIPT_URL = await DECAConfig.getGoogleAppsScriptUrl();
      
      try {
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?type=points`);
        const data = await response.json();
        if (data.members) {
          setMemberData(data.members);
        }
      } catch (error) {
        console.log("Using default data - Google integration not set up yet");
      }
    };

    checkAdminStatus();
    loadMemberDataFromGoogle();
    
    // Listen for storage events from the header login
    window.addEventListener('storage', checkAdminStatus);
    
    return () => {
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, []);

  // Sample data structure (this would come from Google Sheets)
  const sampleMemberData = {
    name: "John Smith",
    studentId: "12345",
    totalPoints: 425,
    rank: 3,
    categories: {
      competitions: { points: 200, activities: ["Regional Business Plan - 1st Place", "State Marketing - 3rd Place"] },
      meetings: { points: 120, activities: ["Attended 12/15 meetings"] },
      community: { points: 75, activities: ["Food Drive Volunteer", "Career Fair Helper"] },
      leadership: { points: 30, activities: ["New Member Mentor"] }
    },
    recentActivity: [
      { date: "2024-03-15", activity: "Regional Competition", points: 50, type: "competition" },
      { date: "2024-03-10", activity: "Chapter Meeting", points: 10, type: "meeting" },
      { date: "2024-03-05", activity: "Community Service", points: 25, type: "community" }
    ]
  };

  const handleLookupStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studentId) {
      toast({
        title: "Error",
        description: "Please enter your Student ID",
        variant: "destructive",
      });
      return;
    }

    // Get URL from centralized config
    const GOOGLE_APPS_SCRIPT_URL = await DECAConfig.getGoogleAppsScriptUrl();
    
    setIsLoading(true);

    try {
      console.log('SIMPLIFIED: Looking up student in Google Sheets...');
      
      // Direct GET request to fetch all points data
      const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?type=points`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Got response from Google Apps Script:', result);
      
      if (result.success && result.members && Array.isArray(result.members)) {
        // Find the student in the members array
        const student = result.members.find((member: any) => 
          member.studentId.toString() === studentId.toString()
        );
        
        if (student) {
          // Convert the member data to the expected student data format
          const studentData = {
            name: student.name,
            studentId: studentId,
            totalPoints: student.totalPoints,
            rank: student.rank,
            categories: {
              competitions: { 
                points: student.competitionPoints, 
                activities: student.competitionPoints > 0 ? [`Earned ${student.competitionPoints} competition points`] : ['No competition activities recorded'] 
              },
              meetings: { 
                points: student.meetingPoints, 
                activities: student.meetingPoints > 0 ? [`Earned ${student.meetingPoints} meeting points`] : ['No meeting attendance recorded'] 
              },
              community: { 
                points: student.communityPoints, 
                activities: student.communityPoints > 0 ? [`Earned ${student.communityPoints} community service points`] : ['No community service recorded'] 
              },
              leadership: { 
                points: student.leadershipPoints, 
                activities: student.leadershipPoints > 0 ? [`Earned ${student.leadershipPoints} leadership points`] : ['No leadership activities recorded'] 
              }
            },
            recentActivity: [
              { date: new Date().toISOString().split('T')[0], activity: "Data from Google Sheets", points: student.totalPoints, type: "system" }
            ]
          };
          
          setStudentData(studentData);
          toast({
            title: "Success",
            description: `Found ${student.name} with ${student.totalPoints} points!`,
          });
        } else {
          toast({
            title: "Not Found", 
            description: `Student ID ${studentId} not found. Available IDs: ${result.members.map((m: any) => m.studentId).join(', ')}`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Invalid response format from Google Sheets.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Student lookup failed:', error);
      toast({
        title: "Lookup Failed",
        description: "Failed to lookup student data. Make sure your Google Apps Script is properly configured.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'competitions': return <Trophy className="w-5 h-5" />;
      case 'meetings': return <Calendar className="w-5 h-5" />;
      case 'community': return <Users className="w-5 h-5" />;
      case 'leadership': return <Award className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  // Use dynamic member data if available, otherwise use defaults
  const members = memberData || [sampleMemberData];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'competitions': return 'bg-primary text-primary-foreground';
      case 'meetings': return 'bg-secondary text-secondary-foreground';
      case 'community': return 'bg-accent text-accent-foreground';
      case 'leadership': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <section id="points" className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            DECA Points Tracker
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Track your participation points and see how you rank among chapter members
          </p>
        </div>

        {/* Student Lookup */}
        <Card className="max-w-md mx-auto mb-12">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Look Up Your Points</span>
            </CardTitle>
            <CardDescription>
              Enter your Student ID to view your DECA points and rankings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookupStudent} className="space-y-4">
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  type="text"
                  placeholder="Enter your Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Looking up..." : "View My Points"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Student Data Display */}
        {studentData && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Card */}
            <Card className="border-primary/20">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <span className="text-2xl font-bold">{studentData.rank}</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{studentData.name}</CardTitle>
                    <CardDescription>Student ID: {studentData.studentId}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{studentData.totalPoints}</div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary">#{studentData.rank}</div>
                    <div className="text-sm text-muted-foreground">Chapter Rank</div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Categories Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(studentData.categories).map(([category, data]: [string, any]) => (
                <Card key={category} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${getCategoryColor(category)} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
                      {getCategoryIcon(category)}
                    </div>
                    <CardTitle className="text-lg capitalize">{category}</CardTitle>
                    <CardDescription className="text-2xl font-bold text-foreground">
                      {data.points} pts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.activities.map((activity: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs block">
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest point-earning activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {studentData.recentActivity.map((activity: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full ${getCategoryColor(activity.type)} flex items-center justify-center`}>
                          {getCategoryIcon(activity.type)}
                        </div>
                        <div>
                          <div className="font-medium">{activity.activity}</div>
                          <div className="text-sm text-muted-foreground">{activity.date}</div>
                        </div>
                      </div>
                      <Badge variant="secondary">+{activity.points} pts</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default PointsTracker;