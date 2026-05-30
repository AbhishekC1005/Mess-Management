import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Smartphone, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight,
  FileSpreadsheet,
  Calendar,
  Send
} from 'lucide-react';

const Integrations: React.FC = () => {
  // Responsive state tracker for bulletproof viewport layout
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const integrationList = [
    { label: 'Telegram Bot', desc: 'AI Dining Agent', icon: <MessageSquare className="text-indigo-600 animate-pulse" /> },
    { label: 'WhatsApp', desc: 'Broadcast alerts', icon: <Smartphone className="text-green-500" /> },
    { label: 'Stripe Pay', desc: 'Auto subscriptions', icon: <DollarSign className="text-purple-600" /> },
    { label: 'Razorpay', desc: 'UPI diner bills', icon: <CheckCircle2 className="text-blue-500" /> },
    { label: 'Google Sheets', desc: 'Export reports', icon: <FileSpreadsheet className="text-emerald-600" /> },
    { label: 'Slack App', desc: 'Menu broadcasts', icon: <MessageSquare className="text-pink-600" /> },
    { label: 'Google Calendar', desc: 'Cutoff schedules', icon: <Calendar className="text-red-500" /> },
    { label: 'Twilio SMS', desc: 'Diner alerts', icon: <Send className="text-sky-500" /> }
  ];

  return (
    <section id="integrations" className="bg-grid-pattern-dark" style={{ backgroundColor: '#1C332E', padding: '96px 0', width: '100%', position: 'relative', overflow: 'hidden' }}>
      
      {/* Glow spotlight */}
      <div 
        style={{ 
          position: 'absolute',
          top: 0,
          right: 0,
          width: '500px',
          height: '500px',
          backgroundImage: 'radial-gradient(circle, rgba(200, 255, 82, 0.04) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10, textAlign: 'center' }}>
        
        {/* Overline Badge */}
        <span 
          style={{ 
            color: '#C8FF52', 
            backgroundColor: 'rgba(200, 255, 82, 0.1)', 
            border: '1px solid rgba(200, 255, 82, 0.2)',
            fontFamily: "'Roboto', sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '6px 16px',
            borderRadius: '9999px',
            display: 'inline-flex',
            marginBottom: '24px'
          }}
        >
          Integrations
        </span>

        {/* Headings */}
        <h2 
          style={{ 
            fontSize: isDesktop ? '38px' : '28px', 
            fontWeight: 800, 
            color: '#FFFFFF', 
            fontFamily: "'Google Sans', 'SN Pro', sans-serif",
            lineHeight: 1.2,
            marginBottom: '16px'
          }}
        >
          Don't replace. Integrate.
        </h2>
        <p 
          style={{ 
            fontSize: '15px', 
            color: 'rgba(255, 255, 255, 0.65)', 
            fontFamily: "'Roboto', sans-serif", 
            lineHeight: 1.6, 
            maxWidth: '650px', 
            margin: '0 auto 32px auto' 
          }}
        >
          We understand the hassle of switching dashboards. That's why MessManager interfaces directly with user platforms, schedulers, and payment APIs seamlessly.
        </p>

        {/* All Integrations link */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '64px' }}>
          <a 
            href="#sandbox" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '14px', 
              fontWeight: 700, 
              color: '#FFFFFF', 
              textDecoration: 'none',
              transition: 'opacity 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            All Integrations <ArrowRight size={16} />
          </a>
        </div>

        {/* Squircle Cards Grid (2 rows) */}
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div 
            style={{ 
              display: 'grid',
              gridTemplateColumns: isDesktop ? 'repeat(4, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))',
              gap: '24px',
              justifyContent: 'center'
            }}
          >
            
            {integrationList.map((item, index) => (
              <div 
                key={index} 
                className="group cursor-pointer hover:translate-y-[-4px]"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid rgba(28, 51, 46, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}>
                  {item.icon}
                </div>
                <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#1C332E', fontFamily: "'Google Sans', 'SN Pro', sans-serif", textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>{item.label}</h4>
                <p style={{ fontSize: '10px', color: '#9EA8B0', fontFamily: "'Roboto', sans-serif", marginTop: '4px', margin: '4px 0 0 0' }}>{item.desc}</p>
              </div>
            ))}

          </div>
        </div>

      </div>
    </section>
  );
};

export default Integrations;
