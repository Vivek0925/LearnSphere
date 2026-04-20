import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Moon, Sun, Bell, LogOut, Bot, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-[var(--color-border)] px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:block" style={{ color: 'var(--color-text)' }}>
              Learn<span className="text-primary-500">Sphere</span>
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* AI Chat button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(111,97,255,0.15), rgba(143,135,255,0.1))',
              border: '1px solid rgba(111,97,255,0.3)',
              color: 'var(--color-primary)'
            }}
          >
            <Bot size={16} />
            <span className="hidden sm:block">AI Tutor</span>
          </motion.button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <button className="p-2.5 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors relative"
            style={{ color: 'var(--color-text-muted)' }}>
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500" />
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-[var(--color-border)]">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold leading-none" style={{ color: 'var(--color-text)' }}>
                {user?.name || 'Student'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {user?.branch || 'CSE'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors ml-1"
              style={{ color: 'var(--color-text-muted)' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
