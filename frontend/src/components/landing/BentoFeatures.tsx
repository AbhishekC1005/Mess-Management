import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

const BentoFeatures: React.FC = () => {
  const navigate = useNavigate();

  // Responsive state tracker for bulletproof viewport layout
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [hoveredDashboard, setHoveredDashboard] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section id="features" style={{ backgroundColor: '#FAFAFA', padding: '96px 0', width: '100%' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 64px auto' }}>
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
            Features
          </span>
          <h2 
            style={{ 
              fontSize: isDesktop ? '38px' : '28px', 
              fontWeight: 800, 
              color: '#1C332E', 
              fontFamily: "'Google Sans', 'SN Pro', sans-serif",
              lineHeight: 1.2,
              marginTop: '16px',
              marginBottom: '16px'
            }}
          >
            Latest advanced technologies to ensure everything you need
          </h2>
          <p style={{ fontSize: '15px', color: '#5F6D7A', fontFamily: "'Roboto', sans-serif", lineHeight: 1.6, margin: 0 }}>
            Minimize food wastage, ensure complete financial accountability, and provide a seamless diner experience.
          </p>
        </div>

        {/* Dashboard Visual Mockup Glass Frame */}
        <div 
          onMouseEnter={() => setHoveredDashboard(true)}
          onMouseLeave={() => setHoveredDashboard(false)}
          style={{ 
            maxWidth: '960px', 
            margin: '0 auto 64px auto', 
            padding: isDesktop ? '20px' : '12px', 
            borderRadius: '32px', 
            backgroundColor: 'rgba(28, 51, 46, 0.04)', 
            border: hoveredDashboard ? '2px solid rgba(28, 51, 46, 0.2)' : '2px solid rgba(28, 51, 46, 0.12)', 
            boxShadow: hoveredDashboard ? '0 30px 60px -15px rgba(28, 51, 46, 0.15)' : '0 20px 40px -15px rgba(28, 51, 46, 0.06)',
            transform: hoveredDashboard ? 'translateY(-3px)' : 'translateY(0)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div 
            style={{ 
              display: 'flex',
              flexDirection: isDesktop ? 'row' : 'column',
              gap: '24px',
              padding: '28px', 
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              border: hoveredDashboard ? '1.5px solid rgba(28, 51, 46, 0.16)' : '1.5px solid rgba(28, 51, 46, 0.08)',
              boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.9)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            
            {/* Left Box: Admin Panel */}
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div 
                style={{ 
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1.5px solid rgba(28, 51, 46, 0.06)',
                  paddingBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '10px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      backgroundImage: 'linear-gradient(135deg, #1C332E 0%, #0D1C19 100%)',
                      color: '#C8FF52',
                      boxShadow: '0 4px 12px rgba(28, 51, 46, 0.15)'
                    }}
                  >
                    <Activity size={18} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1C332E', margin: 0, fontFamily: "'Google Sans', 'SN Pro', sans-serif" }}>MessManager Admin</h4>
                    <p style={{ fontSize: '11px', color: '#8DA39F', margin: 0, fontFamily: "'Roboto', sans-serif" }}>West Hostel Canteen</p>
                  </div>
                </div>
                <span 
                  style={{ 
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(34, 197, 94, 0.08)', 
                    border: '1px solid rgba(34, 197, 94, 0.25)', 
                    color: '#16A34A',
                    boxShadow: '0 0 12px rgba(34, 197, 94, 0.1)',
                    fontFamily: "'Roboto', sans-serif"
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 6px #22C55E' }} /> Live Scoped
                </span>
              </div>

              {/* Metrics Grid */}
              <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
                {/* Total Diners Box */}
                <div 
                  style={{ 
                    flex: 1, 
                    padding: '20px', 
                    borderRadius: '16px', 
                    backgroundColor: '#FAF9F6', 
                    border: '1.5px solid rgba(28, 51, 46, 0.08)', 
                    textAlign: 'left',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#8DA39F', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Roboto', sans-serif" }}>Total Diners</span>
                  <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#1C332E', margin: '6px 0 4px 0', fontFamily: "'Google Sans', 'SN Pro', sans-serif" }}>248</h3>
                  <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Roboto', sans-serif" }}>
                    ✓ Scoped by tenant
                  </span>
                </div>
                {/* Expected Meals Box */}
                <div 
                  style={{ 
                    flex: 1, 
                    padding: '20px', 
                    borderRadius: '16px', 
                    backgroundColor: '#FAF9F6', 
                    border: '1.5px solid rgba(28, 51, 46, 0.08)', 
                    textAlign: 'left',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.01)',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#8DA39F', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Roboto', sans-serif" }}>Expected Meals</span>
                  <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#1C332E', margin: '6px 0 4px 0', fontFamily: "'Google Sans', 'SN Pro', sans-serif" }}>194</h3>
                  <span style={{ fontSize: '11px', color: '#5F6D7A', fontWeight: 600, fontFamily: "'Roboto', sans-serif" }}>
                    Lunch & Dinner today
                  </span>
                </div>
              </div>

              {/* Active Menu Display */}
              <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#FAF9F6', border: '1.5px solid rgba(28, 51, 46, 0.08)', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(28, 51, 46, 0.06)', paddingBottom: '10px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#1C332E', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: "'Roboto', sans-serif" }}>📅 Today's Menu</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)', color: '#16A34A', fontFamily: "'Roboto', sans-serif" }}>Active</span>
                </div>
                <div style={{ display: 'flex', flexDirection: isDesktop ? 'row' : 'column', gap: '16px', fontSize: '12px' }}>
                  {/* Lunch Subcard */}
                  <div style={{ flex: 1, backgroundColor: '#FFFFFF', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(28, 51, 46, 0.06)', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
                    <span style={{ fontWeight: 800, color: '#1C332E', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Roboto', sans-serif" }}>☀️ Lunch</span>
                    <p style={{ color: '#5F6D7A', margin: '4px 0 0 0', fontFamily: "'Roboto', sans-serif", fontSize: '11.5px', lineHeight: 1.4 }}>Paneer Butter Masala, Butter Naan, Veg Pulav</p>
                  </div>
                  {/* Dinner Subcard */}
                  <div style={{ flex: 1, backgroundColor: '#FFFFFF', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(28, 51, 46, 0.06)', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
                    <span style={{ fontWeight: 800, color: '#1C332E', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: "'Roboto', sans-serif" }}>🌙 Dinner</span>
                    <p style={{ color: '#5F6D7A', margin: '4px 0 0 0', fontFamily: "'Roboto', sans-serif", fontSize: '11.5px', lineHeight: 1.4 }}>Aloo Gobhi, Tandoori Roti, Dal Fry</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Live Log Feed */}
            <div 
              style={{ 
                width: isDesktop ? '320px' : '100%', 
                borderRadius: '20px', 
                border: '1.5px solid rgba(28, 51, 46, 0.08)',
                padding: '20px',
                backgroundColor: '#FAF9F6',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8DA39F', margin: '0 0 14px 0', fontFamily: "'Roboto', sans-serif" }}>Live Log Feed</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* JD Log */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      gap: '10px', 
                      backgroundColor: '#FFFFFF', 
                      padding: '10px 12px', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(28, 51, 46, 0.06)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#EF4444' }}>JD</div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1C332E', display: 'block', fontFamily: "'Roboto', sans-serif" }}>John Doe</span>
                      <p style={{ fontSize: '10px', color: '#8DA39F', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Roboto', sans-serif" }}>Skipped dinner via bot</p>
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '3px 8px', borderRadius: '6px', fontFamily: "'Roboto', sans-serif" }}>Skipped</span>
                  </div>

                  {/* AS Log */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      gap: '10px', 
                      backgroundColor: '#FFFFFF', 
                      padding: '10px 12px', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(28, 51, 46, 0.06)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#22C55E' }}>AS</div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1C332E', display: 'block', fontFamily: "'Roboto', sans-serif" }}>Amit Sharma</span>
                      <p style={{ fontSize: '10px', color: '#8DA39F', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Roboto', sans-serif" }}>Auto-marked present</p>
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#16A34A', backgroundColor: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.15)', padding: '3px 8px', borderRadius: '6px', fontFamily: "'Roboto', sans-serif" }}>Present</span>
                  </div>

                  {/* KK Log */}
                  <div 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      gap: '10px', 
                      backgroundColor: '#FFFFFF', 
                      padding: '10px 12px', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(28, 51, 46, 0.06)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: '#F59E0B' }}>KK</div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1C332E', display: 'block', fontFamily: "'Roboto', sans-serif" }}>Kunal Kohli</span>
                      <p style={{ fontSize: '10px', color: '#8DA39F', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Roboto', sans-serif" }}>Paused till Friday</p>
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#D97706', backgroundColor: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)', padding: '3px 8px', borderRadius: '6px', fontFamily: "'Roboto', sans-serif" }}>Paused</span>
                  </div>

                </div>
              </div>

              {/* Attendance visual trend */}
              <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(28, 51, 46, 0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#8DA39F', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Roboto', sans-serif" }}>
                  <span>Attendance Rate</span>
                  <span style={{ color: '#16A34A', fontWeight: 800 }}>82% active check-in</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'space-between', height: '54px', paddingTop: '4px', gap: '5px' }}>
                  {[35, 45, 30, 60, 50, 75, 92, 40, 50].map((h, i) => (
                    <div key={i} style={{ flex: 1, backgroundColor: 'rgba(28, 51, 46, 0.06)', height: `${h}%`, borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
                      {i === 6 ? (
                        <div 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            backgroundImage: 'linear-gradient(to top, #1C332E, #2DD4BF)', 
                            borderRadius: '3px',
                            boxShadow: '0 0 10px rgba(45, 212, 191, 0.4)'
                          }} 
                        />
                      ) : (
                        <div 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            backgroundColor: 'rgba(28, 51, 46, 0.08)', 
                            borderRadius: '3px'
                          }} 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bento Grid: White rounded cards, subtle border, shadow */}
        <div 
          style={{ 
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(3, minmax(0, 1fr))' : '1fr',
            gap: '24px'
          }}
        >
          
          {/* Card 1: Spans 2 columns on desktop */}
          <div 
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ 
              gridColumn: isDesktop ? 'span 2' : 'span 1', 
              backgroundColor: '#FFFFFF', 
              border: hoveredCard === 1 ? '1.5px solid #1C332E' : '1.5px solid rgba(28, 51, 46, 0.15)', 
              borderRadius: '16px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '380px',
              boxShadow: hoveredCard === 1 ? '0 12px 36px -10px rgba(28, 51, 46, 0.08)' : '0 8px 30px rgba(28, 51, 46, 0.02)',
              transform: hoveredCard === 1 ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'left'
            }}
          >
            <div style={{ maxWidth: '480px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#9EA8B0', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Roboto', sans-serif" }}>Cloud Dashboard</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1C332E', fontFamily: "'Google Sans', 'SN Pro', sans-serif", marginTop: '8px', marginBottom: '12px' }}>Dynamic Multi-Tenant Dashboard</h3>
              <p style={{ fontSize: '13px', color: '#5F6D7A', fontFamily: "'Roboto', sans-serif", lineHeight: 1.6, marginBottom: '24px' }}>
                Keep eye-level track on your dining hall metrics. Scoped dynamically by secure Tenant-IDs, ensuring managers view strictly their own canteen diner logs, menus, and balances.
              </p>
              <button 
                onClick={() => navigate('/login')}
                style={{ 
                  backgroundColor: '#1C332E', 
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '10px 20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'Roboto', sans-serif" 
                }}
              >
                Explore all
              </button>
            </div>

            {/* Custom Bar Chart Visual Mockup */}
            <div 
              style={{ 
                marginTop: '32px', 
                backgroundColor: '#FFFFFF', 
                border: hoveredCard === 1 ? '1.5px solid rgba(28, 51, 46, 0.2)' : '1.5px solid rgba(28, 51, 46, 0.12)', 
                borderRadius: '16px', 
                padding: '20px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: '#1C332E' }}>
                <span>🍽️ Expected meals Capacity (7-day trend)</span>
                <span style={{ color: '#9EA8B0', fontWeight: 500 }}>Active Canteen</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'end', justifyContent: 'space-between', height: '80px', paddingTop: '8px', gap: '8px' }}>
                {[45, 60, 50, 75, 40, 85, 95, 55, 65, 80, 92, 48].map((val, idx) => (
                  <div key={idx} style={{ flex: 1, backgroundColor: '#E5E7EB', height: `${val}%`, borderTopLeftRadius: '2px', borderTopRightRadius: '2px', transition: 'height 0.3s ease' }}>
                    {idx === 10 && <div style={{ width: '100%', height: '100%', backgroundColor: '#1C332E', borderTopLeftRadius: '2px', borderTopRightRadius: '2px', boxShadow: '0 0 10px rgba(28, 51, 46, 0.2)' }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: 1 Column */}
          <div 
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ 
              backgroundColor: '#FFFFFF', 
              border: hoveredCard === 2 ? '1.5px solid #1C332E' : '1.5px solid rgba(28, 51, 46, 0.15)', 
              borderRadius: '16px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '380px',
              boxShadow: hoveredCard === 2 ? '0 12px 36px -10px rgba(28, 51, 46, 0.08)' : '0 8px 30px rgba(28, 51, 46, 0.02)',
              transform: hoveredCard === 2 ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'left'
            }}
          >
            <div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#9EA8B0', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Roboto', sans-serif" }}>Scheduler settings</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1C332E', fontFamily: "'Google Sans', 'SN Pro', sans-serif", marginTop: '8px', marginBottom: '12px' }}>Smart notifications</h3>
              <p style={{ fontSize: '13px', color: '#5F6D7A', fontFamily: "'Roboto', sans-serif", lineHeight: 1.6, margin: 0 }}>
                Timezone-aware automations. Attendance is logged automatically at the configured cutoff hour, checking for diner plans and cancellations in milliseconds.
              </p>
            </div>

            {/* Switch Toggles Mockup */}
            <div 
              style={{ 
                backgroundColor: '#FFFFFF', 
                border: hoveredCard === 2 ? '1.5px solid rgba(28, 51, 46, 0.2)' : '1.5px solid rgba(28, 51, 46, 0.12)', 
                borderRadius: '16px', 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#1C332E', margin: 0 }}>Auto-Attendance Tracking</p>
                  <p style={{ fontSize: '9px', color: '#9EA8B0', margin: 0 }}>Run automatically at cutoffs</p>
                </div>
                <div style={{ width: '36px', height: '20px', borderRadius: '9999px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', backgroundColor: '#22C55E', border: '1px solid rgba(229, 231, 235, 0.8)' }}>
                  <div style={{ width: '14px', height: '14px', backgroundColor: '#FFFFFF', borderRadius: '9999px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F3F5F4', paddingTop: '12px' }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#1C332E', margin: 0 }}>Pre-Meal Menu Reminders</p>
                  <p style={{ fontSize: '9px', color: '#9EA8B0', margin: 0 }}>Push to Telegram bot 30m prior</p>
                </div>
                <div style={{ width: '36px', height: '20px', borderRadius: '9999px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', backgroundColor: '#22C55E', border: '1px solid rgba(229, 231, 235, 0.8)' }}>
                  <div style={{ width: '14px', height: '14px', backgroundColor: '#FFFFFF', borderRadius: '9999px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F3F5F4', paddingTop: '12px' }}>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#1C332E', margin: 0 }}>Automatic Balance Alerts</p>
                  <p style={{ fontSize: '9px', color: '#9EA8B0', margin: 0 }}>Alert at 9:00 AM daily</p>
                </div>
                <div style={{ width: '36px', height: '20px', borderRadius: '9999px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: '#E5E7EB', border: '1px solid #D1D5DB' }}>
                  <div style={{ width: '14px', height: '14px', backgroundColor: '#FFFFFF', borderRadius: '9999px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: 1 Column */}
          <div 
            onMouseEnter={() => setHoveredCard(3)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ 
              backgroundColor: '#FFFFFF', 
              border: hoveredCard === 3 ? '1.5px solid #1C332E' : '1.5px solid rgba(28, 51, 46, 0.15)', 
              borderRadius: '16px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '380px',
              boxShadow: hoveredCard === 3 ? '0 12px 36px -10px rgba(28, 51, 46, 0.08)' : '0 8px 30px rgba(28, 51, 46, 0.02)',
              transform: hoveredCard === 3 ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              textAlign: 'left'
            }}
          >
            <div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#9EA8B0', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'Roboto', sans-serif" }}>Activity Feed</span>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1C332E', fontFamily: "'Google Sans', 'SN Pro', sans-serif", marginTop: '8px', marginBottom: '12px' }}>Task management</h3>
              <p style={{ fontSize: '13px', color: '#5F6D7A', fontFamily: "'Roboto', sans-serif", lineHeight: 1.6, margin: 0 }}>
                Every check-in, manual log, or Telegram cancellation is logged inside a central audit ledger with instant database scoping.
              </p>
            </div>

            {/* Task log feed mockup */}
            <div 
              style={{ 
                backgroundColor: '#FFFFFF', 
                border: hoveredCard === 3 ? '1.5px solid rgba(28, 51, 46, 0.2)' : '1.5px solid rgba(28, 51, 46, 0.12)', 
                borderRadius: '16px', 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '14px',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '9999px', backgroundColor: '#1C332E' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#9EA8B0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Feed activity</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', paddingBottom: '8px', borderBottom: '1px solid #F3F5F4' }}>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 700, color: '#1C332E', margin: 0 }}>M. Sandeep</p>
                    <p style={{ color: '#9EA8B0', margin: 0 }}>Meal Plan: Lunch only</p>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#22C55E', backgroundColor: 'rgba(34, 197, 94, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>Present</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', paddingBottom: '8px', borderBottom: '1px solid #F3F5F4' }}>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 700, color: '#1C332E', margin: 0 }}>A. Deshmukh</p>
                    <p style={{ color: '#9EA8B0', margin: 0 }}>Balance: ₹450.00 Due</p>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>Alerted</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 700, color: '#1C332E', margin: 0 }}>K. J. Sengupta</p>
                    <p style={{ color: '#9EA8B0', margin: 0 }}>Plan paused by Admin</p>
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>Paused</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BentoFeatures;
