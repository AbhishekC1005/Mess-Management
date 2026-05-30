import React, { useState, useEffect } from 'react';

const Stats: React.FC = () => {
  // Responsive state tracker for bulletproof viewport layout
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section 
      style={{ 
        backgroundColor: '#FAFAFA', 
        borderTop: '1px solid rgba(28, 51, 46, 0.05)', 
        borderBottom: '1px solid rgba(28, 51, 46, 0.05)', 
        padding: '64px 0',
        width: '100%' 
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        <div 
          style={{ 
            display: 'flex',
            flexDirection: isDesktop ? 'row' : 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: isDesktop ? '0px' : '48px',
            textAlign: 'center'
          }}
        >
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '50px', fontWeight: 800, color: '#1C332E', fontFamily: "'Google Sans', 'SN Pro', sans-serif", margin: 0, lineHeight: 1 }}>2024</h2>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9EA8B0', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontFamily: "'Roboto', sans-serif" }}>MessManager Founded</p>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '50px', fontWeight: 800, color: '#1C332E', fontFamily: "'Google Sans', 'SN Pro', sans-serif", margin: 0, lineHeight: 1 }}>100K+</h2>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9EA8B0', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontFamily: "'Roboto', sans-serif" }}>Active Diners Served</p>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '50px', fontWeight: 800, color: '#1C332E', fontFamily: "'Google Sans', 'SN Pro', sans-serif", margin: 0, lineHeight: 1 }}>400+</h2>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#9EA8B0', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontFamily: "'Roboto', sans-serif" }}>Canteens Automated</p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Stats;
