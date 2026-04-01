import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, FileQuestion, StickyNote, Video, TrendingUp } from 'lucide-react';
import { subjectService, progressService } from '../services';
import { LoadingSpinner, ProgressBar, TrendBadge, MasteryBadge } from '../components/common';
import toast from 'react-hot-toast';

export default function SubjectDetailPage() {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [practiceMode, setPracticeMode] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    Promise.all([
      subjectService.getById(id),
      progressService.getBySubject(id).catch(() => ({ data: null }))
    ]).then(([s, p]) => {
      setSubject(s.data);
      setProgress(p.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const getTopicProgress = (topicName) => {
    return progress?.topicsProgress?.find(t => t.topicName === topicName) || { masteryLevel: 0, attempts: 0 };
  };

  const handlePractice = async (topic) => {
    setSelectedTopic(topic);
    setPracticeMode(true);
  };

  const submitPractice = async (correct, total) => {
    try {
      const updated = await progressService.update({ subjectId: id, topicName: selectedTopic.name, correct, total });
      setProgress(updated.data);
      toast.success(`+${Math.round((correct / total) * 10)}% mastery gained!`);
    } catch {
      toast.error('Could not update progress');
    }
    setPracticeMode(false);
    setSelectedTopic(null);
  };

  if (loading) return <LoadingSpinner text="Loading subject..." />;
  if (!subject) return <div className="text-center py-20" style={{ color: 'var(--color-text-muted)' }}>Subject not found</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back */}
      <Link to="/subjects" className="inline-flex items-center gap-2 text-sm hover:text-primary-400 transition-colors"
        style={{ color: 'var(--color-text-muted)' }}>
        <ArrowLeft size={16} /> Back to Subjects
      </Link>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="card p-6 flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl text-3xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${subject.color}20` }}>
          {subject.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{subject.name}</h1>
            <span className="badge text-xs font-mono" style={{ background: `${subject.color}20`, color: subject.color }}>
              {subject.code}
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{subject.description}</p>
          <div className="flex items-center gap-6 mt-3">
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <strong style={{ color: 'var(--color-text)' }}>{subject.topics.length}</strong> topics
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Overall Progress: <strong className="text-primary-500">{progress?.overallProgress || 0}%</strong>
            </span>
          </div>
          <div className="mt-3 max-w-sm">
            <ProgressBar value={progress?.overallProgress || 0} color={subject.color} showValue={false} size="md" />
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link to={`/pyq?subject=${subject._id}`} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
            <FileQuestion size={14} /> PYQs
          </Link>
          <Link to={`/notes?subject=${subject.name}`} className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
            <StickyNote size={14} /> Notes
          </Link>
        </div>
      </motion.div>

      {/* Topics */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>Topics</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {subject.topics.map((topic, i) => {
            const tp = getTopicProgress(topic.name);
            return (
              <motion.div key={topic.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card p-5 hover:border-primary-400/40 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{topic.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <TrendBadge trend={topic.trend} />
                      <MasteryBadge level={tp.masteryLevel} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Importance</p>
                    <p className="text-lg font-bold" style={{ color: subject.color }}>{topic.importanceScore}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <ProgressBar value={tp.masteryLevel} color={subject.color} label="Mastery" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {tp.attempts} attempts · {tp.correct || 0} correct
                  </span>
                  <button onClick={() => handlePractice(topic)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ background: `${subject.color}20`, color: subject.color }}>
                    Practice →
                  </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {topic.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Practice Modal */}
      {practiceMode && selectedTopic && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="card p-8 max-w-sm w-full">
            <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--color-text)' }}>
              Practice: {selectedTopic.name}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              How many questions did you answer correctly?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '5/5 Correct', correct: 5, total: 5 },
                { label: '4/5 Correct', correct: 4, total: 5 },
                { label: '3/5 Correct', correct: 3, total: 5 },
                { label: '2/5 Correct', correct: 2, total: 5 },
              ].map(opt => (
                <button key={opt.label} onClick={() => submitPractice(opt.correct, opt.total)}
                  className="py-3 rounded-xl text-sm font-medium hover:opacity-80 transition-all"
                  style={{ background: `${subject.color}20`, color: subject.color }}>
                  {opt.label}
                </button>
              ))}
            </div>
            <button onClick={() => setPracticeMode(false)}
              className="btn-secondary w-full mt-3 text-sm">Cancel</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
