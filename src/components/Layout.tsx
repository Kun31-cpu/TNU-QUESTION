import React, { useState, useEffect } from "react";
import { 
  BookOpen, Search, UploadCloud, User, Award, Bell, Sun, 
  Moon, Menu, X, LogOut, ShieldCheck, Sparkles, TrendingUp, ChevronRight, Inbox
} from "lucide-react";
import { User as UserType, Notification as NotificationType } from "../types";

interface LayoutProps {
  user: UserType | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  notifications: NotificationType[];
  onMarkNotificationsRead: () => void;
}

export default function Layout({
  user,
  onLogout,
  activeTab,
  setActiveTab,
  children,
  theme,
  toggleTheme,
  notifications,
  onMarkNotificationsRead
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: "home", label: "Archive Vaults", icon: BookOpen },
    { id: "upload", label: "Upload Paper", icon: UploadCloud, authRequired: true },
    { id: "leaderboard", label: "Contributor Rankings", icon: Award },
    { id: "curriculum-ai", label: "UniVault AI Expert", icon: Sparkles }
  ];

  if (user?.role === "admin") {
    navItems.push({ id: "admin", label: "Admin Console", icon: ShieldCheck });
  }

  // Handle outside click to close popovers
  useEffect(() => {
    const handleOutsideClick = () => {
      setNotifDropdownOpen(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Compute contribution tier progress
  const points = user?.points || 0;
  const currentTier = points >= 1000 ? "Diamond Scholar" : points >= 500 ? "Gold Scholar" : points >= 200 ? "Silver Scribe" : "Copper Keeper";
  const pointsForNext = points >= 1000 ? 1000 : points >= 500 ? 1000 : points >= 200 ? 500 : 200;
  const percentProgress = points >= 1000 ? 100 : Math.round((points / pointsForNext) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Dynamic Upper Banner Background */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
        <div id="nav-navbar-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand / Human Labels */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="relative p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/20">
              <BookOpen className="h-5 w-5" id="brand-logo" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                UniVault
              </span>
              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 hidden sm:block">ACADEMIC VAULTS</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.authRequired && !user) return null;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-blue-600/10 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" 
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Controls Panel */}
          <div className="flex items-center space-x-3">
            
            {/* Theme Toggle Button */}
            <button
              id="theme-toggler"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-all duration-200"
              title="Toggle theme mode"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notification Alert System */}
            {user && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  id="notifications-indicator"
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    if (!notifDropdownOpen && unreadCount > 0) {
                      onMarkNotificationsRead();
                    }
                  }}
                  className="relative p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-all duration-200"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Portal */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-4 py-3 border-b border-rose-500/10 dark:border-rose-500/5 bg-rose-50/20 dark:bg-rose-950/10 flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Vault Notifications</span>
                      <span className="text-[10px] font-mono select-none px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                        {unreadCount} unread
                      </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-neutral-500">
                          <Inbox className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
                          <p className="text-xs">Your academic notice board is clear</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div key={notif.id} className={`p-3 text-left transition-colors duration-150 ${notif.read ? "bg-white dark:bg-neutral-900" : "bg-neutral-50/65 dark:bg-neutral-800/40"}`}>
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">{notif.title}</span>
                              <span className="text-[9px] font-mono text-neutral-400 capitalize">{notif.type}</span>
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">{notif.message}</p>
                            <p className="text-[9px] font-mono text-neutral-400 mt-1.5">
                              {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown / Login Trigger */}
            {user ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                
                {/* Visual Avatar */}
                <img
                  id="user-avatar-indicator"
                  src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-blue-200 dark:border-blue-800 bg-slate-100 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setActiveTab("profile")}
                />
                
                {/* Points Card Info inside Header */}
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[120px]" title={user.name}>
                    {user.name}
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-medium flex items-center">
                    <Sparkles className="h-3 w-3 mr-0.5 animate-pulse" />
                    {user.points} Contrib pts
                  </span>
                </div>

                {/* Logout Button */}
                <button
                  id="logout-button"
                  onClick={onLogout}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
                  title="Logout Session"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                id="login-redirect-button"
                onClick={() => setActiveTab("login")}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all duration-200 shadow-md shadow-blue-500/20"
              >
                <User className="h-3.5 w-3.5" />
                <span>Join Vault</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-all md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-2 pt-2 pb-4 space-y-1 bg-white border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800 animate-in fade-in duration-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.authRequired && !user) return null;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive 
                      ? "bg-blue-600/10 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" 
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {user && (
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 px-4">
                <div className="flex items-center space-x-3 mb-3" onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }}>
                  <img src={user.avatar} className="h-10 w-10 rounded-full" />
                  <div>
                    <h4 className="text-sm font-semibold">{user.name}</h4>
                    <p className="text-xs text-slate-550 dark:text-slate-400 font-mono">{user.points} Contributed Points</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout Session</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Gamification Level Track (Floating Sub-HUD for contributors) */}
      {user && (
        <div className="bg-slate-100 dark:bg-slate-900 py-2 border-b border-slate-200 dark:border-slate-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs space-y-1.5 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="font-mono bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold">
                {currentTier}
              </span>
              <span className="text-slate-500 select-none">Rank level progress to next title:</span>
            </div>
            <div className="w-full sm:w-64 max-w-sm flex items-center space-x-2">
              <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden shadow-inner">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentProgress}%` }}
                ></div>
              </div>
              <span className="font-mono text-slate-500 font-semibold">{percentProgress}% ({user.points}/{pointsForNext} pts)</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </div>
      </main>

      {/* Bottom Legal / Fast human credit label free footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-10 bg-white dark:bg-neutral-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
            UNIVAULT EXAMINATIONS ARCHIVE &copy; {new Date().getFullYear()} &bull; UNLOCKING ACADEMIC EXCELLENCE
          </p>
          <p className="text-[10px] text-neutral-400/70 mt-2">
            Built using modern full-stack Express engine and React client with secure JWT vault encryptions.
          </p>
        </div>
      </footer>
    </div>
  );
}
