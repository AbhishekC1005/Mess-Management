import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, Settings, ChefHat, Sun, Moon, LogOut } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../hooks/useAuth';

const Sidebar: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { logout } = useAuth();

  useEffect(() => {
    // Initial setup if html has dark class
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/customers', label: 'Customers', icon: Users },
    { path: '/attendance', label: 'Attendance', icon: CalendarDays },
    { path: '/menu', label: 'Daily Menu', icon: ChefHat },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className="bg-surface border-r border-border h-full flex flex-col transition-all duration-150 relative z-10"
      style={{ width: isHovered ? '240px' : '64px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4 flex items-center h-16 border-b border-border overflow-hidden whitespace-nowrap">
        <ChefHat className="text-accent flex-shrink-0" size={24} />
        {isHovered && <span className="ml-3 font-semibold text-lg transition-opacity duration-150">MessManager</span>}
      </div>
      
      <nav className="flex-1 py-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => twMerge(
              'flex items-center px-4 py-3 mx-2 rounded overflow-hidden whitespace-nowrap text-secondary transition-all duration-300 hover:text-primary hover:bg-background hover:shadow-[0_0_15px_rgba(245,245,245,0.05)] hover:border-primary/20 active:scale-95',
              isActive && 'bg-background text-primary border-l-2 border-accent rounded-l-none ml-0 pl-6 shadow-[inset_4px_0_20px_rgba(34,197,94,0.15)] hover:shadow-[inset_4px_0_20px_rgba(34,197,94,0.15)]'
            )}
            title={!isHovered ? item.label : undefined}
          >
            <item.icon size={20} className="flex-shrink-0" />
            {isHovered && <span className="ml-3 font-medium transition-opacity duration-150">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <button 
          onClick={logout}
          className="flex items-center w-full px-2 py-3 rounded text-secondary transition-all duration-300 hover:text-primary hover:bg-background hover:shadow-[0_0_15px_rgba(245,245,245,0.05)] hover:border-primary/20 active:scale-95 overflow-hidden whitespace-nowrap"
          title={!isHovered ? 'Logout' : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {isHovered && <span className="ml-3 font-medium transition-opacity duration-150">Logout</span>}
        </button>
        <button 
          onClick={toggleTheme}
          className="flex items-center w-full px-2 py-3 rounded text-secondary transition-all duration-300 hover:text-primary hover:bg-background hover:shadow-[0_0_15px_rgba(245,245,245,0.05)] hover:border-primary/20 active:scale-95 overflow-hidden whitespace-nowrap"
          title={!isHovered ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
        >
          {theme === 'dark' ? <Sun size={20} className="flex-shrink-0" /> : <Moon size={20} className="flex-shrink-0" />}
          {isHovered && <span className="ml-3 font-medium transition-opacity duration-150">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
