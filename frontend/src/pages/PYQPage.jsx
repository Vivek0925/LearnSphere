import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileQuestion, BarChart2, TrendingUp, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { pyqService, subjectService } from '../services';
import { LoadingSpinner, PageHeader, TrendBadge, EmptyState } from '../components/common';
import toast from 'react-hot-toast';

export default function PYQPage() {
  const [subjects, setSubjects] = useState([]);
  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examYear, setExamYear] = useState(new Date().getFullYear().toString());
  const [examType, setExamType] = useState('endterm');
  const [expandedPyq, setExpandedPyq] = useState(null);
  const [filterSubject, setFilterSubject] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    Promise.all([subjectService.getAll(), pyqService.getAll()])
      .then(([s, p]) => { setSubjects(s.data); setPyqs(p.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async () => {
    if (!selectedSubject) return toast.error('Please select a subject');
    setUploading(true);
    const formData = new FormData();
    formData.append('subjectId', selectedSubject);
    formData.append('examYear', examYear);
    formData.append('examType', examType);
    if (fileRef.current?.files[0]) formData.append('pdf', fileRef.current.files[0]);
    try {
      const res = await pyqService.upload(formData);
      setPyqs(prev => [res.data.pyq, ...prev]);
      toast.success('PYQ uploaded and analyzed!');
      setSelectedSubject('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const filtered = filterSubject ? pyqs.filter(p => p.subjectName === filterSubject) : pyqs;

  if (loading) return <LoadingSpinner text="Loading PYQs..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="PYQ Analysis" subtitle="Upload and analyze previous year question papers" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Upload size={18} className="text-primary-400" /> Upload PYQ
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Subject *</label>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="input-field">
                <option value="">Select subject...</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Year</label>
                <select value={examYear} onChange={e => setExamYear(e.target.value)} className="input-field">
                  {[2024, 2023, 2022, 2021, 2020].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Type</label>
                <select value={examType} onChange={e => setExamType(e.target.value)} className="input-field">
                  <option value="endterm">End Term</option>
                  <option value="midterm">Mid Term</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>PDF File (optional)</label>
              <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-4 text-center hover:border-primary-400 transition-colors cursor-pointer"
                onClick={() => fileRef.current?.click()}>
                <Upload size={20} className="mx-auto mb-2 text-primary-400" />
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Click to upload PDF or drop here</p>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" />
              </div>
            </div>
            <button onClick={handleUpload} disabled={uploading || !selectedSubject} className="btn-primary w-full flex items-center justify-center gap-2">
              {uploading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Upload size={16} /> Upload & Analyze</>}
            </button>
          </div>
        </motion.div>

        {/* PYQs List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
              All PYQs <span className="text-sm font-normal ml-2" style={{ color: 'var(--color-text-muted)' }}>({filtered.length})</span>
            </h3>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="input-field w-48 text-sm py-2">
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={FileQuestion} title="No PYQs yet" description="Upload your first PYQ to get AI-powered topic analysis" />
          ) : (
            <div className="space-y-4">
              {filtered.map((pyq, i) => (
                <motion.div key={pyq._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }} className="card overflow-hidden">
                  {/* Header */}
                  <div className="p-4 flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedPyq(expandedPyq === pyq._id ? null : pyq._id)}>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{pyq.subjectName}</span>
                        <span className="badge bg-primary-500/10 text-primary-400">{pyq.examYear}</span>
                        <span className="badge" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                          {pyq.examType}
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {pyq.questions.length} questions extracted · {pyq.topicAnalysis.length} topics identified
                      </p>
                    </div>
                    {expandedPyq === pyq._id ? <ChevronUp size={18} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={18} style={{ color: 'var(--color-text-muted)' }} />}
                  </div>

                  <AnimatePresence>
                    {expandedPyq === pyq._id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[var(--color-border)]">
                        <div className="p-4 space-y-4">
                          {/* Topic Analysis */}
                          <div>
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                              <BarChart2 size={14} className="text-primary-400" /> Topic Analysis
                            </h4>
                            <div className="space-y-2">
                              {pyq.topicAnalysis.map(ta => (
                                <div key={ta.topic} className="flex items-center gap-3 p-2.5 rounded-xl"
                                  style={{ background: 'var(--color-surface-2)' }}>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{ta.topic}</span>
                                      <div className="flex items-center gap-2">
                                        <TrendBadge trend={ta.trend} />
                                        <span className="text-xs font-bold text-amber-400">{ta.importanceScore}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--color-border)' }}>
                                        <div className="h-1.5 rounded-full bg-primary-400"
                                          style={{ width: `${ta.importanceScore}%` }} />
                                      </div>
                                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{ta.count}q</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Questions */}
                          <div>
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                              <FileQuestion size={14} className="text-primary-400" /> Extracted Questions
                            </h4>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {pyq.questions.map((q, qi) => (
                                <div key={qi} className="p-3 rounded-xl text-sm"
                                  style={{ background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>
                                  <div className="flex items-start gap-2">
                                    <span className="font-bold text-primary-400 flex-shrink-0">Q{qi + 1}.</span>
                                    <div>
                                      <p>{q.text}</p>
                                      <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Topic: {q.topic}</span>
                                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{q.marks} marks</span>
                                        <span className={`text-xs badge ${q.difficulty === 'hard' ? 'bg-red-500/10 text-red-400' : q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                          {q.difficulty}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
