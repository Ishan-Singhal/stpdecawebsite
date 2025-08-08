import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, ExternalLink, RefreshCw, Plus } from "lucide-react";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { isAfter, parseISO, format } from "date-fns";
import DECAConfig from "@/lib/DECAConfig";

const UpcomingEvents = () => {
  // Use dynamic events if available, otherwise use defaults
  const defaultEvents = [
    {
      title: "Regional Competition Prep Workshop",
      date: "2024-12-15",
      time: "3:30 PM - 5:00 PM",
      location: "Room 205",
      description: "Intensive preparation session for upcoming regional competitions. Practice rounds and feedback sessions included.",
      type: "Workshop",
      urgent: false,
      calendarLink: "#"
    },
    {
      title: "Business Plan Competition",
      date: "2024-12-22",
      time: "All Day",
      location: "Austin Convention Center",
      description: "State-level business plan competition. Transportation provided for qualified participants.",
      type: "Competition",
      urgent: true,
      calendarLink: "#"
    },
    {
      title: "Industry Guest Speaker: Marketing Trends",
      date: "2024-12-28",
      time: "4:00 PM - 5:30 PM",
      location: "Auditorium",
      description: "Local marketing executive will share insights on current industry trends and career paths.",
      type: "Speaker Event",
      urgent: false,
      calendarLink: "#"
    },
    {
      title: "DECA Social & Team Building",
      date: "2025-01-05",
      time: "6:00 PM - 8:00 PM",
      location: "School Cafeteria",
      description: "End-of-semester social event with games, food, and team building activities. All members welcome!",
      type: "Social",
      urgent: false,
      calendarLink: "#"
    }
  ];

  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Check admin status and load events from Google Apps Script
  useEffect(() => {
    const checkAdminStatus = () => {
      const adminStatus = localStorage.getItem("deca-admin-logged-in") === "true";
      setIsAdmin(adminStatus);
    };

    const loadEventsFromGoogle = async () => {
      // Get URL from centralized config
      const GOOGLE_APPS_SCRIPT_URL = DECAConfig.getGoogleAppsScriptUrl();
      
      try {
        console.log("🔍 Fetching events from:", GOOGLE_APPS_SCRIPT_URL);
        const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?type=events`);
        const data = await response.json();
        console.log("📅 Raw response from Google Apps Script:", data);
        console.log("📅 Events array:", data.events);
        console.log("📅 Events array length:", data.events?.length);
        
        if (data.events && data.events.length > 0) {
          setEvents(data.events);
          console.log("✅ Set events state to:", data.events);
        } else {
          console.log("❌ No events in response, using default events");
          setEvents(defaultEvents);
        }
      } catch (error) {
        console.log("❌ Error fetching events:", error);
        console.log("Using default events - Google integration failed");
        setEvents(defaultEvents);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
    loadEventsFromGoogle();
    
    // Auto-refresh events every hour
    const refreshInterval = setInterval(loadEventsFromGoogle, 60 * 60 * 1000);
    
    // Listen for storage events from admin setup
    window.addEventListener('storage', checkAdminStatus);
    
    return () => {
      window.removeEventListener('storage', checkAdminStatus);
      clearInterval(refreshInterval);
    };
  }, []);


  const filterUpcomingEvents = (eventList: any[]) => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = toZonedTime(new Date(), userTimezone);
    
    console.log("🕐 Current time in timezone:", formatInTimeZone(now, userTimezone, 'yyyy-MM-dd HH:mm:ss zzz'));
    
    return eventList
      .filter(event => {
        try {
          // Parse event date and time
          let eventDateTime;
          
          if (event.date.includes('-')) {
            // ISO format (YYYY-MM-DD)
            const timeStr = event.time.split(' - ')[0]; // Get start time
            const dateTimeStr = `${event.date} ${timeStr}`;
            eventDateTime = new Date(dateTimeStr);
          } else {
            // "March 15, 2024" format
            const timeStr = event.time.split(' - ')[0];
            const dateTimeStr = `${event.date} ${timeStr}`;
            eventDateTime = new Date(dateTimeStr);
          }
          
          // Convert to user's timezone
          const eventInUserTz = toZonedTime(eventDateTime, userTimezone);
          const isUpcoming = isAfter(eventInUserTz, now);
          
          console.log(`📅 Event: ${event.title}`);
          console.log(`   Date/Time: ${formatInTimeZone(eventInUserTz, userTimezone, 'yyyy-MM-dd HH:mm:ss zzz')}`);
          console.log(`   Is upcoming: ${isUpcoming}`);
          
          return isUpcoming;
        } catch (error) {
          console.error(`Error parsing event date/time for ${event.title}:`, error);
          return true; // Keep event if parsing fails
        }
      })
      .sort((a, b) => {
        const dateA = new Date(a.date.includes('-') ? `${a.date} ${a.time.split(' - ')[0]}` : `${a.date} ${a.time.split(' - ')[0]}`);
        const dateB = new Date(b.date.includes('-') ? `${b.date} ${b.time.split(' - ')[0]}` : `${b.date} ${b.time.split(' - ')[0]}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 6); // Show max 6 upcoming events
  };
  
  const upcomingEvents = events || defaultEvents;

  const handleRefreshEvents = async () => {
    const GOOGLE_APPS_SCRIPT_URL = DECAConfig.getGoogleAppsScriptUrl();
    
    setIsLoading(true);
    try {
      console.log("🔄 Refreshing events from:", GOOGLE_APPS_SCRIPT_URL);
      const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?type=events`);
      const data = await response.json();
      console.log("🔄 Refresh response:", data);
      
      if (data.events) {
        setEvents(data.events);
        console.log("✅ Refresh: Set events state to:", data.events);
      } else {
        console.log("❌ Refresh: No events property in response");
      }

      toast({
        title: "Events Refreshed",
        description: `Calendar events have been updated. Found ${data.events?.length || 0} events.`,
      });
    } catch (error) {
      console.error('❌ Refresh failed:', error);
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh events. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use dynamic events if available, otherwise use defaults
  const allEvents = events || defaultEvents;
  const eventList = filterUpcomingEvents(allEvents);
  console.log("🎯 Current events state:", events);
  console.log("🎯 All events:", allEvents);
  console.log("🎯 Filtered upcoming events:", eventList);

  const generateGoogleCalendarLink = (event: any) => {
    // Handle different date formats
    let eventDate;
    if (event.date.includes('-')) {
      // ISO format (YYYY-MM-DD)
      eventDate = event.date;
    } else {
      // Convert "March 15, 2024" format to ISO
      eventDate = new Date(event.date).toISOString().split('T')[0];
    }
    
    const startDate = new Date(eventDate + ' ' + event.time.split(' - ')[0]);
    const endDate = new Date(eventDate + ' ' + (event.time.split(' - ')[1] || event.time.split(' - ')[0]));
    
    // If end time parsing fails, default to 1 hour after start
    if (isNaN(endDate.getTime())) {
      endDate.setTime(startDate.getTime() + (60 * 60 * 1000));
    }
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: event.description,
      location: event.location,
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const getTypeColor = (type: string, urgent: boolean) => {
    if (urgent) return "bg-destructive text-destructive-foreground";
    switch (type) {
      case "Competition": return "bg-primary text-primary-foreground";
      case "Workshop": return "bg-secondary text-secondary-foreground";
      case "Speaker Event": return "bg-accent text-accent-foreground";
      case "Social": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <section id="events" className="py-20 bg-background">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Upcoming Events
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay updated with our latest competitions, workshops, and social events
          </p>
        </div>

        {isAdmin && (
          <div className="mb-8 flex gap-2">
            <Button 
              onClick={handleRefreshEvents}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {isLoading ? 'Refreshing...' : 'Refresh Events'}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          {eventList.map((event: any, index: number) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(event.type, event.urgent)}`}>
                    {event.urgent ? "URGENT" : event.type}
                  </span>
                  {event.urgent && (
                    <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
                  )}
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {event.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{event.date.includes('-') ? 
                      formatInTimeZone(new Date(event.date), Intl.DateTimeFormat().resolvedOptions().timeZone, 'EEEE, MMMM d, yyyy') :
                      new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    }</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <CardDescription className="text-base leading-relaxed mb-4">
                  {event.description}
                </CardDescription>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => window.open(generateGoogleCalendarLink(event), '_blank')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                  {event.externalLink && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(event.externalLink, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mb-8">
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => window.open('https://calendar.google.com/calendar/u/0/embed?src=c_53aee3e49de1e268dd7365870ed3cd228534cf2bf84b0490f5d1a4fa48603ca9@group.calendar.google.com&ctz=America/Chicago', '_blank')}
          >
            View Full Calendar
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;