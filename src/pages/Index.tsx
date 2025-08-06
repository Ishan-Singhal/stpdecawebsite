import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhyJoinDeca from "@/components/WhyJoinDeca";
import UpcomingEvents from "@/components/UpcomingEvents";
import PointsTracker from "@/components/PointsTracker";
import Resources from "@/components/Resources";
import JoinUs from "@/components/JoinUs";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import AdminSettings from "@/components/AdminSettings";

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      setIsAdmin(localStorage.getItem('deca-admin-logged-in') === 'true');
    };

    checkAdminStatus();
    window.addEventListener('storage', checkAdminStatus);
    return () => window.removeEventListener('storage', checkAdminStatus);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <WhyJoinDeca />
      {isAdmin && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <AdminSettings />
          </div>
        </section>
      )}
      <UpcomingEvents />
      <PointsTracker />
      <Resources />
      <JoinUs />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
