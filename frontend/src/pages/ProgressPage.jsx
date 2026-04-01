import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Zap, Star } from 'lucide-react';
import { progressService, subjectService } from '../services';
import { LoadingSpinner, PageHeader, ProgressBar, StatCard, TrendBadge, MasteryBadge } from '../components/common';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const SUBJECT_COLORS = {
  'Data Structures': '#6366f1', 'Algorithms': '#f59e0b',
  'Operating Systems': '#10b981', 'DBMS': '#3b82f6',
  'Computer Networks': '#ec4899', 'Software Engineering': '#8b5cf6',
};

export default function ProgressPage() {
  const [progress, setProgress] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState(null);

  useEffect(() => {
    Promise.all([
      progressService.getAll(),
      progressService.getRecommendations().catch(() => ({ data: [] })),
      subjectService.getAll(),
    ]).then(([p, r, s]) => {
      setProgress(p.data);
      setRecommendations(r.data);
      setSubjects(s.data);
      if (p.data.length > 0) setActiveSubject(p.data[0]);
    }).finally(() => setLoading(false));
  }, []);

  const totalProgress = progress.length
    ? Math.round(progress.reduce((a, p) => a + p.overallProgress, 0) / progress.length)
    : 0;

  const radarData = subjects.map(s => ({
    subject: s.code,
    value: progress.find(p => p.subjectName === s.name)?.overallProgress || 0,
    fullMark: 100,
  }));

  if (loading) return <LoadingSpinner text="Loading progress..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="My Progress" subtitle="Track your mastery and adaptive learning journey" />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Overall Mastery" value={`${totalProgress}%`} icon={TrendingUp} color="#6f61ff" delay={0} />
        <StatCard title="Subjects Active" value={progress.length} subtitle={`of ${subjects.length} total`} icon={Star} color="#10b981" delay={0.05} />
        <StatCard title="Topics Studied" value={progress.reduce((a, p) => a + p.topicsProgress.filter(t => t.attempts > 0).length, 0)} icon={Target} color="#f59e0b" delay={0.1} />
        <StatCard title="Priority Queue" value={recommendations.length} icon={Zap} color="#ec4899" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
          <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--color-text)' }}>Subject Radar</h3>
          {radarData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                <Radar name="Mastery" dataKey="value" stroke="#6f61ff" fill="#6f61ff" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text)' }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Start practicing topics to see your radar chart!</p>
              </div>
            </div>
          )}
          {/* Subject list */}
          <div className="mt-4 space-y-2">
            {subjects.map(s => {
              const p = progress.find(pr => pr.subjectName === s.name);
              return (
                <div key={s._id} className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors"
                  onClick={() => setActiveSubject(p || { subjectName: s.name, overallProgress: 0, topicsProgress: [] })}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: SUBJECT_COLORS[s.name] }} />
                  <span className="text-sm flex-1" style={{ color: 'var(--color-text)' }}>{s.name}</span>
                  <span className="text-xs font-bold" style={{ color: SUBJECT_COLORS[s.name] }}>
                    {p?.overallProgress || 0}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Topic Mastery Detail */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
              {activeSubject ? `${activeSubject.subjectName} — Topics` : 'Select a Subject'}
            </h3>
            {activeSubject && (
              <div className="flex items-center gap-2">
                <ProgressBar value={activeSubject.overallProgress || 0} color={SUBJECT_COLORS[activeSubject.subjectName]} showValue={false} size="sm" />
                <span className="text-sm font-bold" style={{ color: SUBJECT_COLORS[activeSubject.subjectName] }}>
                  {activeSubject.overallProgress || 0}%
                </span>
              </div>
            )}
          </div>

          {!activeSubject ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
              Click a subject on the radar chart to see detailed topic progress
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {subjects.find(s => s.name === activeSubject.subjectName)?.topics.map((topic, i) => {
                const tp = activeSubject.topicsProgress?.find(t => t.topicName === topic.name) || { masteryLevel: 0, attempts: 0 };
                return (
                  <motion.div key={topic.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-4 rounded-xl border border-[var(--color-border)] hover:border-primary-400/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{topic.name}</span>
                      <div className="flex items-center gap-2">
                        <TrendBadge trend={topic.trend} />
                        <MasteryBadge level={tp.masteryLevel} />
                      </div>
                    </div>
                    <ProgressBar value={tp.masteryLevel} color={SUBJECT_COLORS[activeSubject.subjectName] || '#6f61ff'} showValue size="md" />
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Attempts: <strong style={{ color: 'var(--color-text)' }}>{tp.attempts}</strong></span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Importance: <strong className="text-amber-400">{topic.importanceScore}</strong></span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Priority Recommendations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Zap size={18} className="text-amber-400" /> Priority Study Queue
        </h3>
        {recommendations.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: 'var(--color-text-muted)' }}>
            Practice topics in the Subjects section to get personalized priority recommendations
          </p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {recommendations.map((rec, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl border border-[var(--color-border)] hover:border-primary-400/30 transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{rec.topicName}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{rec.subjectName}</p>
                  </div>
                  <span className="badge text-xs font-bold px-2.5 py-1"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                    P{rec.priorityScore}
                  </span>
                </div>
                <ProgressBar value={rec.masteryLevel} color={SUBJECT_COLORS[rec.subjectName]} showValue={false} size="sm" />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Mastery: {rec.masteryLevel}%</span>
                  <TrendBadge trend={rec.trend} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
