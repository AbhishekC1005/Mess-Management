import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CTA: React.FC = () => {
  const navigate = useNavigate();

  // Responsive state tracker for bulletproof viewport layout
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section id="pricing" className="bg-grid-pattern-dark" style={{ backgroundColor: '#1C332E', padding: '80px 0', width: '100%', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid-pattern-dark opacity-60 pointer-events-none" />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div 
          style={{ 
            display: 'flex',
            flexDirection: isDesktop ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '32px',
            textAlign: isDesktop ? 'left' : 'center'
          }}
        >
          
          {/* Left Text Column */}
          <div style={{ maxWidth: '550px' }}>
            <h2 
              style={{ 
                fontSize: isDesktop ? '36px' : '26px', 
                fontWeight: 800, 
                color: '#FFFFFF', 
                fontFamily: 'Outfit, sans-serif',
                lineHeight: 1.25,
                margin: 0
              }}
            >
              Discover the full scale of <span style={{ position: 'relative', display: 'inline-block', color: '#C8FF52' }}>MessManager<span style={{ position: 'absolute', bottom: '2px', left: 0, width: '100%', height: '3px', borderRadius: '2px', backgroundColor: '#C8FF52' }} /></span> capabilities
            </h2>
          </div>
          
          {/* Right Actions Column */}
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: isDesktop ? 'row' : 'column',
              alignItems: 'center', 
              gap: '16px',
              flexShrink: 0,
              width: isDesktop ? 'auto' : '100%'
            }}
          >
            <button 
              onClick={() => navigate('/login')}
              style={{ 
                width: isDesktop ? 'auto' : '100%',
                padding: '14px 28px',
                color: '#FFFFFF',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)', 
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Roboto', sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Get a Demo
            </button>
            <button 
              onClick={() => navigate('/login')}
              style={{ 
                width: isDesktop ? 'auto' : '100%',
                padding: '14px 28px',
                color: '#1C332E',
                backgroundColor: '#C8FF52',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Roboto', sans-serif",
                boxShadow: '0 10px 25px -5px rgba(200, 255, 82, 0.4)' 
              }}
            >
              Start for free
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CTA;
