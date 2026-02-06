
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    { icon: 'insights', label: 'Dashboard', path: '/app/dashboard' },
    { icon: 'menu_book', label: 'Journal', path: '/app/journal' },
    { icon: 'auto_stories', label: 'Reflections', path: '/app/reflections' },
    { icon: 'settings', label: 'Settings', path: '/app/settings' },
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 bg-background-light dark:bg-background-dark border-b lg:border-b-0 lg:border-r border-stone-200 dark:border-stone-800/50 p-6 lg:p-8 flex flex-col justify-between z-20">
      <div>
        <div className="mb-10 pl-2">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Fincurio</h1>
          <p className="text-stone-text text-sm font-medium tracking-wide mt-1 uppercase">Premium Member</p>
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 overflow-hidden relative">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_9jaG35jL7zNjge_tEMXepgC0v7qZF-5OxWqpAktqVfKu5O-XRWyRFU2yTusbsrvPRvQCNl0dwv8tHrRdafaZqTxLJvcasVoCKPSebXdu2zKNgAgJGutwtjwyqBEfEzuB9QEvxy8dXfkE3BbJSmNA23n_uVMGcJtTWp6dBZH6iAlTF6SG0MDqaxM0sHRATiSoeOI3kqDzbHv5OXq7rnHlea4H2She1saERwcpmz72XRKP1-mBhs1__Y7w8mXe4Mwa4sRbzM3voBrS" 
                alt="Alex M." 
                className="w-full h-full object-cover opacity-90"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-stone-800 dark:text-white">Alex M.</span>
              <span className="text-xs text-stone-text">Pro Member</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/')}
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
