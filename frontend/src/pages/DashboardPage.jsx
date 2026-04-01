import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Target, Flame, ArrowRight, Star, Zap, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { progressService, subjectService } from '../services';
import { StatCard, ProgressBar, TrendBadge, PageHeader, LoadingSpinner } from '../components/common';

const SUBJECT_COLORS = {
  'Data Structures': '#6366f1',
  'Algorithms': '#f59e0b',
  'Operating Systems': '#10b981',
  'DBMS': '#3b82f6',
  'Computer Networks': '#ec4899',
  'Software Engineering': '#8b5cf6',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      subjectService.getAll(),
      progressService.getAll().catch(() => ({ data: [] })),
      progressService.getRecommendations().catch(() => ({ data: [] })),
    ]).then(([s, p, r]) => {
      setSubjects(s.data);
      setProgress(p.data);
      setRecommendations(r.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalProgress = progress.length
    ? Math.round(progress.reduce((a, p) => a + p.overallProgress, 0) / progress.length)
    : 0;

  const getSubjectProgress = (name) => progress.find(p => p.subjectName === name)?.overallProgress || 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(111,97,255,0.15) 0%, rgba(143,135,255,0.08) 50%, rgba(236,72,153,0.08) 100%)',
          border: '1px solid rgba(111,97,255,0.2)'
        }}>
        <div className="relative z-10">
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{greeting} 👋</p>
          <h2 className="text-2xl font-bold mt-0.5" style={{ color: 'var(--color-text)' }}>
            {user?.name || 'Student'}!
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            You have <span className="text-primary-500 font-semibold">{recommendations.length} topics</span> recommended to study today.
          </p>
        </div>
        <div className="absolute right-4 top-4 text-6xl opacity-20 select-none">🎓</div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Subjects" value={subjects.length} subtitle="Enrolled" icon={BookOpen} color="#6f61ff" delay={0} />
        <StatCard title="Overall Progress" value={`${totalProgress}%`} subtitle="Avg mastery" icon={TrendingUp} color="#10b981" delay={0.05} />
        <StatCard title="Study Streak" value={`${progress.reduce((a, p) => a + (p.streak || 0), 0)}d`} subtitle="Keep it up!" icon={Flame} color="#f59e0b" delay={0.1} />
        <StatCard title="Priority Topics" value={recommendations.length} subtitle="Need attention" icon={Target} color="#ec4899" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Subjects Progress */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Subject Overview</h3>
            <Link to="/subjects" className="text-sm text-primary-500 hover:text-primary-400 font-medium flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {subjects.map((s, i) => (
              <motion.div key={s._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${SUBJECT_COLORS[s.name] || '#6f61ff'}20` }}>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{s.name}</span>
                    <span className="text-xs font-bold ml-2" style={{ color: SUBJECT_COLORS[s.name] }}>
                      {getSubjectProgress(s.name)}%
                    </span>
                  </div>
                  <ProgressBar value={getSubjectProgress(s.name)} color={SUBJECT_COLORS[s.name]} showValue={false} size="sm" />
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 text-primary-400 transition-opacity flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Priority Recommendations */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Zap size={18} className="text-amber-400" />
            <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Study Next</h3>
          </div>
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Star size={32} className="mx-auto mb-2 text-amber-400" />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Complete some topics to get personalized recommendations!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.slice(0, 5).map((rec, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-3 rounded-xl border border-[var(--color-border)] hover:border-primary-400/40 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{rec.topicName}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{rec.subjectName}</p>
                    </div>
                    <TrendBadge trend={rec.trend} />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <ProgressBar value={rec.masteryLevel} color="#6f61ff" showValue={false} size="sm" />
                    <span className="text-xs font-bold text-primary-400 flex-shrink-0">{rec.masteryLevel}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Importance: <span className="font-semibold text-amber-400">{rec.importanceScore}</span>
                    </span>
                    <span className="text-xs font-bold" style={{ color: '#ec4899' }}>
                      Priority: {rec.priorityScore}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <Link to="/progress" className="btn-secondary w-full text-center mt-4 block text-sm py-2.5">
            View Full Progress
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--color-text)' }}>Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Upload PYQ', to: '/pyq', icon: '📄', color: '#6f61ff' },
            { label: 'Browse Notes', to: '/notes', icon: '📝', color: '#10b981' },
            { label: 'Watch Videos', to: '/videos', icon: '▶️', color: '#f59e0b' },
            { label: 'Track Progress', to: '/progress', icon: '📊', color: '#ec4899' },
          ].map((item, i) => (
            <motion.div key={item.to} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to={item.to} className="card p-4 flex items-center gap-3 hover:border-primary-400/40 transition-all block">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${item.color}15` }}>
                  {item.icon}
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
