'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ChartBar,
  LogIn,
  Menu,
  X,
  Crown,
  Swords,
} from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analysis', label: 'Analysis', icon: ChartBar },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(8,8,16,0.95)] backdrop-blur-xl border-b border-[rgba(148,163,184,0.08)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center shadow-glow-sm group-hover:scale-110 transition-transform">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[17px] tracking-tight">
                Checkmate{' '}
                <span className="bg-gradient-to-r from-[#a855f7] to-[#06b6d4] bg-clip-text text-transparent">
                  AI
                </span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[rgba(124,58,237,0.15)] text-[#a855f7]'
                        : 'text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[rgba(148,163,184,0.06)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* CTA buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
              <Link
                href="/analysis"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white text-sm font-semibold rounded-lg hover:from-[#8b5cf6] hover:to-[#7c3aed] transition-all shadow-[0_4px_16px_rgba(124,58,237,0.3)] hover:shadow-[0_6px_24px_rgba(124,58,237,0.4)] hover:-translate-y-0.5"
              >
                <Swords className="w-4 h-4" />
                Analyze Game
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[#94a3b8] hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[rgba(8,8,16,0.98)] backdrop-blur-xl border-b border-[rgba(148,163,184,0.08)] md:hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-2">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[rgba(148,163,184,0.06)] transition-all"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-[rgba(148,163,184,0.1)] flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-[rgba(148,163,184,0.1)] text-sm font-medium text-[#94a3b8]"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  href="/analysis"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white text-sm font-semibold"
                >
                  <Swords className="w-4 h-4" />
                  Analyze Game
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
