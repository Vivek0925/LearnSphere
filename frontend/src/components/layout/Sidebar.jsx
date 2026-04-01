import React from 'react';

import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, FileQuestion, StickyNote,
  Video, TrendingUp, X, Sparkles, ChevronRight ,Bot
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/subjects', icon: BookOpen, label: 'Subjects' },
  { path: '/pyq', icon: FileQuestion, label: 'PYQ Analysis' },
  { path: '/notes', icon: StickyNote, label: 'Notes' },
  { path: '/videos', icon: Video, label: 'Smart Videos' },
  { path: '/progress', icon: TrendingUp, label: 'My Progress' },
  { path: '/chat', icon: Bot, label: 'AI Tutor', highlight: true },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-lg leading-none" style={{ color: 'var(--color-text)' }}>
            Learn<span className="text-primary-500">Sphere</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>AI Learning Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
          Navigation
        </p>
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={`nav-link ${active ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-primary-400" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer card */}
      <div className="mt-6 p-4 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(111,97,255,0.15), rgba(143,135,255,0.08))',
          border: '1px solid rgba(111,97,255,0.2)'
        }}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-primary-400" />
          <span className="text-xs font-semibold text-primary-400">AI Powered</span>
        </div>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Adaptive learning that evolves with your performance.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen glass border-r border-[var(--color-border)] relative z-10">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 md:hidden glass border-r border-[var(--color-border)]"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-[var(--color-surface-2)]"
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
