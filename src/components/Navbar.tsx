import React, { useState } from 'react';
import { PageView } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Dumbbell,
  LayoutDashboard,
  CalendarDays,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as PageView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-plan' as PageView, label: 'My Fitness Plan', icon: CalendarDays },
    { id: 'profile' as PageView, label: 'Profile', icon: UserIcon },
  ];

  const handleNavClick = (page: PageView) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            id="nav-brand-logo"
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#06B6D4] flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.25)] group-hover:scale-105 transition-transform duration-200 border border-white/20">
              <Dumbbell className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-xl font-bold tracking-tight text-slate-100">
                  FIT<span className="text-[#22C55E]">AI</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 backdrop-blur-md">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" /> PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase hidden sm:inline">
                AI Fitness Plan Generator
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06] backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-[#22C55E] border border-white/15 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#22C55E]' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User & Logout Button */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <button
                id="nav-profile-pill"
                onClick={() => handleNavClick('profile')}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 backdrop-blur-md transition-all text-left shadow-sm"
              >
                <div className="w-7 h-7 rounded-lg bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-xs font-bold text-[#22C55E]">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200 leading-tight max-w-[120px] truncate">
                    {user.name || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-400 max-w-[120px] truncate">
                    {user.email}
                  </span>
                </div>
              </button>
            )}

            <button
              id="nav-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 backdrop-blur-md transition-colors"
              title="Log out of account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-slate-100 border border-white/10 backdrop-blur-md"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-slate-950/90 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2">
          {user && (
            <div className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center font-bold text-sm border border-[#22C55E]/30">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-200 truncate">{user.name}</div>
                <div className="text-xs text-slate-400 truncate">{user.email}</div>
              </div>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-[#22C55E] border border-white/15'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}

          <button
            id="mobile-logout-btn"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors mt-4"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};
