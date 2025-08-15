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
      const GOOGLE_APPS_SCRIPT_URL = await DECAConfig.getGoogleAppsScriptUrl();
      
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

  // Fixed date parsing function
  const parseEventDateTime = (event: any) => {
    try {
      // First, try to use ISO format if available (from updated GAS)
      if (event.startTimeISO) {
        return new Date(event.startTimeISO);
      }
      
      // Handle different date formats more safely
      let eventDateTime;
      
      if (event.date.includes('-') && event.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // ISO date format (YYYY-MM-DD)
        const timeStr = event.time.split(' - ')[0].trim();
        
        // Handle "All Day" events
        if (timeStr.toLowerCase() === 'all day') {
          eventDateTime = new Date(`${event.date}T09:00:00`);
        } else {
          // Parse time more carefully
          let hour = 0, minute = 0;
          const timeMatch = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
          
          if (timeMatch) {
            hour = parseInt(timeMatch[1]);
            minute = parseInt(timeMatch[2]) || 0;
            const isPM = timeMatch[3]?.toLowerCase() === 'pm';
            
            if (isPM && hour !== 12) hour += 12;
            if (!isPM && hour === 12) hour = 0;
          }
          
          eventDateTime = new Date(`${event.date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
        }
      } else {
        // Try parsing as a regular date string
        const timeStr = event.time.split(' - ')[0].trim();
        
        if (timeStr.toLowerCase() === 'all day') {
          eventDateTime = new Date(`${event.date} 09:00:00`);
        } else {
          eventDateTime = new Date(`${event.date} ${timeStr}`);
        }
      }
      
      // Validate the parsed date
      if (isNaN(eventDateTime.getTime())) {
        console.warn(`Invalid date parsed for event: ${event.title}, using fallback`);
        // Fallback to a future date so event still shows
        eventDateTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }
      
      return eventDateTime;
    } catch (error) {
      console.error(`Error parsing date for event ${event.title}:`, error);
      // Return tomorrow's date as fallback
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  };

  const filterUpcomingEvents = (eventList: any[]) => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const now = new Date();
    
    console.log("🕐 Current time:", now.toISOString());
    
    return eventList
      .filter(event => {
        try {
          const eventDateTime = parseEventDateTime(event);
          const isUpcoming = isAfter(eventDateTime, now);
          
          console.log(`📅 Event: ${event.title}`);
          console.log(`   Parsed DateTime: ${eventDateTime.toISOString()}`);
          console.log(`   Is upcoming: ${isUpcoming}`);
          
          return isUpcoming;
        } catch (error) {
          console.error(`Error filtering event ${event.title}:`, error);
          return true; // Keep event if parsing fails
        }
      })
      .sort((a, b) => {
        try {
          const dateA = parseEventDateTime(a);
          const dateB = parseEventDateTime(b);
          return dateA.getTime() - dateB.getTime();
        } catch (error) {
          console.error('Error sorting events:', error);
          return 0;
        }
      })
      .slice(0, 6); // Show max 6 upcoming events
  };
  
  const upcomingEvents = events || defaultEvents;

  const handleRefreshEvents = async () => {
    const GOOGLE_APPS_SCRIPT_URL = await DECAConfig.getGoogleAppsScriptUrl();
    
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
    try {
      const eventDateTime = parseEventDateTime(event);
      const endDateTime = new Date(eventDateTime.getTime() + (60 * 60 * 1000)); // Default 1 hour duration
      
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${formatDate(eventDateTime)}/${formatDate(endDateTime)}`,
        details: event.description,
        location: event.location,
      });
      
      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    } catch (error) {
      console.error('Error generating calendar link:', error);
      return 'https://calendar.google.com';
    }
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

  // Safe date formatting function
  const formatEventDate = (event: any) => {
    try {
      const eventDateTime = parseEventDateTime(event);
      return eventDateTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date TBD';
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
                    <span>{formatEventDate(event)}</span>
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