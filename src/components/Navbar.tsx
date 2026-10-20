'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import {
  Code2,
  BookOpen,
  Terminal,
  Award,
  Library,
  User,
  FileText,
  Sun,
  Moon,
  Laptop,
  Coins,
  Menu,
  X,
  LogOut,
  Settings,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setMode, resolvedTheme } = useTheme();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    document.cookie = 'cn_auth_token=; path=/; max-age=0';
    setUser(null);
    setUserDropdownOpen(false);
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { name: 'Dashboard', href: user ? '/dashboard' : '/', icon: Code2 },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Practice', href: '/practice', icon: Terminal },
    { name: 'Exams', href: '/exam', icon: Award },
    { name: 'Library', href: '/library', icon: Library },
    { name: 'Career Profile', href: '/profile', icon: User },
    { name: 'Resume Builder', href: '/resume', icon: FileText },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Code Nexus
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider text-slate-400 block -mt-1 font-mono">
                Academy & Lab
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Points Pill (Active if user logged in) */}
            {user && (
              <Link
                href="/dashboard"
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:border-amber-400 transition-colors shadow-sm"
                title="Your Code Nexus Points Balance (150 points unlocks Library Books!)"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{user.points || 0} pts</span>
              </Link>
            )}

            {/* Theme Toggle Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                title={`Theme: ${mode}`}
              >
                {resolvedTheme === 'dark' ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-1 z-50 text-xs">
                  <button
                    onClick={() => { setMode('dark'); setThemeDropdownOpen(false); }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-slate-800 ${mode === 'dark' ? 'text-cyan-400 font-semibold' : 'text-slate-300'}`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark Mode</span>
                  </button>
                  <button
                    onClick={() => { setMode('light'); setThemeDropdownOpen(false); }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-slate-800 ${mode === 'light' ? 'text-cyan-400 font-semibold' : 'text-slate-300'}`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light Mode</span>
                  </button>
                  <button
                    onClick={() => { setMode('system'); setThemeDropdownOpen(false); }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-slate-800 ${mode === 'system' ? 'text-cyan-400 font-semibold' : 'text-slate-300'}`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>System Sync</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Dropdown / Auth Buttons */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                    {user.full_name ? user.full_name.charAt(0) : 'U'}
                  </div>
                  <span className="hidden md:inline-block text-xs font-medium text-slate-200">
                    {user.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <p className="font-semibold text-slate-200 truncate">{user.full_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {user.role === 'admin' && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] rounded font-mono font-medium">
                          Administrator
                        </span>
                      )}
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      <Code2 className="w-4 h-4 text-cyan-400" />
                      <span>My Dashboard</span>
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      <User className="w-4 h-4 text-blue-400" />
                      <span>Career Profile</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Theme & Background</span>
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-amber-300 hover:bg-slate-800"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 rounded-lg shadow-sm shadow-cyan-500/20 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-slate-950 border-b border-slate-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  active ? 'bg-blue-600/20 text-cyan-300' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
