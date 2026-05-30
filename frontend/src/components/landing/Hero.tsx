import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  // Responsive state tracker for bulletproof viewport layout
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Draggable avatars state (in percentages of the hero section container)
  const [positions, setPositions] = useState({
    avatar1: { x: 3, y: 15 },    // Top Left (Student)
    avatar2: { x: 92, y: 15 },   // Top Right (Woman)
    avatar3: { x: 1, y: 65 },    // Bottom Left (Chef)
    avatar4: { x: 94, y: 65 }    // Bottom Right (Manager)
  });

  const [draggedAvatar, setDraggedAvatar] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleStartDrag = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default browser dragging and text selection
    e.preventDefault();
    
    // Disable text selection globally during drag
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('changedTouches' in e && e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      const avatarPos = positions[id as keyof typeof positions];
      const avatarX = (avatarPos.x / 100) * rect.width;
      const avatarY = (avatarPos.y / 100) * rect.height;
      
      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;
      
      setDragOffset({
        x: clickX - avatarX,
        y: clickY - avatarY
      });
    }
    
    setDraggedAvatar(id);
  };

  useEffect(() => {
    if (!draggedAvatar) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      
      let clickX = clientX - rect.left;
      let clickY = clientY - rect.top;
      
      let newX = ((clickX - dragOffset.x) / rect.width) * 100;
      let newY = ((clickY - dragOffset.y) / rect.height) * 100;
      
      // Boundary constraints to keep the 68px elements fully inside the Hero Section
      if (newX < -3) newX = -3;
      if (newX > 95) newX = 95;
      if (newY < 2) newY = 2;
      if (newY > 88) newY = 88;
      
      setPositions(prev => ({
        ...prev,
        [draggedAvatar]: { x: newX, y: newY }
      }));
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEndDrag = () => {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      setDraggedAvatar(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEndDrag);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEndDrag);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEndDrag);
    };
  }, [draggedAvatar, dragOffset]);

  return (
    <section 
      ref={heroRef}
      style={{ 
        backgroundColor: '#F5F3EE',
        paddingTop: '176px', // Spacious top padding to push Hero content below the absolute navbar beautifully
        paddingBottom: '128px', // Spacious bottom padding to extend the hero section height beautifully
        position: 'relative', 
        overflow: 'hidden',
        width: '100%'
      }}
      className="bg-grid-pattern"
    >
      
      {/* Subtle Radial Neon spotlight */}
      <div 
        style={{ 
          position: 'absolute',
          top: '25%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '550px',
          height: '550px',
          backgroundImage: 'radial-gradient(circle, rgba(200, 255, 82, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />

      <div 
        style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 24px', 
          position: 'relative', 
          zIndex: 10
        }}
      >
        
        {/* Top Badge Pill */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <span 
            style={{ 
              backgroundColor: 'rgba(28, 51, 46, 0.04)', 
              border: '1px solid rgba(28, 51, 46, 0.08)', 
              color: '#1C332E',
              fontFamily: "'Roboto', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '6px 16px',
              borderRadius: '9999px'
            }}
          >
            <Sparkles size={11} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> MessManager for Diners
          </span>
        </div>

        {/* Centered Headline & Subtext (with relative avatars overlay) */}
        <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 64px auto', position: 'relative' }}>
          
          {/* Headline */}
          <h1 
            style={{ 
              fontSize: isDesktop ? '60px' : '36px', 
              fontWeight: 800, 
              lineHeight: 1.1, 
              color: '#1C332E', 
              fontFamily: "'Google Sans', 'SN Pro', sans-serif",
              letterSpacing: '-0.02em',
              marginBottom: '24px',
              position: 'relative',
              display: 'inline-block',
              maxWidth: '800px'
            }}
          >
            One tool to <span style={{ position: 'relative', display: 'inline-block' }}>manage<span style={{ position: 'absolute', bottom: '2px', left: 0, width: '100%', height: '5px', borderRadius: '9999px', backgroundColor: '#C8FF52' }} /></span> your canteen and diners
          </h1>

          <p 
            style={{ 
              fontSize: '15px', 
              color: '#5F6D7A', 
              lineHeight: 1.6, 
              maxWidth: '650px', 
              margin: '0 auto 40px auto', 
              fontFamily: "'Roboto', sans-serif",
              textAlign: 'center'
            }}
          >
            MessManager helps hostels, corporate offices, and caterers run highly-efficient dining halls with automated cutoff attendance, instant menu publishing, and zero manual spreadsheets.
          </p>

          {/* Centered Pill Buttons */}
          <div 
            style={{ 
              display: 'flex', 
              flexDirection: isDesktop ? 'row' : 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '16px' 
            }}
          >
            <button 
              onClick={() => navigate('/login')}
              style={{ 
                width: isDesktop ? 'auto' : '100%',
                padding: '16px 32px',
                color: '#FFFFFF',
                backgroundColor: '#1C332E',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Roboto', sans-serif",
                boxShadow: '0 8px 20px -6px rgba(28, 51, 46, 0.35)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                textAlign: 'center'
              }}
            >
              Start for Free
            </button>
            <a 
              href="#features"
              style={{ 
                width: isDesktop ? 'auto' : '100%',
                padding: '16px 32px',
                border: '1px solid #1C332E', 
                color: '#1C332E',
                backgroundColor: 'transparent',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Roboto', sans-serif",
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                textAlign: 'center',
                display: 'inline-block'
              }}
            >
              Get a Demo
            </a>
          </div>
        </div>

        {/* Floating Avatars moved outside the 850px text block, placed directly inside the 1200px grid box container! */}
        
        {/* Floating Avatar 1 (Top Left) */}
        <div 
          style={{ 
            position: 'absolute', 
            top: `${positions.avatar1.y}%`, 
            left: `${positions.avatar1.x}%`, 
            display: isDesktop ? 'flex' : 'none', 
            alignItems: 'center', 
            cursor: draggedAvatar === 'avatar1' ? 'grabbing' : 'grab',
            zIndex: draggedAvatar === 'avatar1' ? 99 : 30,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            transform: draggedAvatar === 'avatar1' ? 'scale(1.1)' : 'scale(1)',
            transition: draggedAvatar === 'avatar1' ? 'none' : 'transform 0.2s ease, top 0.2s cubic-bezier(0.16, 1, 0.3, 1), left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseDown={(e) => handleStartDrag('avatar1', e)}
          onTouchStart={(e) => handleStartDrag('avatar1', e)}
          draggable="false"
        >
          <div style={{ position: 'relative' }} draggable="false">
            <div 
              style={{ 
                width: '68px', 
                height: '68px', 
                borderRadius: '9999px',
                border: '4px solid #FFFFFF', 
                boxShadow: '0 12px 32px rgba(28, 51, 46, 0.15)', 
                overflow: 'hidden',
                backgroundColor: '#E5EFFE',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
              draggable="false"
            >
              <img src="/avatar-man1.png" alt="Student Diner" draggable="false" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none' }} />
            </div>
            
            {/* Arrow pointing up-left */}
            <div style={{ position: 'absolute', bottom: '-14px', right: '-14px', zIndex: 20 }} draggable="false">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))', transform: 'rotate(0deg)' }}>
                <path d="M4.5 3V17.5L9.2 13.2L14.2 21L17.5 19L12.5 11.2L18.5 10.2L4.5 3Z" fill="#1C332E" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Floating Avatar 2 (Top Right) */}
        <div 
          style={{ 
            position: 'absolute', 
            top: `${positions.avatar2.y}%`, 
            left: `${positions.avatar2.x}%`, 
            display: isDesktop ? 'flex' : 'none', 
            alignItems: 'center', 
            cursor: draggedAvatar === 'avatar2' ? 'grabbing' : 'grab',
            zIndex: draggedAvatar === 'avatar2' ? 99 : 30,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            transform: draggedAvatar === 'avatar2' ? 'scale(1.1)' : 'scale(1)',
            transition: draggedAvatar === 'avatar2' ? 'none' : 'transform 0.2s ease, top 0.2s cubic-bezier(0.16, 1, 0.3, 1), left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseDown={(e) => handleStartDrag('avatar2', e)}
          onTouchStart={(e) => handleStartDrag('avatar2', e)}
          draggable="false"
        >
          <div style={{ position: 'relative' }} draggable="false">
            <div 
              style={{ 
                width: '68px', 
                height: '68px', 
                borderRadius: '9999px',
                border: '4px solid #FFFFFF', 
                boxShadow: '0 12px 32px rgba(28, 51, 46, 0.15)', 
                overflow: 'hidden',
                backgroundColor: '#E1D5F0',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
              draggable="false"
            >
              <img src="/avatar-woman.png" alt="Diner Lead" draggable="false" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none' }} />
            </div>
            
            {/* Arrow pointing up-right */}
            <div style={{ position: 'absolute', bottom: '-14px', left: '-14px', zIndex: 20 }} draggable="false">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))', transform: 'rotate(75deg)' }}>
                <path d="M4.5 3V17.5L9.2 13.2L14.2 21L17.5 19L12.5 11.2L18.5 10.2L4.5 3Z" fill="#1C332E" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Floating Avatar 3 (Bottom Left) */}
        <div 
          style={{ 
            position: 'absolute', 
            top: `${positions.avatar3.y}%`, 
            left: `${positions.avatar3.x}%`, 
            display: isDesktop ? 'flex' : 'none', 
            alignItems: 'center', 
            cursor: draggedAvatar === 'avatar3' ? 'grabbing' : 'grab',
            zIndex: draggedAvatar === 'avatar3' ? 99 : 30,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            transform: draggedAvatar === 'avatar3' ? 'scale(1.1)' : 'scale(1)',
            transition: draggedAvatar === 'avatar3' ? 'none' : 'transform 0.2s ease, top 0.2s cubic-bezier(0.16, 1, 0.3, 1), left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseDown={(e) => handleStartDrag('avatar3', e)}
          onTouchStart={(e) => handleStartDrag('avatar3', e)}
          draggable="false"
        >
          <div style={{ position: 'relative' }} draggable="false">
            <div 
              style={{ 
                width: '68px', 
                height: '68px', 
                borderRadius: '9999px',
                border: '4px solid #FFFFFF', 
                boxShadow: '0 12px 32px rgba(28, 51, 46, 0.15)', 
                overflow: 'hidden',
                backgroundColor: '#FFF9E6',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
              draggable="false"
            >
              <img src="/avatar-chef.png" alt="Canteen Chef" draggable="false" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none' }} />
            </div>
            
            {/* Arrow pointing down-left */}
            <div style={{ position: 'absolute', top: '-14px', right: '-14px', zIndex: 20 }} draggable="false">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))', transform: 'rotate(-75deg)' }}>
                <path d="M4.5 3V17.5L9.2 13.2L14.2 21L17.5 19L12.5 11.2L18.5 10.2L4.5 3Z" fill="#1C332E" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Floating Avatar 4 (Bottom Right) */}
        <div 
          style={{ 
            position: 'absolute', 
            top: `${positions.avatar4.y}%`, 
            left: `${positions.avatar4.x}%`, 
            display: isDesktop ? 'flex' : 'none', 
            alignItems: 'center', 
            cursor: draggedAvatar === 'avatar4' ? 'grabbing' : 'grab',
            zIndex: draggedAvatar === 'avatar4' ? 99 : 30,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            transform: draggedAvatar === 'avatar4' ? 'scale(1.1)' : 'scale(1)',
            transition: draggedAvatar === 'avatar4' ? 'none' : 'transform 0.2s ease, top 0.2s cubic-bezier(0.16, 1, 0.3, 1), left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseDown={(e) => handleStartDrag('avatar4', e)}
          onTouchStart={(e) => handleStartDrag('avatar4', e)}
          draggable="false"
        >
          <div style={{ position: 'relative' }} draggable="false">
            <div 
              style={{ 
                width: '68px', 
                height: '68px', 
                borderRadius: '9999px',
                border: '4px solid #FFFFFF', 
                boxShadow: '0 12px 32px rgba(28, 51, 46, 0.15)', 
                overflow: 'hidden',
                backgroundColor: '#E2FBEB',
                userSelect: 'none',
                WebkitUserSelect: 'none'
              }}
              draggable="false"
            >
              <img src="/avatar-man2.png" alt="Manager Admin" draggable="false" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', userSelect: 'none', WebkitUserSelect: 'none' }} />
            </div>
            
            {/* Arrow pointing down-right */}
            <div style={{ position: 'absolute', top: '-14px', left: '-14px', zIndex: 20 }} draggable="false">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))', transform: 'rotate(150deg)' }}>
                <path d="M4.5 3V17.5L9.2 13.2L14.2 21L17.5 19L12.5 11.2L18.5 10.2L4.5 3Z" fill="#1C332E" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
