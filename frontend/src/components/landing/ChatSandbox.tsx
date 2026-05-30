import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Send } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const ChatSandbox: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: "👋 Hi! I'm your MessManager AI Diner Assistant. How can I help you today? Try clicking one of the options below or typing your own!",
      timestamp: '12:30 PM'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Responsive state tracker for bulletproof viewport layout
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Only scroll if the user has interacted, preventing scroll on mount/reload
    if (!hasInteracted) {
      return;
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping, hasInteracted]);

  const presetQueries = [
    {
      label: '🍽️ Skip Dinner',
      userMsg: 'I won\'t be able to make it to dinner tonight. Can you skip it?',
      botReply: 'Done! 🍽️ I\'ve skipped your **Dinner** for tonight (May 29). Your remaining plan balance has been saved. Have a great evening!'
    },
    {
      label: '🍲 Today\'s Menu',
      userMsg: 'What\'s on the menu for today?',
      botReply: 'Here is today\'s Lunch menu: 🍛 **Paneer Butter Masala, Butter Naan, Veg Veg Pulav, and Gulab Jamun**. Cutoff time is 12:30 PM. Enjoy your meal!'
    },
    {
      label: '✈️ Pause Subscription',
      userMsg: 'I\'m going home for the weekend. Pause my meals Friday to Sunday.',
      botReply: 'Certainly! 🗓️ Your subscription has been **paused** from **Friday** to **Sunday**. All scheduled meal check-ins during this time are suspended. Safe travels! ✈️'
    },
    {
      label: '📊 Check Plan Status',
      userMsg: 'How many meals do I have left?',
      botReply: '🔍 **Your Subscription Status:**\n- **Plan:** Both (Lunch & Dinner)\n- **Meals Remaining:** 42 / 60\n- **Status:** Active\n- **Outstanding Balance:** ₹0.00 (Fully Paid)'
    }
  ];

  const handleQueryClick = (userMsg: string, botReply: string) => {
    if (isTyping) return;
    
    setHasInteracted(true);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, timestamp: now }]);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply, timestamp: now }]);
    }, 1200);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    
    setHasInteracted(true);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages(prev => [...prev, { sender: 'user', text: text.trim(), timestamp: now }]);
    setInputValue('');
    setIsTyping(true);
    
    // Generate smart reply based on keywords
    let botReply = "Great question! 🤖 I am your AI Canteen Diner assistant. You can ask me to *skip a meal*, *pause subscription*, or *check today's menu*!";
    const lowerText = text.toLowerCase();
    if (lowerText.includes('skip') || lowerText.includes('cancel')) {
      botReply = 'Done! 🍽️ I\'ve skipped your **Dinner** for tonight. Your remaining plan balance has been saved. Have a great evening!';
    } else if (lowerText.includes('menu') || lowerText.includes('food') || lowerText.includes('lunch') || lowerText.includes('dinner')) {
      botReply = 'Here is today\'s menu: ☀️ **Paneer Butter Masala** for Lunch, and 🌙 **Aloo Gobhi** for Dinner! Enjoy your meals! 🍲';
    } else if (lowerText.includes('pause') || lowerText.includes('stop') || lowerText.includes('weekend')) {
      botReply = 'Certainly! 🗓️ Your subscription has been **paused** from Friday to Sunday. Safe travels! ✈️';
    } else if (lowerText.includes('status') || lowerText.includes('plan') || lowerText.includes('left') || lowerText.includes('balance') || lowerText.includes('how many')) {
      botReply = '🔍 **Your Subscription Status:**\n- **Plan:** Both (Lunch & Dinner)\n- **Meals Remaining:** 42 / 60\n- **Outstanding Balance:** ₹0.00 (Fully Paid)';
    }
    
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply, timestamp: now }]);
    }, 1200);
  };

  return (
    <section id="sandbox" style={{ backgroundColor: '#FAFAFA', padding: '96px 0', width: '100%', position: 'relative', overflow: 'hidden' }}>
      <div 
        style={{ 
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '400px',
          height: '400px',
          backgroundImage: 'radial-gradient(circle, rgba(28, 51, 46, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      />
      
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div 
          style={{ 
            display: 'flex',
            flexDirection: isDesktop ? 'row' : 'column',
            alignItems: 'center',
            gap: '48px'
          }}
        >
          
          {/* Left Column: Details */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            <span 
              className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
              style={{ 
                backgroundColor: 'rgba(28, 51, 46, 0.04)', 
                border: '1px solid rgba(28, 51, 46, 0.08)', 
                color: '#1C332E',
                fontFamily: "'Roboto', sans-serif",
                alignSelf: 'flex-start'
              }}
            >
              Diner telegram bot
            </span>
            <h2 style={{ fontSize: isDesktop ? '38px' : '28px', fontWeight: 800, color: '#1C332E', fontFamily: "'Google Sans', 'SN Pro', sans-serif", lineHeight: 1.2, margin: 0 }}>
              Let diners skip, pause, or view menus via Telegram
            </h2>
            <p style={{ fontSize: '15px', color: '#5F6D7A', fontFamily: "'Roboto', sans-serif", lineHeight: 1.6, margin: 0 }}>
              Empower your customers with instant AI-driven options. Underneath, a robust Python FastAPI engine with LangGraph parses natural inquiries, triggering Spring Boot database check-ins in real-time.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1C332E', margin: 0 }}>🔥 Try the interactive sandbox:</h4>
              <div 
                style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '12px'
                }}
              >
                {presetQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleQueryClick(query.userMsg, query.botReply)}
                    style={{ 
                      padding: '14px 20px',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid rgba(28, 51, 46, 0.15)', 
                      color: '#1C332E',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: '0 2px 4px rgba(28, 51, 46, 0.04)',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      fontFamily: "'Roboto', sans-serif"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1C332E';
                      e.currentTarget.style.color = '#C8FF52';
                      e.currentTarget.style.borderColor = '#1C332E';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(28, 51, 46, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.color = '#1C332E';
                      e.currentTarget.style.borderColor = 'rgba(28, 51, 46, 0.15)';
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(28, 51, 46, 0.04)';
                    }}
                  >
                    {query.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity iPhone Mockup Shell */}
          <div style={{ flex: 1.2, width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
            
            {/* Outer iPhone Frame Wrapper */}
            <div 
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '360px',
                height: '630px',
                borderRadius: '48px',
                padding: '10px',
                backgroundColor: '#151617', // iPhone Matte Titanium dark color
                border: '3.5px solid #434648', // Metallic bezel edge
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.55), inset 0 0 4px rgba(255, 255, 255, 0.15)',
                boxSizing: 'border-box'
              }}
            >
              {/* Volume Buttons (Subtle left side buttons behind the frame) */}
              <div style={{ position: 'absolute', left: '-3.5px', top: '110px', width: '3.5px', height: '32px', backgroundColor: '#434648', borderRadius: '3px 0 0 3px', borderLeft: '1px solid rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'absolute', left: '-3.5px', top: '155px', width: '3.5px', height: '50px', backgroundColor: '#434648', borderRadius: '3px 0 0 3px', borderLeft: '1px solid rgba(255,255,255,0.1)' }} />
              <div style={{ position: 'absolute', left: '-3.5px', top: '215px', width: '3.5px', height: '50px', backgroundColor: '#434648', borderRadius: '3px 0 0 3px', borderLeft: '1px solid rgba(255,255,255,0.1)' }} />
              
              {/* Power Button (Right side button behind the frame) */}
              <div style={{ position: 'absolute', right: '-3.5px', top: '170px', width: '3.5px', height: '70px', backgroundColor: '#434648', borderRadius: '0 3px 3px 0', borderRight: '1px solid rgba(255,255,255,0.1)' }} />

              {/* Internal Screen Display */}
              <div 
                style={{ 
                  borderRadius: '38px', 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  backgroundColor: '#122924',
                  backgroundImage: 'linear-gradient(180deg, #142E28 0%, #08110F 100%)',
                  boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.8)',
                  position: 'relative'
                }}
              >
                {/* Dynamic Island slit */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '11px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '85px',
                    height: '24px',
                    borderRadius: '9999px',
                    backgroundColor: '#000000',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 2px rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {/* Subtle Camera Lens Reflection */}
                  <div 
                    style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: '#0D1B2A', 
                      border: '0.8px solid #222', 
                      marginLeft: '36px',
                      opacity: 0.75
                    }} 
                  />
                </div>

                {/* iOS Top Status Bar */}
                <div 
                  style={{ 
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '13px 24px 3px 24px',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: "'Roboto', sans-serif",
                    zIndex: 90,
                    userSelect: 'none'
                  }}
                >
                  <span>9:41</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '10px' }}>📶</span>
                    <span style={{ fontSize: '9px' }}>5G</span>
                    <span style={{ fontSize: '11px' }}>🔋</span>
                  </div>
                </div>

                {/* Simulator Header */}
                <div 
                  style={{ 
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '14px 16px 12px 16px',
                    backgroundColor: 'rgba(20, 46, 40, 0.25)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                    <div 
                      style={{ 
                        width: '34px', 
                        height: '34px', 
                        borderRadius: '9999px',
                        border: '1px solid #C8FF52', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: 'rgba(200, 255, 82, 0.05)',
                        color: '#C8FF52'
                      }}
                    >
                      <Smartphone size={15} style={{ color: '#C8FF52' }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', margin: 0, fontFamily: "'Roboto', sans-serif" }}>DinerBot AI</h4>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
                      </div>
                      <p style={{ fontSize: '9px', color: '#8DA39F', margin: 0, fontFamily: "'Roboto', sans-serif" }}>Powered by Llama 3.1</p>
                    </div>
                  </div>
                  <span 
                    style={{ 
                      fontSize: '9px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      color: '#C8FF52', 
                      backgroundColor: 'rgba(200, 255, 82, 0.08)', 
                      border: '1px solid rgba(200, 255, 82, 0.2)',
                      fontFamily: "'Roboto', sans-serif"
                    }}
                  >
                    Live Demo
                  </span>
                </div>

                {/* Chat Scroll View */}
                <div 
                  style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '14px',
                    padding: '16px',
                    paddingRight: '8px',
                    paddingBottom: '30px'
                  }}
                  className="scrollbar-thin scrollbar-thumb-slate-800"
                >
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: '85%',
                        alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={
                          msg.sender === 'user'
                            ? { 
                                backgroundColor: '#C8FF52', 
                                color: '#1C332E', 
                                padding: '12px 14px', 
                                borderRadius: '18px', 
                                borderTopRightRadius: '0px',
                                fontSize: '12.5px',
                                fontWeight: 700,
                                lineHeight: 1.35,
                                textAlign: 'left',
                                boxShadow: '0 3px 8px rgba(200, 255, 82, 0.12)',
                                whiteSpace: 'pre-line'
                              }
                            : { 
                                backgroundColor: '#1E3A34', 
                                color: '#FFFFFF', 
                                padding: '12px 14px', 
                                borderRadius: '18px', 
                                borderTopLeftRadius: '0px',
                                fontSize: '12.5px',
                                lineHeight: 1.35,
                                textAlign: 'left',
                                border: '1px solid rgba(255, 255, 255, 0.04)',
                                boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
                                whiteSpace: 'pre-line'
                              }
                        }
                      >
                        {msg.text}
                      </div>
                      <span style={{ fontSize: '8px', color: '#8DA39F', marginTop: '3px', padding: '0 4px' }}>{msg.timestamp}</span>
                    </div>
                  ))}

                  {/* Loading typing bubble */}
                  {isTyping && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignSelf: 'flex-start', alignItems: 'flex-start', maxWidth: '80%' }}>
                      <div 
                        style={{ 
                          backgroundColor: '#1E3A34', 
                          color: '#FFFFFF', 
                          padding: '12px 14px', 
                          borderRadius: '18px', 
                          borderTopLeftRadius: '0px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: '1px solid rgba(255, 255, 255, 0.04)'
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>

                {/* Working Input Footer */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
                  style={{ 
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
                    padding: '12px 16px 12px 16px',
                    backgroundColor: 'rgba(11, 25, 22, 0.4)',
                    position: 'relative'
                  }}
                >
                  <div 
                    style={{ 
                      backgroundColor: '#0A1513', 
                      border: '1px solid rgba(255, 255, 255, 0.08)', 
                      borderRadius: '9999px', 
                      padding: '10px 16px', 
                      fontSize: '12px', 
                      color: '#FFFFFF', 
                      display: 'flex', 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: '8px',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  >
                    <input 
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask skip dinner, check status..."
                      disabled={isTyping}
                      style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#FFFFFF',
                        fontSize: '12.5px',
                        fontFamily: "'Roboto', sans-serif"
                      }}
                    />
                    <button 
                      type="submit"
                      disabled={isTyping || !inputValue.trim()}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: inputValue.trim() ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        color: inputValue.trim() ? '#C8FF52' : '#8DA39F',
                        transition: 'all 0.2s ease',
                        padding: 0
                      }}
                    >
                      <Send size={15} />
                    </button>
                  </div>
                  
                  {/* iOS Home Indicator Bar at the bottom of the screen */}
                  <div 
                    style={{
                      width: '90px',
                      height: '3px',
                      backgroundColor: 'rgba(255, 255, 255, 0.35)',
                      borderRadius: '9999px',
                      margin: '12px auto 0 auto',
                      pointerEvents: 'none'
                    }}
                  />
                </form>

              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default ChatSandbox;
