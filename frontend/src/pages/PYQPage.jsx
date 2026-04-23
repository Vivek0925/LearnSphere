import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, ChevronDown, ChevronUp, Bot, MessageSquare, Trash2 } from 'lucide-react';
import { pyqService } from '../services';
import { LoadingSpinner, PageHeader, EmptyState } from '../components/common';

export default function PYQPage() {
  const [pyqs, setPyqs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expandedPyq, setExpandedPyq] = useState(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchPYQs = async () => {
      try {
        const res = await pyqService.getAll();
        setPyqs(res.data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchPYQs();
  }, []);

  const subjectOptions = [...new Set(pyqs.map((p) => p.subject).filter(Boolean))].sort();

  const filtered = filterSubject
    ? pyqs.filter((p) => p.subject === filterSubject)
    : pyqs;

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this analyzed paper?');
    if (!confirmed) return;

    const previous = pyqs;
    setDeletingId(id);
    setPyqs((prev) => prev.filter((p) => p.id !== id));

    try {
      await pyqService.remove(id);
    } catch (error) {
      setPyqs(previous);
      console.error('Delete failed:', error);
      alert('Failed to delete this PYQ. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

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
          {subjectOptions.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
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
              key={pyq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card overflow-hidden"
            >
              {/* Header row */}
              <div
                className="p-4 flex items-start justify-between cursor-pointer hover:bg-[var(--color-surface-2)] transition-colors"
                onClick={() => setExpandedPyq(expandedPyq === pyq.id ? null : pyq.id)}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {pyq.subject}
                    </span>
                    <span className="badge bg-primary-500/10 text-primary-400">
                      {pyq.year}
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
                    {pyq.questions?.length || 0} questions · {pyq.topics?.length || 0} topics identified
                    · {new Date(pyq.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(pyq.id);
                    }}
                    disabled={deletingId === pyq.id}
                    className="p-2 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
                    title="Delete analyzed paper"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                  {expandedPyq === pyq.id
                  ? <ChevronUp size={18} style={{ color: 'var(--color-text-muted)' }} />
                  : <ChevronDown size={18} style={{ color: 'var(--color-text-muted)' }} />
                  }
                </div>
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {expandedPyq === pyq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-[var(--color-border)]"
                  >
                    <div className="p-4 space-y-5">

                      {/* Topics */}
                      {pyq.topics?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2"
                            style={{ color: 'var(--color-text)' }}>
                            <FileQuestion size={14} className="text-primary-400" /> Topics Identified
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {pyq.topics.map((topic, ti) => (
                              <span
                                key={ti}
                                className="badge text-xs px-3 py-1.5"
                                style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                              >
                                {topic}
                              </span>
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
                                  <p>{q}</p>
                                </div>
                              </div>
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