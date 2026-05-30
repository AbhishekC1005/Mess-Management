import React, { useState, useEffect } from 'react';
import { settingsApi } from '../api/settings';
import { useAuth } from '../hooks/useAuth';


const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
];

const Settings: React.FC = () => {
  const { user } = useAuth();
  const messId = user?.messId || '';
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    lunchCutoff: '12:00',
    dinnerCutoff: '20:00',
    autoMarkEnabled: true,
    timezone: 'Asia/Kolkata',
  });

  // Telegram Bot QR settings (Universal Integration)
  const botUsername = 'SSSSSSKYBot';
  const [flyerMessName, setFlyerMessName] = useState(() => localStorage.getItem('mess_flyer_name') || 'Madhura Mess');

  useEffect(() => {
    localStorage.setItem('mess_flyer_name', flyerMessName);
  }, [flyerMessName]);

  const handlePrintFlyer = () => {
    const qrData = `https://t.me/${botUsername.trim()}?start=${messId}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Welcome to ${flyerMessName} Telegram Bot</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
            
            body {
              margin: 0;
              padding: 0;
              font-family: 'Outfit', sans-serif;
              color: #121212;
              background-color: #ffffff;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              box-sizing: border-box;
            }
            .flyer-container {
              border: 12px double #121212;
              padding: 40px;
              width: 100%;
              max-width: 650px;
              text-align: center;
              border-radius: 20px;
              box-shadow: 0 4px 30px rgba(0,0,0,0.05);
              background: #ffffff;
              position: relative;
            }
            .header-badge {
              display: inline-block;
              background-color: #22c55e;
              color: white;
              padding: 6px 16px;
              border-radius: 50px;
              font-size: 0.85rem;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 20px;
            }
            h1 {
              font-size: 2.8rem;
              font-weight: 800;
              margin: 0 0 10px 0;
              color: #111111;
              line-height: 1.1;
              letter-spacing: -1px;
            }
            .subtitle {
              font-size: 1.15rem;
              color: #6b7280;
              margin-bottom: 30px;
            }
            .qr-wrapper {
              display: inline-block;
              padding: 16px;
              border: 4px solid #111111;
              border-radius: 16px;
              background: white;
              margin-bottom: 30px;
              position: relative;
            }
            .qr-wrapper img {
              display: block;
              width: 220px;
              height: 220px;
            }
            .steps {
              text-align: left;
              max-width: 480px;
              margin: 0 auto 30px auto;
              background: #f9fafb;
              padding: 24px;
              border-radius: 12px;
              border: 1px solid #e5e7eb;
            }
            .step-item {
              display: flex;
              align-items: flex-start;
              margin-bottom: 16px;
              font-size: 1.05rem;
              line-height: 1.5;
            }
            .step-item:last-child {
              margin-bottom: 0;
            }
            .step-number {
              background: #111111;
              color: white;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 0.9rem;
              margin-right: 14px;
              flex-shrink: 0;
              margin-top: 2px;
            }
            .footer-info {
              font-size: 0.85rem;
              color: #9ca3af;
              margin-top: 10px;
              font-weight: 500;
            }
            @media print {
              body {
                background: none;
                height: auto;
                padding: 20px;
              }
              .flyer-container {
                box-shadow: none;
                border-width: 6px;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="flyer-container">
            <span class="header-badge">EASY subscription</span>
            <h1>${flyerMessName}</h1>
            <p class="subtitle">Skip meals, get updates, and manage your plan on Telegram!</p>
            
            <div class="qr-wrapper">
              <img src="${qrImageUrl}" alt="Scan QR Code" />
            </div>
            
            <div class="steps">
              <div class="step-item">
                <span class="step-number">1</span>
                <div><strong>Scan the QR Code</strong> with your phone's camera or a QR reader application.</div>
              </div>
              <div class="step-item">
                <span class="step-number">2</span>
                <div>It will redirect you to our Telegram Bot <strong>@${botUsername}</strong>.</div>
              </div>
              <div class="step-item">
                <span class="step-number">3</span>
                <div>Click <strong>'Start'</strong> and link your subscription using your phone number.</div>
              </div>
            </div>
            
            <p style="font-size: 1.1rem; font-weight: 600; color: #111; margin-bottom: 20px;">
              Bot Link: <span style="text-decoration: underline; color: #22c55e;">t.me/${botUsername}</span>
            </p>
            
            <div class="footer-info">Generated by Mess Management System Dashboard</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsApi.get();
        const s = res.data;
        setFormData({
          lunchCutoff: s.lunchCutoffTime?.substring(0, 5) || '12:00',
          dinnerCutoff: s.dinnerCutoffTime?.substring(0, 5) || '20:00',
          autoMarkEnabled: s.autoMarkEnabled,
          timezone: s.timezone || 'Asia/Kolkata',
        });
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsApi.update({
        lunchCutoffTime: formData.lunchCutoff,
        dinnerCutoffTime: formData.dinnerCutoff,
        autoMarkEnabled: formData.autoMarkEnabled,
        timezone: formData.timezone,
      });
      setConfirmMsg('✓ Settings Saved');
    } catch {
      setConfirmMsg('✗ Save Failed');
    }
    setTimeout(() => setConfirmMsg(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto flex items-center justify-center h-full">
        <span className="text-secondary">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto flex flex-col h-full overflow-y-auto">
      <header className="mb-8 flex justify-between items-end border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary mb-1">Settings</h1>
          <p className="text-secondary">Configure mess rules and auto-mark behavior</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-8 pb-12">
        {/* Auto-Mark Cutoff Times */}
        <section className="bg-surface border border-border rounded p-6 transition-all duration-300 hover:shadow-glow-primary hover:border-primary/30">
          <h2 className="text-sm font-semibold text-primary mb-4">Auto-Mark Cutoff Times</h2>
          <p className="text-xs text-secondary mb-4">
            At these times, all active customers who haven't skipped will be automatically marked as present.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-xs text-secondary mb-1">Lunch Cutoff Time</label>
              <input 
                type="time" 
                name="lunchCutoff"
                value={formData.lunchCutoff}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-secondary mb-1">Dinner Cutoff Time</label>
              <input 
                type="time" 
                name="dinnerCutoff"
                value={formData.dinnerCutoff}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Auto-Mark Toggle */}
        <section className="bg-surface border border-border rounded p-6 transition-all duration-300 hover:shadow-glow-primary hover:border-primary/30">
          <h2 className="text-sm font-semibold text-primary mb-4">Auto-Mark Feature</h2>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="autoMarkEnabled"
                checked={formData.autoMarkEnabled}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-border rounded-full peer peer-checked:bg-accent peer-focus:outline-none transition-colors duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-primary after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <span className="text-sm text-primary">
              {formData.autoMarkEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <p className="text-xs text-secondary mt-3">
            When enabled, customers are automatically marked as present at the cutoff time if they haven't skipped.
          </p>
        </section>

        {/* Timezone */}
        <section className="bg-surface border border-border rounded p-6 transition-all duration-300 hover:shadow-glow-primary hover:border-primary/30">
          <h2 className="text-sm font-semibold text-primary mb-4">Timezone</h2>
          <div className="max-w-md">
            <select 
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors"
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
            <p className="text-xs text-secondary mt-2">
              All cutoff times use this timezone for scheduling.
            </p>
          </div>
        </section>

        <div className="flex items-center gap-4 relative pt-4">
          <button 
            type="submit"
            className="px-6 py-2 bg-primary text-background text-sm font-medium rounded transition-all duration-300 hover:shadow-glow-primary hover:bg-primary/90 active:scale-95"
          >
            Save Changes
          </button>
          {confirmMsg && (
            <span className={`text-sm font-medium animate-fade-in-out ${confirmMsg.includes('✓') ? 'text-accent' : 'text-error'}`}>
              {confirmMsg}
            </span>
          )}
        </div>
      </form>

      {/* Visual Separator */}
      <div className="border-t border-border my-10"></div>

      {/* QR Code & Telegram Onboarding Section */}
      <section className="bg-surface border border-border rounded p-6 transition-all duration-300 hover:shadow-glow-primary hover:border-primary/30 pb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          
          <div className="flex-1 space-y-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                Telegram Integration
              </span>
              <h2 className="text-lg font-semibold text-primary">Diner Onboarding QR Code</h2>
              <p className="text-xs text-secondary mt-1">
                Display this QR Code at your payment counter or dining hall. Diners scan this to open your Telegram Bot, link their subscription, and instantly start managing their daily meals.
              </p>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-medium text-secondary mb-1">
                  Telegram Bot Username
                </label>
                <div className="flex items-center gap-2 bg-background/50 border border-border/85 rounded px-3 py-2.5 text-sm text-primary select-all">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                  <span className="font-semibold text-primary">@SSSSSSKYBot</span>
                  <span className="text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded font-medium ml-auto">Universal Integration</span>
                </div>
                <p className="text-[10px] text-secondary mt-1">
                  All messes share this universal integration. Diners are automatically mapped to your canteen when they scan.
                </p>
              </div>


              <div>
                <label className="block text-xs font-medium text-secondary mb-1">
                  Canteen / Mess Display Name
                </label>
                <input 
                  type="text" 
                  value={flyerMessName}
                  onChange={(e) => setFlyerMessName(e.target.value)}
                  placeholder="Madhura Mess"
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-primary outline-none focus:border-secondary transition-colors font-medium"
                />
                <p className="text-[10px] text-secondary mt-1">
                  The brand name that will print at the top of the dining flyer.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePrintFlyer}
                  className="w-full sm:w-auto px-4 py-2 bg-primary text-background text-sm font-medium rounded transition-all duration-300 hover:shadow-glow-primary hover:bg-primary/90 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Welcome Flyer
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-background/50 border border-border/80 rounded-xl relative group overflow-hidden max-w-[280px] w-full self-center">
            {/* Custom Scanning Styles */}
            <style>{`
              @keyframes scan-line {
                0% { top: 0%; opacity: 0.8; }
                50% { top: 100%; opacity: 0.8; }
                100% { top: 0%; opacity: 0.8; }
              }
              .scan-element {
                animation: scan-line 3s linear infinite;
              }
            `}</style>
            
            {/* Neon scanner green borders */}
            <div className="relative p-3 bg-white rounded-lg shadow-inner">
              {/* Scan box glow */}
              <div className="absolute inset-0 border-2 border-accent/40 rounded-lg pointer-events-none group-hover:border-accent/80 transition-colors duration-300"></div>
              
              {/* Animated laser line */}
              <div className="absolute left-0 right-0 h-0.5 bg-accent/80 shadow-[0_0_10px_#22c55e] z-10 scan-element pointer-events-none"></div>

              {/* QR Image */}
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://t.me/${botUsername.trim()}?start=${messId}`)}`} 
                alt="Telegram Onboarding QR" 
                className="w-[200px] h-[200px] block transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs font-semibold text-primary">Scan to Subscribe</p>
              <p className="text-[10px] text-secondary mt-0.5 font-mono select-all">t.me/{botUsername}?start={messId}</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Settings;
