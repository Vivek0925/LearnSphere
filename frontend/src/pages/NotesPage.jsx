import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, StickyNote, Clock, X, BookMarked, Tag } from 'lucide-react';
import { notesService } from '../services';
import { LoadingSpinner, PageHeader, EmptyState } from '../components/common';

const SUBJECT_COLORS = {
  'Data Structures': '#6366f1', 'Algorithms': '#f59e0b',
  'Operating Systems': '#10b981', 'DBMS': '#3b82f6',
  'Computer Networks': '#ec4899', 'Software Engineering': '#8b5cf6',
};
const diffColor = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [selected, setSelected] = useState(null);

  const subjects = ['Data Structures', 'Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks', 'Software Engineering'];

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (subject) params.subject = subject;
    setLoading(true);
    notesService.getAll(params)
      .then(res => setNotes(res.data))
      .finally(() => setLoading(false));
  }, [search, subject]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Notes" subtitle="Topic-wise structured notes for all subjects" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." className="input-field pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSubject('')} className={`badge px-3 py-1.5 cursor-pointer transition-all ${!subject ? 'bg-primary-500/20 text-primary-400 border border-primary-400/30' : 'hover:border-primary-400/30'}`}
            style={!subject ? {} : { background: 'var(--color-surface-2)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
            All
          </button>
          {subjects.map(s => (
            <button key={s} onClick={() => setSubject(subject === s ? '' : s)}
              className={`badge px-3 py-1.5 cursor-pointer transition-all text-xs`}
              style={{
                background: subject === s ? `${SUBJECT_COLORS[s]}20` : 'var(--color-surface-2)',
                color: subject === s ? SUBJECT_COLORS[s] : 'var(--color-text-muted)',
                border: `1px solid ${subject === s ? SUBJECT_COLORS[s] + '50' : 'var(--color-border)'}`
              }}>
              {s.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {loading ? <LoadingSpinner text="Loading notes..." /> : (
        <>
          {notes.length === 0
            ? <EmptyState icon={StickyNote} title="No notes found" description="Try a different search term or subject filter" />
            : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {notes.map((note, i) => (
                  <motion.div key={note._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }} whileHover={{ y: -3 }}
                    onClick={() => setSelected(note)} className="card p-5 cursor-pointer hover:border-primary-400/40 transition-all group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${SUBJECT_COLORS[note.subjectName] || '#6f61ff'}20` }}>
                        <BookMarked size={16} style={{ color: SUBJECT_COLORS[note.subjectName] || '#6f61ff' }} />
                      </div>
                      <span className="badge text-xs" style={{ background: `${diffColor[note.difficulty]}20`, color: diffColor[note.difficulty] }}>
                        {note.difficulty}
                      </span>
                    </div>
                    <div className="mb-1">
                      <p className="text-xs font-semibold mb-0.5" style={{ color: SUBJECT_COLORS[note.subjectName] || '#6f61ff' }}>
                        {note.subjectName} · {note.topic}
                      </p>
                      <h3 className="font-bold text-sm leading-snug" style={{ color: 'var(--color-text)' }}>{note.title}</h3>
                    </div>
                    <p className="text-xs mt-2 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{note.content}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
                      <div className="flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                        <Clock size={12} />
                        <span className="text-xs">{note.readTime} min read</span>
                      </div>
                      <span className="text-xs font-semibold text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">Read →</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          }
        </>
      )}

      {/* Note Detail Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="card w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="p-6 border-b border-[var(--color-border)] flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: SUBJECT_COLORS[selected.subjectName] }}>
                    {selected.subjectName} · {selected.topic}
                  </p>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{selected.title}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="badge text-xs" style={{ background: `${diffColor[selected.difficulty]}20`, color: diffColor[selected.difficulty] }}>{selected.difficulty}</span>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}><Clock size={11} />{selected.readTime} min</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-[var(--color-surface-2)]" style={{ color: 'var(--color-text-muted)' }}>
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div>
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--color-text)' }}>Overview</h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{selected.content}</p>
                </div>
                {selected.keyPoints?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--color-text)' }}>Key Points</h4>
                    <ul className="space-y-1.5">
                      {selected.keyPoints.map((kp, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 flex-shrink-0" />
                          {kp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selected.formulas?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2" style={{ color: 'var(--color-text)' }}>Formulas & Key Definitions</h4>
                    <div className="space-y-2">
                      {selected.formulas.map((f, i) => (
                        <div key={i} className="px-4 py-2.5 rounded-xl font-mono text-sm"
                          style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selected.tags?.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap pt-2">
                    <Tag size={13} style={{ color: 'var(--color-text-muted)' }} />
                    {selected.tags.map(t => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
