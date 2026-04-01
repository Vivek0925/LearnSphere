import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, BookOpen, Star, Layers } from 'lucide-react';
import { useSubjects } from '../hooks/useSubjects';
import { LoadingSpinner, PageHeader, ProgressBar } from '../components/common';

export default function SubjectsPage() {
  const { subjects, loading } = useSubjects();
  const [search, setSearch] = useState('');

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  const difficultyColor = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

  if (loading) return <LoadingSpinner text="Loading subjects..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Engineering Subjects"
        subtitle="Explore AI-powered learning for all core subjects"
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search subjects..."
          className="input-field pl-10"
        />
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((subject, i) => (
          <motion.div key={subject._id}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }} whileHover={{ y: -4 }}
          >
            <Link to={`/subjects/${subject._id}`}
              className="card p-6 block group hover:border-primary-400/40 transition-all duration-300 h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl text-2xl flex items-center justify-center"
                    style={{ background: `${subject.color}20` }}>
                    {subject.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>{subject.name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-lg"
                      style={{ background: `${subject.color}20`, color: subject.color }}>
                      {subject.code}
                    </span>
                  </div>
                </div>
                <ArrowRight size={16} className="mt-1 opacity-0 group-hover:opacity-100 text-primary-400 transition-all group-hover:translate-x-1" />
              </div>

              <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                {subject.description}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <Layers size={13} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {subject.topics.length} topics
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={13} className="text-amber-400" />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {Math.max(...subject.topics.map(t => t.importanceScore), 0)} max score
                  </span>
                </div>
                <span className="badge text-xs ml-auto"
                  style={{ background: `${difficultyColor[subject.difficulty]}20`, color: difficultyColor[subject.difficulty] }}>
                  {subject.difficulty}
                </span>
              </div>

              {/* Top topics */}
              <div className="space-y-2">
                {subject.topics.slice(0, 3).map((topic) => (
                  <div key={topic.name} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: subject.color }} />
                    <span className="text-xs flex-1 truncate" style={{ color: 'var(--color-text-muted)' }}>{topic.name}</span>
                    <div className="w-16">
                      <ProgressBar value={topic.importanceScore} color={subject.color} showValue={false} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
