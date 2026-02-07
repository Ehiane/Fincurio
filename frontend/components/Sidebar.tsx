import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';
import Logo from '../src/components/Logo';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { icon: 'insights', label: 'Dashboard', path: '/app/dashboard' },
    { icon: 'menu_book', label: 'Journal', path: '/app/journal' },
    { icon: 'auto_stories', label: 'Reflections', path: '/app/reflections' },
    { icon: 'settings', label: 'Settings', path: '/app/settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // Ignore errors on logout
    }
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (user?.firstName) {
      return `${user.firstName} ${user.lastName?.[0] || ''}.`;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 bg-stone-50 dark:bg-stone-900 border-b lg:border-b-0 lg:border-r border-stone-200 dark:border-stone-800/50 p-6 lg:p-8 flex flex-col justify-between z-20">
      <div>
        <div className="mb-10 pl-2">
          <Logo className="h-10 mb-2" showText={true} />
          <p className="text-stone-text text-sm font-medium tracking-wide mt-1 uppercase">MVP Edition</p>
        </div>
        <nav className="flex flex-col gap-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-full transition-all group ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-surface-dark dark:text-white'
                    : 'text-stone-600 dark:text-stone-text hover:bg-stone-200 dark:hover:bg-white/5'
                }`
              }
            >
              <span className="material-symbols-outlined transition-colors group-hover:text-primary">{item.icon}</span>
              <span className="text-base font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-surface-dark border border-stone-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-bold text-sm">
              {getInitials()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-stone-800 dark:text-white">{getDisplayName()}</span>
              <span className="text-xs text-stone-text">Member</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 rounded-full text-stone-600 dark:text-stone-text hover:bg-stone-200 dark:hover:bg-white/5 transition-all group"
        >
          <span className="material-symbols-outlined group-hover:text-primary">logout</span>
          <span className="text-base font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
