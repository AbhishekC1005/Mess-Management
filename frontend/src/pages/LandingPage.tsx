import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import BentoFeatures from '../components/landing/BentoFeatures';
import ChatSandbox from '../components/landing/ChatSandbox';
import Integrations from '../components/landing/Integrations';
import Testimonial from '../components/landing/Testimonial';
import Stats from '../components/landing/Stats';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen font-sans antialiased" style={{ backgroundColor: '#F3F5F4' }}>
      {/* 1. Glassmorphic Navigation Header */}
      <Navbar isAuthenticated={isAuthenticated} />
      
      {/* 2. Hero Header & Actions */}
      <Hero />
      
      {/* 3. Features Bento Layout Cards (Includes Dashboard Mockup) */}
      <BentoFeatures />
      
      {/* 4. Live Chatbot Interaction Sandbox */}
      <ChatSandbox />
      
      {/* 5. App Integrations Showcase */}
      <Integrations />
      
      {/* 6. Testimonial Quote Callout */}
      <Testimonial />
      
      {/* 7. Platform Statistics Panel */}
      <Stats />
      
      {/* 8. Call to Action Banner */}
      <CTA />
      
      {/* 9. Detailed Forest Green Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
