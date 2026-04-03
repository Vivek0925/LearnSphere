import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, BarChart2, ChevronDown, ChevronUp, Bot, MessageSquare } from 'lucide-react';
import { pyqService, subjectService } from '../services';
import { LoadingSpinner, PageHeader, TrendBadge, EmptyState } from '../components/common';

export default function PYQPage() {
  const [subjects, setSubjects] = useState([]);
  const [pyqs, setPyqs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expandedPyq, setExpandedPyq] = useState(null);
  const [filterSubject, setFilterSubject] = useState('');

  useEffect(() => {
    Promise.all([subjectService.getAll(), pyqService.getAll()])
      .then(([s, p]) => { setSubjects(s.data); setPyqs(p.data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterSubject
    ? pyqs.filter(p => p.subjectName === filterSubject)
    : pyqs;

  if (loading) return <LoadingSpinner text="Loading PYQs..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="PYQ History"
        subtitle="All previously analyzed question papers"
        action={
          <Link
            to="/chat"
            className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4"
          >
            <Bot size={16} /> Analyze New PYQ
          </Link>
        }
      />

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 p-4 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(111,97,255,0.1), rgba(143,135,255,0.06))',
          border: '1px solid rgba(111,97,255,0.25)'
        }}
      >
        <MessageSquare size={18} className="text-primary-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Upload PYQs via AI Tutor
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Go to <Link to="/chat" className="text-primary-400 hover:underline font-medium">AI Tutor</Link>,
            click the 📎 paperclip, attach your PYQ PDF and ask it to analyze.
            Results are saved here automatically.
          </p>
        </div>
      </motion.div>

      {/* Filter + count */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
          Analyzed Papers
          <span className="text-sm font-normal ml-2" style={{ color: 'var(--color-text-muted)' }}>
            ({filtered.length})
          </span>
        </h3>
        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="input-field w-48 text-sm py-2"
        >
          <option value="">All Subjects</option>
          {subjects.map(s => (
            <option key={s._id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* PYQ list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No PYQs analyzed yet"
          description="Upload a PYQ PDF via the AI Tutor chat to get started"
          action={
            <Link to="/chat" className="btn-primary text-sm py-2.5 px-5 inline-flex items-center gap-2">
              <Bot size={15} /> Go to AI Tutor
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((pyq, i) => (
            <motion.div
              key={pyq._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card overflow-hidden"
            >
              {/* Header row */}
              <div
                className="p-4 flex items-start justify-between cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors"
                onClick={() => setExpandedPyq(expandedPyq === pyq._id ? null : pyq._id)}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {pyq.subjectName}
                    </span>
                    <span className="badge bg-primary-500/10 text-primary-400">
                      {pyq.examYear}
                    </span>
                    <span className="badge" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                      {pyq.examType}
                    </span>
                    {pyq.fileName && (
                      <span className="badge text-xs" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                        📎 {pyq.fileName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {pyq.questions?.length || 0} questions · {pyq.topicAnalysis?.length || 0} topics identified
                    · {new Date(pyq.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {expandedPyq === pyq._id
                  ? <ChevronUp size={18} style={{ color: 'var(--color-text-muted)' }} />
                  : <ChevronDown size={18} style={{ color: 'var(--color-text-muted)' }} />
                }
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {expandedPyq === pyq._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-[var(--color-border)]"
                  >
                    <div className="p-4 space-y-5">

                      {/* Topic Analysis */}
                      {pyq.topicAnalysis?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"
                            style={{ color: 'var(--color-text)' }}>
                            <BarChart2 size={14} className="text-primary-400" /> Topic Analysis
                          </h4>
                          <div className="space-y-2">
                            {pyq.topicAnalysis.map((ta, ti) => (
                              <div key={ti} className="flex items-center gap-3 p-2.5 rounded-xl"
                                style={{ background: 'var(--color-surface-2)' }}>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                      {ta.topic}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {ta.importanceLevel && (
                                        <span className="badge text-xs"
                                          style={{
                                            background: ta.importanceLevel === 'Very Important' ? '#ef444420'
                                              : ta.importanceLevel === 'Important' ? '#f59e0b20' : '#6b728020',
                                            color: ta.importanceLevel === 'Very Important' ? '#ef4444'
                                              : ta.importanceLevel === 'Important' ? '#f59e0b' : '#6b7280'
                                          }}>
                                          {ta.importanceLevel}
                                        </span>
                                      )}
                                      <TrendBadge trend={ta.trend || 'stable'} />
                                      <span className="text-xs font-bold text-amber-400">
                                        {ta.importanceScore}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 rounded-full"
                                      style={{ background: 'var(--color-border)' }}>
                                      <div className="h-1.5 rounded-full bg-primary-400"
                                        style={{ width: `${ta.importanceScore}%` }} />
                                    </div>
                                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                      {ta.count}q
                                    </span>
                                  </div>
                                  {ta.likelyComing && (
                                    <p className="text-xs text-emerald-400 mt-1">
                                      ✓ Likely in next exam — {ta.reason}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Repeated Questions */}
                      {pyq.repeatedQuestions?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-red-400">
                            🔁 Repeated Questions — High Chance
                          </h4>
                          <div className="space-y-2">
                            {pyq.repeatedQuestions.map((rq, ri) => (
                              <div key={ri} className="p-3 rounded-xl"
                                style={{ background: '#ef444410', border: '1px solid #ef444430' }}>
                                <p className="text-sm" style={{ color: 'var(--color-text)' }}>{rq.text}</p>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span className="text-xs text-red-400">
                                    Appeared in: {rq.appearedIn?.join(', ')}
                                  </span>
                                  <span className="text-xs text-red-400 font-bold">
                                    {rq.certaintyScore}% certainty
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Extracted Questions */}
                      {pyq.questions?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"
                            style={{ color: 'var(--color-text)' }}>
                            <FileQuestion size={14} className="text-primary-400" /> Extracted Questions
                          </h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {pyq.questions.map((q, qi) => (
                              <div key={qi} className="p-3 rounded-xl text-sm"
                                style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>
                                <div className="flex items-start gap-2">
                                  <span className="font-bold text-primary-400 flex-shrink-0">Q{qi + 1}.</span>
                                  <div>
                                    <p>{q.text}</p>
                                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                      {q.topic && (
                                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                          Topic: {q.topic}
                                        </span>
                                      )}
                                      {q.marks && (
                                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                          {q.marks} marks
                                        </span>
                                      )}
                                      {q.difficulty && (
                                        <span className={`text-xs badge ${
                                          q.difficulty === 'hard' ? 'bg-red-500/10 text-red-400'
                                          : q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400'
                                          : 'bg-amber-500/10 text-amber-400'
                                        }`}>
                                          {q.difficulty}
                                        </span>
                                      )}
                                      {q.isRepeated && (
                                        <span className="text-xs badge bg-red-500/10 text-red-400">
                                          🔁 Repeated
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Predicted Topics */}
                      {pyq.predictedTopics?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-emerald-400">
                            🎯 Predicted for Next Exam
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {pyq.predictedTopics.map((t, ti) => (
                              <span key={ti} className="badge text-xs px-3 py-1.5"
                                style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98130' }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}