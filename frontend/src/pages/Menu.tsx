import React, { useState, useEffect } from 'react';
import { menuApi } from '../api/menu';
import { ChefHat, Calendar, Sparkles, ArrowLeft, ArrowRight, Save, Clock, UtensilsCrossed } from 'lucide-react';

const Menu: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [lunchMenu, setLunchMenu] = useState<string>('');
  const [dinnerMenu, setDinnerMenu] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [confirmMsg, setConfirmMsg] = useState<string | null>(null);

  // Fetch menu for the selected date
  const fetchMenu = async (dateStr: string) => {
    try {
      setLoading(true);
      const res = await menuApi.getMenu(dateStr);
      if (res.data) {
        setLunchMenu(res.data.lunchMenu || '');
        setDinnerMenu(res.data.dinnerMenu || '');
      } else {
        setLunchMenu('');
        setDinnerMenu('');
      }
    } catch {
      // Menu might not exist for the day, default to empty
      setLunchMenu('');
      setDinnerMenu('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu(selectedDate);
  }, [selectedDate]);

  // Navigate dates
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Save/Update Menu
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await menuApi.saveMenu({
        date: selectedDate,
        lunchMenu: lunchMenu.trim() || null,
        dinnerMenu: dinnerMenu.trim() || null,
      });
      setConfirmMsg('✓ Menu Saved Successfully');
    } catch {
      setConfirmMsg('✗ Save Failed. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setConfirmMsg(null), 3000);
    }
  };

  // Quick Copy Feature (Yesterday's Menu)
  const handleCopyYesterday = async () => {
    try {
      const yesterday = new Date(selectedDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      setSaving(true);
      const res = await menuApi.getMenu(yesterdayStr);
      if (res.data) {
        setLunchMenu(res.data.lunchMenu || '');
        setDinnerMenu(res.data.dinnerMenu || '');
        setConfirmMsg('✓ Copied Yesterday\'s Menu');
      } else {
        setConfirmMsg('⚠ Yesterday\'s Menu is empty');
      }
    } catch {
      setConfirmMsg('✗ Could not copy yesterday\'s menu');
    } finally {
      setSaving(false);
      setTimeout(() => setConfirmMsg(null), 3000);
    }
  };

  const formattedDisplayDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col h-full overflow-y-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-6 gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ChefHat className="text-accent h-6 w-6" />
            <h1 className="text-2xl font-semibold text-primary">Daily Menu Editor</h1>
          </div>
          <p className="text-secondary">Set lunch and dinner dishes. Telegram customers see this in real-time.</p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 bg-surface border border-border p-1.5 rounded-lg shadow-sm">
          <button 
            onClick={handlePrevDay} 
            className="p-1.5 rounded text-secondary hover:text-primary hover:bg-background transition-colors active:scale-95"
            title="Previous Day"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="relative flex items-center">
            <Calendar size={14} className="absolute left-2.5 text-secondary pointer-events-none" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-medium text-primary py-1 pl-8 pr-2.5 outline-none rounded cursor-pointer hover:bg-background transition-colors"
            />
          </div>

          <button 
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold text-accent border border-accent/20 rounded bg-accent/5 hover:bg-accent/10 transition-colors active:scale-95"
          >
            Today
          </button>

          <button 
            onClick={handleNextDay} 
            className="p-1.5 rounded text-secondary hover:text-primary hover:bg-background transition-colors active:scale-95"
            title="Next Day"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-secondary">Loading daily menu details...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-8 pb-12">
          
          {/* Current Date Visual Indicator */}
          <div className="bg-gradient-to-r from-accent/10 via-transparent to-transparent border border-accent/20 p-4 rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-accent animate-pulse" />
              <div>
                <span className="text-xs text-secondary font-medium uppercase tracking-wider block">Editing Menu For</span>
                <span className="text-sm font-semibold text-primary">{formattedDisplayDate}</span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleCopyYesterday}
              className="text-xs font-medium text-secondary hover:text-primary border border-border px-3 py-1.5 rounded bg-surface hover:shadow-glow-primary active:scale-95 transition-all duration-300"
            >
              Copy Yesterday's Menu
            </button>
          </div>

          {/* Meals Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Lunch Card */}
            <div className="bg-surface border border-border rounded p-6 transition-all duration-300 hover:shadow-glow-primary hover:border-primary/20 flex flex-col h-full min-h-[300px]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-warning/10 text-warning rounded-lg">
                    <Clock size={16} />
                  </div>
                  <h2 className="text-sm font-semibold text-primary">Lunch Menu</h2>
                </div>
                <span className="text-xs font-medium bg-border/50 text-secondary px-2 py-0.5 rounded">Standard Slot</span>
              </div>
              
              <textarea
                value={lunchMenu}
                onChange={(e) => setLunchMenu(e.target.value)}
                placeholder="Enter today's lunch details... (e.g. Shahi Paneer, Butter Roti, Yellow Dal Fry, Jeera Rice, Curd, Salad)"
                className="w-full flex-1 min-h-[180px] bg-background border border-border rounded p-3 text-sm text-primary outline-none focus:border-secondary transition-colors resize-none placeholder:text-secondary/50 leading-relaxed font-sans"
              />
            </div>

            {/* Dinner Card */}
            <div className="bg-surface border border-border rounded p-6 transition-all duration-300 hover:shadow-glow-primary hover:border-primary/20 flex flex-col h-full min-h-[300px]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-accent/10 text-accent rounded-lg">
                    <UtensilsCrossed size={16} />
                  </div>
                  <h2 className="text-sm font-semibold text-primary">Dinner Menu</h2>
                </div>
                <span className="text-xs font-medium bg-border/50 text-secondary px-2 py-0.5 rounded">Standard Slot</span>
              </div>
              
              <textarea
                value={dinnerMenu}
                onChange={(e) => setDinnerMenu(e.target.value)}
                placeholder="Enter today's dinner details... (e.g. Veg Pulao, Paneer Masala, Rumali Roti, Mixed Raita, Gulab Jamun)"
                className="w-full flex-1 min-h-[180px] bg-background border border-border rounded p-3 text-sm text-primary outline-none focus:border-secondary transition-colors resize-none placeholder:text-secondary/50 leading-relaxed font-sans"
              />
            </div>

          </div>

          {/* Submitting Actions */}
          <div className="flex items-center gap-4 relative pt-4">
            <button 
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-background text-sm font-medium rounded transition-all duration-300 hover:shadow-glow-primary hover:bg-primary/90 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Daily Menu'}
            </button>
            
            {confirmMsg && (
              <span className={`text-sm font-medium animate-fade-in-out ${confirmMsg.includes('✓') ? 'text-accent' : confirmMsg.includes('⚠') ? 'text-warning' : 'text-error'}`}>
                {confirmMsg}
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default Menu;
