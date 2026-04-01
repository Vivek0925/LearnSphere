import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Loading Spinner
export function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className={`${sizes[size]} border-4 border-primary-400 border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{text}</p>}
    </div>
  );
}

// Stat Card
export function StatCard({ title, value, subtitle, icon: Icon, color = '#6f61ff', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card p-5 hover:scale-[1.02] transition-transform duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{title}</p>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--color-text)' }}>{value}</p>
        </div>
        {Icon && (
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: `${color}20`, color }}>
            <Icon size={22} />
          </div>
        )}
      </div>
      {subtitle && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>}
    </motion.div>
  );
}

// Progress Bar
export function ProgressBar({ value, color = '#6f61ff', label, showValue = true, size = 'md' }) {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</span>}
          {showValue && <span className="text-xs font-bold" style={{ color }}>{Math.round(value)}%</span>}
        </div>
      )}
      <div className={`w-full ${heights[size]} rounded-full`} style={{ background: 'var(--color-surface-2)' }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`${heights[size]} rounded-full`}
          style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
        />
      </div>
    </div>
  );
}

// Trend Badge
export function TrendBadge({ trend }) {
  const config = {
    rising: { icon: TrendingUp, label: 'Rising', class: 'trend-rising' },
    stable: { icon: Minus, label: 'Stable', class: 'trend-stable' },
    declining: { icon: TrendingDown, label: 'Declining', class: 'trend-declining' },
  };
  const { icon: Icon, label, class: cls } = config[trend] || config.stable;
  return (
    <span className={`badge ${cls} flex items-center gap-1`}>
      <Icon size={10} />
      {label}
    </span>
  );
}

// Empty State
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
          style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
          <Icon size={28} />
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{title}</h3>
      {description && <p className="text-sm max-w-xs" style={{ color: 'var(--color-text-muted)' }}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Page Header
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>{title}</h1>
        {subtitle && <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>}
      </motion.div>
      {action && <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>{action}</motion.div>}
    </div>
  );
}

// Mastery Level badge
export function MasteryBadge({ level }) {
  const config =
    level >= 80 ? { label: 'Expert', color: '#10b981' }
    : level >= 60 ? { label: 'Proficient', color: '#6f61ff' }
    : level >= 40 ? { label: 'Intermediate', color: '#f59e0b' }
    : level >= 20 ? { label: 'Beginner', color: '#f97316' }
    : { label: 'Not Started', color: '#9ca3af' };
  return (
    <span className="badge text-xs font-semibold" style={{ background: `${config.color}20`, color: config.color }}>
      {config.label}
    </span>
  );
}
