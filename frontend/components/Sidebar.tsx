import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../src/hooks/useAuth';

const COLLAPSED_WIDTH = 72;
const MIN_EXPANDED_WIDTH = 200;
const MAX_WIDTH = 360;
const DEFAULT_WIDTH = 280;

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  const navItems = [
    { icon: 'insights', label: 'Dashboard', path: '/app/dashboard', description: 'Overview' },
    { icon: 'menu_book', label: 'Journal', path: '/app/journal', description: 'Transactions' },
    { icon: 'psychology', label: 'Reflections', path: '/app/reflections', description: 'Insights' },
    { icon: 'settings', label: 'Settings', path: '/app/settings', description: 'Preferences' },
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

  const getMemberSince = () => {
    return 'Member';
  };

  // Resize logic
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      // Snap to collapsed if dragged narrow enough
      if (newWidth < (COLLAPSED_WIDTH + MIN_EXPANDED_WIDTH) / 2) {
        setSidebarWidth(COLLAPSED_WIDTH);
        setIsCollapsed(true);
      } else if (newWidth < MIN_EXPANDED_WIDTH) {
        setSidebarWidth(MIN_EXPANDED_WIDTH);
        setIsCollapsed(false);
      } else if (newWidth > MAX_WIDTH) {
        setSidebarWidth(MAX_WIDTH);
        setIsCollapsed(false);
      } else {
        setSidebarWidth(newWidth);
        setIsCollapsed(false);
      }
    },
    [isResizing]
  );

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopResizing);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, stopResizing]);

  const showLabels = !isCollapsed && sidebarWidth >= MIN_EXPANDED_WIDTH;

  return (
    <aside
      ref={sidebarRef}
      className="relative hidden lg:flex flex-col flex-shrink-0 h-screen z-20 select-none"
      style={{
        width: sidebarWidth,
        minWidth: COLLAPSED_WIDTH,
        maxWidth: MAX_WIDTH,
        transition: isResizing ? 'none' : 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#280905] via-[#3a1410] to-[#1a0604] opacity-[0.97]" />
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      {/* Content */}
      <div className={`relative flex flex-col h-full py-8 overflow-hidden transition-all duration-200 ${isCollapsed ? 'px-3 items-center' : 'px-5'}`}>
        {/* Logo */}
        <div className={`mb-10 ${isCollapsed ? 'px-0' : 'px-2'}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0 overflow-hidden">
              <svg className="h-full w-full p-[3px]" viewBox="360 115 320 335" xmlns="http://www.w3.org/2000/svg">
                <path fill="white" opacity="0.9" d="M549.336426,179.346802 C541.419739,186.879257 531.738098,190.739319 522.396301,195.067062 C508.539459,201.486496 495.531860,209.290771 484.103485,219.341873 C469.300537,232.360962 458.619446,248.045242 457.426880,268.480743 C456.784485,279.488525 460.422394,289.502808 466.924713,298.368561 C472.734192,306.289673 478.888062,313.959808 484.634918,321.924683 C488.163788,326.815521 490.526978,332.334442 491.706787,338.318787 C493.421356,347.015503 489.713898,353.012268 481.079834,355.180359 C467.889618,358.492584 455.268707,355.773315 442.986511,351.069519 C428.350464,345.464294 415.519348,336.854980 403.806366,326.509247 C402.653015,325.490570 401.775360,323.811768 399.682770,324.116272 C399.097565,326.626953 400.887177,328.209839 401.964447,329.937958 C418.925720,357.147949 454.112396,372.790131 486.399567,366.295654 C516.412842,360.258575 541.414612,345.423737 558.906128,319.683411 C571.694458,300.864288 573.843628,281.292908 561.553223,261.082855 C556.660828,253.037918 550.264648,246.260864 544.434387,238.991776 C539.095154,232.334946 534.187012,225.329590 533.682434,216.369141 C533.192261,207.664978 536.207092,203.548859 544.601196,200.943710 C550.960999,198.969925 557.647644,198.809814 563.929749,199.949921 C606.195374,207.620560 636.426086,231.056488 651.876953,271.284851 C660.725037,294.322021 653.984009,316.258636 641.219116,336.387085 C628.302490,356.754608 611.081665,373.179474 592.377930,388.116272 C576.987244,400.407318 560.649170,411.288513 543.332703,420.725983 C513.508545,436.980164 484.135193,437.030426 455.484497,418.184906 C422.695679,396.617554 397.365051,368.301331 381.454742,332.304169 C362.931152,290.394592 367.989014,250.628830 395.344330,214.090530 C422.291534,178.097412 457.338440,152.039001 498.102997,133.581757 C509.454407,128.442093 521.508179,125.765839 534.091858,128.558762 C545.954346,131.191635 555.139587,137.499893 558.513794,149.608353 C561.685852,160.991333 558.170349,170.960587 549.336426,179.346802z" />
                <path fill="white" d="M496.577698,303.369690 C491.290955,297.782257 489.620056,291.062012 490.173920,284.203003 C491.015472,273.781921 493.884277,263.958801 502.643280,256.926819 C506.265961,254.018448 509.561890,250.705811 513.055359,247.632675 C515.244812,245.706696 517.231934,245.198685 519.208252,248.184540 C523.796814,255.117203 527.899902,262.235840 531.201660,269.931061 C534.303833,277.161255 535.511719,284.325928 535.371826,292.167389 C535.248535,299.081146 532.358887,303.946289 527.401001,307.956177 C522.612854,311.828857 517.377991,315.057556 511.545197,317.194977 C506.815338,318.928192 503.203827,316.969635 502.735199,311.914856 C502.353333,307.796509 498.810059,306.363342 496.577698,303.369690z" />
              </svg>
            </div>
            {showLabels && (
              <div className="flex flex-col">
                <span className="text-lg font-serif font-medium tracking-wide text-white/90">Fincurio</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">MVP Edition</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex flex-col gap-1.5 flex-1 ${isCollapsed ? 'items-center' : ''}`}>
          {showLabels && <span className="text-[10px] uppercase tracking-[0.2em] text-white/25 font-semibold mb-2 px-3">Navigation</span>}
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={`group relative flex items-center rounded-xl transition-all duration-200 ${
                  isCollapsed ? 'justify-center w-11 h-11 px-0' : 'gap-3.5 px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-white/[0.12] text-white shadow-sm'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'
                }`}
              >
                {/* Active indicator */}
                {isActive && !isCollapsed && (
                  <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary shadow-sm shadow-primary/50" />
                )}
                {isActive && isCollapsed && (
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary shadow-sm shadow-primary/50" />
                )}
                <span className={`material-symbols-outlined transition-colors ${isCollapsed ? 'text-[22px]' : 'text-xl'} ${
                  isActive ? 'text-primary' : 'group-hover:text-primary/70'
                }`}>
                  {item.icon}
                </span>
                {showLabels && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-tight">{item.label}</span>
                    <span className={`text-[10px] transition-colors ${isActive ? 'text-white/40' : 'text-white/20'}`}>
                      {item.description}
                    </span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className={`mt-auto flex flex-col gap-3 pt-6 border-t border-white/[0.08] ${isCollapsed ? 'items-center' : ''}`}>
          {/* User card */}
          <div className={`rounded-xl bg-white/[0.07] backdrop-blur-sm ${isCollapsed ? 'p-1.5' : 'p-3'}`}>
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-orange-500 to-amber-400 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/25 ring-2 ring-white/10 flex-shrink-0">
                {getInitials()}
              </div>
              {showLabels && (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white/90 truncate">{getDisplayName()}</span>
                  <span className="text-[10px] text-white/30">{getMemberSince()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={`flex items-center rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group ${
              isCollapsed ? 'justify-center w-11 h-11 px-0' : 'gap-3.5 px-3.5 py-2.5'
            }`}
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            {showLabels && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </div>
      </div>

      {/* Resize handle */}
      <div
        className="absolute top-0 -right-1 w-2 h-full cursor-col-resize z-30 group"
        onMouseDown={startResizing}
      >
        <div className={`absolute top-0 right-0 w-[3px] h-full transition-colors duration-200 ${
          isResizing ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/40'
        }`} />
      </div>
    </aside>
  );
};

export default Sidebar;
