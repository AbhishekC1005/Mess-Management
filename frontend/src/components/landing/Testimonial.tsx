import React from 'react';

const Testimonial: React.FC = () => {
  return (
    <section id="testimonial" style={{ backgroundColor: '#FAFAFA', padding: '96px 0', width: '100%' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto', padding: '0 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '32px', alignItems: 'center' }}>
        
        {/* Accent Double Quote symbol in lime */}
        <div 
          style={{ 
            color: '#C8FF52',
            fontSize: '72px',
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
            height: '36px',
            userSelect: 'none'
          }}
        >
          “
        </div>
        
        {/* Large Centered Quote Text (24px) */}
        <blockquote 
          style={{ 
            fontSize: '24px', 
            fontWeight: 800, 
            lineHeight: 1.5,
            color: '#1C332E', 
            fontFamily: "'Google Sans', 'SN Pro', sans-serif",
            margin: 0,
            maxWidth: '750px'
          }}
        >
          MessManager helped our canteen reduce operational expenses and food waste, while increasing the compliance, resource allocation and overall effectiveness of our dining operations. Diners love the Telegram chatbot!
        </blockquote>

        {/* Overlapping circular avatars & attributions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div 
              style={{ 
                display: 'inline-flex',
                height: '44px',
                width: '44px',
                borderRadius: '9999px',
                border: '2px solid #FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '12px',
                backgroundColor: '#1C332E', 
                color: '#C8FF52',
                zIndex: 10,
                marginRight: '-12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              AC
            </div>
            <div 
              style={{ 
                display: 'inline-flex',
                height: '44px',
                width: '44px',
                borderRadius: '9999px',
                border: '2px solid #FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '12px',
                backgroundColor: '#C8FF52', 
                color: '#1C332E',
                zIndex: 5,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              AS
            </div>
          </div>
          
          {/* Reviewer Credits */}
          <div style={{ textAlign: 'center' }}>
            <h5 style={{ fontSize: '14px', fontWeight: 800, color: '#1C332E', fontFamily: "'Google Sans', 'SN Pro', sans-serif", margin: 0 }}>Abhishek Chaudhari</h5>
            <p style={{ fontSize: '12px', color: '#9EA8B0', fontWeight: 600, fontFamily: "'Roboto', sans-serif", margin: '4px 0 0 0' }}>Head of Operations, Tech-Hostel Plaza Networks</p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Testimonial;
