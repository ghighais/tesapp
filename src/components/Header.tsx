import React, { useState } from 'react';
import { 
  Database, 
  Github, 
  FileArchive, 
  Home, 
  Menu as MenuIcon, 
  X, 
  ShieldCheck, 
  Sparkles,
  Layers,
  LogOut,
  User,
  CheckCircle2
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  configuredDbCount: number;
  githubConnected: boolean;
  githubUsername: string | null;
  userEmail?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  configuredDbCount,
  githubConnected,
  githubUsername,
  userEmail = 'bantuf9@gmail.com',
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'beranda' as ActiveTab,
      label: 'Beranda',
      icon: Home,
      badge: null,
    },
    {
      id: 'database' as ActiveTab,
      label: 'Database',
      icon: Database,
      badge: `${configuredDbCount}/11`,
      badgeColor: configuredDbCount > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-neutral-800 text-neutral-400 border-neutral-700',
    },
    {
      id: 'github' as ActiveTab,
      label: 'Push GitHub',
      icon: Github,
      badge: githubConnected ? (githubUsername ? `@${githubUsername}` : 'Terhubung') : 'Token Diperlukan',
      badgeColor: githubConnected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-neutral-800 text-neutral-400 border-neutral-700',
    },
    {
      id: 'zip' as ActiveTab,
      label: 'Save Zip',
      icon: FileArchive,
      badge: 'Export',
      badgeColor: 'bg-amber-500/10 text-amber-400/80 border-amber-500/30',
    },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-neutral-950/85 border-b border-amber-500/20 shadow-2xl transition-all">
      {/* Top subtle golden rim highlight */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO & APP NAME */}
          <div 
            id="header-brand-logo"
            onClick={() => onSelectTab('beranda')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            {/* Luxurious Geometric Emblem Logo */}
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-[1px] shadow-lg shadow-amber-900/30 group-hover:shadow-amber-500/30 transition-all duration-300">
              <div className="w-full h-full rounded-xl bg-neutral-950 flex items-center justify-center relative overflow-hidden">
                {/* Subtle luxury glow behind icon */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-amber-300/10 opacity-70 group-hover:opacity-100 transition-opacity" />
                
                {/* SVG Emblem / Monogram */}
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-amber-400 drop-shadow-[0_2px_8px_rgba(212,175,55,0.5)] transform group-hover:scale-105 transition-transform" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 17l10 5 10-5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 12l10 5 10-5" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Application Name & Subtitle */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-luxury text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500 drop-shadow-sm">
                  GHIGHAIS AI
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-widest uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  Luxe Suite
                </span>
              </div>
              <span className="text-[10px] font-medium tracking-[0.2em] text-neutral-400 uppercase">
                Enterprise Cloud & Git Architecture
              </span>
            </div>
          </div>

          {/* DESKTOP NAVIGATION MENU */}
          <nav className="hidden md:flex items-center gap-1.5 bg-neutral-900/60 p-1.5 rounded-2xl border border-neutral-800/80 backdrop-blur-md shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-amber-200 bg-gradient-to-b from-amber-950/70 to-neutral-900 border border-amber-500/40 shadow-lg shadow-black/40'
                      : 'text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
                  <span className="tracking-wide">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* RIGHT UTILITY BADGE & MOBILE TOGGLE */}
          <div className="flex items-center gap-2.5">
            {/* User Profile / Autosave Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">
                {userEmail.slice(0, 1).toUpperCase()}
              </div>
              <span className="text-neutral-300 text-[11px] font-medium max-w-[120px] md:max-w-[150px] truncate" title={userEmail}>
                {userEmail}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Autosave Aktif" />
            </div>

            {/* LOGOUT BUTTON IN MENU */}
            {onLogout && (
              <button
                id="header-logout-btn"
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/90 hover:bg-rose-950/50 border border-neutral-800 hover:border-rose-500/40 text-neutral-300 hover:text-rose-200 text-xs font-semibold transition-all shadow-sm cursor-pointer group"
                title="Keluar / Logout (Pekerjaan disimpan aman di perangkat)"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">Logout</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-amber-300 hover:border-amber-500/40 transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-800 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User info in mobile */}
            <div className="px-4 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                  {userEmail.slice(0, 1).toUpperCase()}
                </div>
                <span className="text-neutral-200 font-medium truncate">{userEmail}</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Tersimpan
              </span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-950/40 text-amber-200 border border-amber-500/40'
                      : 'text-neutral-300 hover:bg-neutral-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Mobile Logout item */}
            {onLogout && (
              <button
                id="mobile-nav-logout-btn"
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/50 text-rose-300 transition-all mt-2"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Logout &amp; Simpan Pekerjaan</span>
                </div>
                <span className="text-[10px] text-rose-400/80 bg-rose-500/10 px-2 py-0.5 rounded-full">
                  Aman
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
