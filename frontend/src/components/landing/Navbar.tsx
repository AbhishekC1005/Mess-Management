import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, ChevronDown, Menu, X, Activity, MessageSquare, CalendarDays, ShieldCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  isAuthenticated: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [customersOpen, setCustomersOpen] = useState(false);

  // Dynamic hover state tracker for bulletproof micro-interactions
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Responsive state tracker for bulletproof viewport layout
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header 
      style={{ 
        backgroundColor: 'rgba(245, 243, 238, 0.45)', // Warm cream tint matching landing page #F5F3EE vibe
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(28, 51, 46, 0.08)',
        position: 'fixed', // Fixed to the viewport, moves with scroll!
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        width: 'calc(100% - 32px)',
        maxWidth: '1050px',
        height: '64px',
        borderRadius: '9999px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.85), 0 12px 32px -10px rgba(28, 51, 46, 0.06)', // Premium inset white reflection + soft shadow
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div 
        style={{ 
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0 24px'
        }}
      >
        
        {/* Left: Brand Logo */}
        <div 
          onClick={() => navigate('/')}
          onMouseEnter={() => setHoveredItem('logo')}
          onMouseLeave={() => setHoveredItem(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div 
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: '#1C332E',
              color: '#C8FF52',
              transform: hoveredItem === 'logo' ? 'scale(1.08) rotate(-3deg)' : 'scale(1)',
              boxShadow: hoveredItem === 'logo' ? '0 4px 12px rgba(28, 51, 46, 0.15)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <ChefHat size={16} />
          </div>
          <span 
            style={{ 
              fontSize: '16px', 
              fontWeight: 800, 
              color: '#1C332E', 
              fontFamily: "'Google Sans', 'SN Pro', sans-serif",
              letterSpacing: '-0.03em'
            }}
          >
            MessManager
          </span>
        </div>

        {/* Center: Dropdown Navigation Links */}
        <nav 
          style={{ 
            display: isDesktop ? 'flex' : 'none', 
            flexDirection: 'row',
            alignItems: 'center', 
            gap: '28px' 
          }}
        >
          
          {/* Solutions Dropdown */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <button 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontSize: '13px', 
                fontWeight: 600, 
                color: hoveredItem === 'solutions' || solutionsOpen ? '#1C332E' : '#5F6D7A', 
                fontFamily: "'Roboto', sans-serif",
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '16px 0',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={() => setHoveredItem('solutions')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              Solutions <ChevronDown size={12} style={{ transform: solutionsOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
            </button>
            {solutionsOpen && (
              <div 
                style={{ 
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '320px',
                  backgroundColor: 'rgba(245, 243, 238, 0.85)', // Matches the warm beige vibe of the landing page
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(28, 51, 46, 0.08)',
                  borderRadius: '16px',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 20px 40px -15px rgba(28, 51, 46, 0.12)', // Shiny edge + deep dropdown shadow
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  zIndex: 100,
                  marginTop: '0px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <a 
                    href="#features" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px', 
                      borderRadius: '12px', 
                      color: '#1C332E', 
                      textDecoration: 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                    className="hover:bg-[#FAFBF9]"
                  >
                    <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(28, 51, 46, 0.05)', color: '#1C332E', marginTop: '2px' }}>
                      <Activity size={14} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, display: 'block', fontFamily: "'Google Sans', sans-serif" }}>Canteen Dashboard</span>
                      <span style={{ fontSize: '10px', color: '#9EA8B0', display: 'block', fontFamily: "'Roboto', sans-serif", marginTop: '2px' }}>Real-time metrics scoped by Tenant-ID</span>
                    </div>
                  </a>

                  <a 
                    href="#sandbox" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px', 
                      borderRadius: '12px', 
                      color: '#1C332E', 
                      textDecoration: 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                    className="hover:bg-[#FAFBF9]"
                  >
                    <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(28, 51, 46, 0.05)', color: '#1C332E', marginTop: '2px' }}>
                      <MessageSquare size={14} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, display: 'block', fontFamily: "'Google Sans', sans-serif" }}>Telegram Diner Agent</span>
                      <span style={{ fontSize: '10px', color: '#9EA8B0', display: 'block', fontFamily: "'Roboto', sans-serif", marginTop: '2px' }}>Let diners skip, pause, or view menus</span>
                    </div>
                  </a>

                  <a 
                    href="#features" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px', 
                      borderRadius: '12px', 
                      color: '#1C332E', 
                      textDecoration: 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                    className="hover:bg-[#FAFBF9]"
                  >
                    <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.05)', color: '#22C55E', marginTop: '2px' }}>
                      <CalendarDays size={14} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, display: 'block', fontFamily: "'Google Sans', sans-serif" }}>Auto-Attendance</span>
                      <span style={{ fontSize: '10px', color: '#9EA8B0', display: 'block', fontFamily: "'Roboto', sans-serif", marginTop: '2px' }}>Automate attendance logs at cutoff hours</span>
                    </div>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Customers Dropdown */}
          <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setCustomersOpen(true)}
            onMouseLeave={() => setCustomersOpen(false)}
          >
            <button 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontSize: '13px', 
                fontWeight: 600, 
                color: hoveredItem === 'customers' || customersOpen ? '#1C332E' : '#5F6D7A', 
                fontFamily: "'Roboto', sans-serif",
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: '16px 0',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={() => setHoveredItem('customers')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              Customers <ChevronDown size={12} style={{ transform: customersOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
            </button>
            {customersOpen && (
              <div 
                style={{ 
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '240px',
                  backgroundColor: 'rgba(245, 243, 238, 0.85)', // Matches the warm beige vibe of the landing page
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(28, 51, 46, 0.08)',
                  borderRadius: '16px',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 20px 40px -15px rgba(28, 51, 46, 0.12)', // Shiny edge + soft dropdown shadow
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  zIndex: 100,
                  marginTop: '0px'
                }}
              >
                <span style={{ display: 'block', padding: '6px 12px 2px 12px', fontSize: '9px', fontWeight: 800, color: '#1C332E', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Google Sans', sans-serif" }}>Use Cases</span>
                
                <a 
                  href="#testimonial" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    padding: '8px 12px', 
                    fontSize: '12px', 
                    fontWeight: 700, 
                    borderRadius: '8px', 
                    color: '#1C332E', 
                    textDecoration: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  className="hover:bg-[#FAFBF9]"
                >
                  <Sparkles size={12} className="text-[#1C332E]" /> Student Hostels
                </a>

                <a 
                  href="#testimonial" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    padding: '8px 12px', 
                    fontSize: '12px', 
                    fontWeight: 700, 
                    borderRadius: '8px', 
                    color: '#1C332E', 
                    textDecoration: 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  className="hover:bg-[#FAFBF9]"
                >
                  <ShieldCheck size={12} className="text-green-600" /> Corporate Cafeterias
                </a>
              </div>
            )}
          </div>

          <a 
            href="#pricing" 
            style={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              color: hoveredItem === 'pricing' ? '#1C332E' : '#5F6D7A', 
              fontFamily: "'Roboto', sans-serif", 
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={() => setHoveredItem('pricing')}
            onMouseLeave={() => setHoveredItem(null)}
          >
            Pricing
          </a>
        </nav>

        {/* Right: Actions */}
        <div style={{ display: isDesktop ? 'flex' : 'none', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated ? (
            <button 
              onClick={() => navigate('/dashboard')}
              onMouseEnter={() => setHoveredItem('dashboard-btn')}
              onMouseLeave={() => setHoveredItem(null)}
              style={{ 
                backgroundColor: '#1C332E', 
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '10px 20px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Roboto', sans-serif",
                boxShadow: hoveredItem === 'dashboard-btn' ? '0 4px 12px rgba(28, 51, 46, 0.15)' : 'none',
                transform: hoveredItem === 'dashboard-btn' ? 'translateY(-1px)' : 'translateY(0)',
                transition: 'all 0.2s ease'
              }}
            >
              Dashboard
            </button>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                onMouseEnter={() => setHoveredItem('login-btn')}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ 
                  color: hoveredItem === 'login-btn' ? '#C8FF52' : '#1C332E',
                  border: 'none',
                  background: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Roboto', sans-serif",
                  padding: '8px 16px',
                  transform: hoveredItem === 'login-btn' ? 'translateX(-2px)' : 'translateX(0)',
                  transition: 'all 0.2s ease'
                }}
              >
                Log In
              </button>
              <button 
                onClick={() => navigate('/login')}
                onMouseEnter={() => setHoveredItem('start-btn')}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ 
                  backgroundColor: '#1C332E', 
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '10px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Roboto', sans-serif",
                  boxShadow: hoveredItem === 'start-btn' ? '0 8px 16px rgba(28, 51, 46, 0.15)' : 'none',
                  transform: hoveredItem === 'start-btn' ? 'translateY(-1px)' : 'translateY(0)',
                  transition: 'all 0.2s ease'
                }}
              >
                Start Now
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div style={{ display: isDesktop ? 'none' : 'flex', alignItems: 'center' }}>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ 
              color: '#1C332E',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && !isDesktop && (
        <div 
          style={{ 
            backgroundColor: 'rgba(245, 243, 238, 0.9)', // Matches warm cream theme
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(28, 51, 46, 0.08)',
            padding: '16px 20px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            position: 'absolute',
            top: '76px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            borderRadius: '24px',
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 20px 25px -5px rgba(28, 51, 46, 0.05)',
            zIndex: 99
          }}
        >
          <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', fontSize: '14px', fontWeight: 700, padding: '10px 0', color: '#1C332E', borderBottom: '1px solid rgba(28, 51, 46, 0.03)', textDecoration: 'none', fontFamily: "'Google Sans', sans-serif" }}>Features</a>
          <a href="#sandbox" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', fontSize: '14px', fontWeight: 700, padding: '10px 0', color: '#1C332E', borderBottom: '1px solid rgba(28, 51, 46, 0.03)', textDecoration: 'none', fontFamily: "'Google Sans', sans-serif" }}>AI Bot Simulator</a>
          <a href="#integrations" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', fontSize: '14px', fontWeight: 700, padding: '10px 0', color: '#1C332E', borderBottom: '1px solid rgba(28, 51, 46, 0.03)', textDecoration: 'none', fontFamily: "'Google Sans', sans-serif" }}>Integrations</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block', fontSize: '14px', fontWeight: 700, padding: '10px 0', color: '#1C332E', borderBottom: '1px solid rgba(28, 51, 46, 0.03)', textDecoration: 'none', fontFamily: "'Google Sans', sans-serif" }}>Pricing</a>
          
          <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {isAuthenticated ? (
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                style={{ backgroundColor: '#1C332E', color: '#FFFFFF', border: 'none', borderRadius: '9999px', padding: '12px 0', fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: "'Roboto', sans-serif" }}
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                  style={{ color: '#1C332E', border: '1.5px solid rgba(28, 51, 46, 0.3)', backgroundColor: 'transparent', borderRadius: '9999px', padding: '10px 0', fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: "'Roboto', sans-serif" }}
                >
                  Log In
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                  style={{ backgroundColor: '#1C332E', color: '#FFFFFF', border: 'none', borderRadius: '9999px', padding: '12px 0', fontWeight: 700, cursor: 'pointer', width: '100%', fontFamily: "'Roboto', sans-serif" }}
                >
                  Start Now
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
