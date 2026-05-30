import React, { useState, useEffect } from 'react';
import { ChefHat } from 'lucide-react';

const Footer: React.FC = () => {
  // Responsive state tracker for bulletproof viewport layout
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <footer style={{ backgroundColor: '#1C332E', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '64px', paddingBottom: '40px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-40 pointer-events-none" />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        {/* Footer Top Links columns */}
        <div 
          style={{ 
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(5, minmax(0, 1fr))' : '1fr',
            gap: '32px',
            paddingBottom: '48px'
          }}
        >
          
          {/* Left brand & contact details (Spans 2 columns) */}
          <div style={{ gridColumn: isDesktop ? 'span 2' : 'span 1', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#C8FF52', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C332E' }}>
                <ChefHat size={18} />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', fontFamily: "'Google Sans', 'SN Pro', sans-serif" }}>MessManager</span>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6, maxWidth: '320px', margin: 0, fontFamily: "'Roboto', sans-serif" }}>
              The ultimate enterprise multi-tenant automation manager. Run modern, zero-waste dining facilities with complete API scopes and secure AI Telegram Diner agents.
            </p>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '8px', fontFamily: "'Roboto', sans-serif" }}>
              <p style={{ margin: 0 }}>📩 hello@messmanager.com</p>
              <p style={{ margin: 0 }}>📞 +91 98765 43210</p>
            </div>
          </div>

          {/* Quick Links Column 1: Solutions */}
          <div style={{ textAlign: 'left' }}>
            <h5 style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', fontFamily: "'Google Sans', 'SN Pro', sans-serif" }}>Solution</h5>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: "'Roboto', sans-serif" }}>
              <li><a href="#features" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">Hostel Dashboard</a></li>
              <li><a href="#features" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">Cutoff Scheduler</a></li>
              <li><a href="#sandbox" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">Telegram AI Bot</a></li>
              <li><a href="#integrations" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">Integrations Hub</a></li>
              <li><a href="#features" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">Audit Ledgers</a></li>
            </ul>
          </div>

          {/* Quick Links Column 2: Customers */}
          <div style={{ textAlign: 'left' }}>
            <h5 style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', fontFamily: "'Google Sans', 'SN Pro', sans-serif" }}>Customers</h5>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: "'Roboto', sans-serif" }}>
              <li><a href="#testimonial" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">Tech-Hostels</a></li>
              <li><a href="#testimonial" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">Corporate Diners</a></li>
              <li><a href="#testimonial" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">Caterer Portals</a></li>
              <li><a href="#testimonial" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">Diner Guides</a></li>
              <li><a href="#testimonial" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">Case Studies</a></li>
            </ul>
          </div>

          {/* Quick Links Column 3: Resources */}
          <div style={{ textAlign: 'left' }}>
            <h5 style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', fontFamily: "'Google Sans', 'SN Pro', sans-serif" }}>Resources</h5>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: "'Roboto', sans-serif" }}>
              <li><a href="#features" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">API Keys Hub</a></li>
              <li><a href="#features" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">Flyway Migrations</a></li>
              <li><a href="#features" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">OpenAPI Reference</a></li>
              <li><a href="#features" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#features" style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }} className="hover:text-white">Security Controls</a></li>
            </ul>
          </div>

        </div>

        {/* Social Link rows & copyright */}
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: isDesktop ? 'row' : 'column',
            alignItems: 'center', 
            justifyContent: 'space-between', 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.4)',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '32px',
            fontFamily: "'Roboto', sans-serif",
            gap: '16px'
          }}
        >
          <p style={{ margin: 0 }}>© Copyright 2026 MessManager. All rights reserved.</p>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '24px', fontWeight: 600 }}>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.5)', textDecoration: 'none' }} className="hover:text-white">Twitter</a>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.5)', textDecoration: 'none' }} className="hover:text-white">LinkedIn</a>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.5)', textDecoration: 'none' }} className="hover:text-white">GitHub</a>
            <a href="#" style={{ color: 'rgba(255, 255, 255, 0.5)', textDecoration: 'none' }} className="hover:text-white">Facebook</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
