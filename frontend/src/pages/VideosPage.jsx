import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, X, Video as VideoIcon, SkipForward } from 'lucide-react';
import { videoService } from '../services';
import { LoadingSpinner, PageHeader, EmptyState } from '../components/common';

const SUBJECT_COLORS = {
  'Data Structures': '#6366f1', 'Algorithms': '#f59e0b',
  'Operating Systems': '#10b981', 'DBMS': '#3b82f6',
  'Computer Networks': '#ec4899', 'Software Engineering': '#8b5cf6',
};
const diffIcon = { beginner: '🟢', intermediate: '🟡', advanced: '🔴' };

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [selected, setSelected] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  const subjects = ['Data Structures', 'Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks', 'Software Engineering'];

  useEffect(() => {
    const params = subject ? { subject } : {};
    setLoading(true);
    videoService.getAll(params).then(res => setVideos(res.data)).finally(() => setLoading(false));
  }, [subject]);

  const jumpToTimestamp = (seconds) => {
    setCurrentTime(seconds);
    const iframe = document.getElementById('yt-player');
    if (iframe) {
      const src = `https://www.youtube.com/embed/${selected.youtubeId}?start=${seconds}&autoplay=1`;
      iframe.src = src;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Smart Videos" subtitle="Curated video lectures with smart timestamps" />

      {/* Subject Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setSubject('')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!subject ? 'btn-primary' : 'btn-secondary'}`}>
          All
        </button>
        {subjects.map(s => (
          <button key={s} onClick={() => setSubject(subject === s ? '' : s)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all btn-secondary"
            style={subject === s ? { background: `${SUBJECT_COLORS[s]}20`, color: SUBJECT_COLORS[s], borderColor: `${SUBJECT_COLORS[s]}50` } : {}}>
            {s.split(' ')[0]}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner text="Loading videos..." /> : (
        videos.length === 0
          ? <EmptyState icon={VideoIcon} title="No videos found" description="Videos for this subject are coming soon!" />
          : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {videos.map((video, i) => (
                <motion.div key={video._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} whileHover={{ y: -4 }}
                  className="card overflow-hidden cursor-pointer hover:border-primary-400/40 transition-all group"
                  onClick={() => setSelected(video)}>
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    <img src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                      alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                        <Play size={18} className="text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg text-xs font-medium bg-black/70 text-white">
                      {video.duration}
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="text-xs px-2 py-0.5 rounded-lg bg-black/60 text-white">
                        {diffIcon[video.difficulty]} {video.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold mb-1" style={{ color: SUBJECT_COLORS[video.subjectName] }}>
                      {video.subjectName} · {video.topic}
                    </p>
                    <h3 className="font-bold text-sm leading-snug" style={{ color: 'var(--color-text)' }}>{video.title}</h3>
                    <p className="text-xs mt-1.5 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{video.description}</p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
                      <SkipForward size={12} style={{ color: 'var(--color-text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {video.timestamps.length} smart timestamps
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              onClick={e => e.stopPropagation()}
              className="card w-full max-w-4xl overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between p-4 border-b border-[var(--color-border)]">
                <div>
                  <p className="text-xs font-semibold" style={{ color: SUBJECT_COLORS[selected.subjectName] }}>
                    {selected.subjectName} · {selected.topic}
                  </p>
                  <h3 className="font-bold mt-0.5" style={{ color: 'var(--color-text)' }}>{selected.title}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-[var(--color-surface-2)]" style={{ color: 'var(--color-text-muted)' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row">
                {/* Video Player */}
                <div className="flex-1">
                  <div className="aspect-video bg-black">
                    <iframe id="yt-player" width="100%" height="100%"
                      src={`https://www.youtube.com/embed/${selected.youtubeId}?start=${currentTime}`}
                      title={selected.title} frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen />
                  </div>
                </div>

                {/* Timestamps Sidebar */}
                <div className="md:w-64 p-4 border-t md:border-t-0 md:border-l border-[var(--color-border)]">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <SkipForward size={14} className="text-primary-400" /> Smart Timestamps
                  </h4>
                  <div className="space-y-2">
                    {selected.timestamps.map((ts, i) => (
                      <button key={i} onClick={() => jumpToTimestamp(ts.seconds)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[var(--color-surface-2)] transition-all group/ts"
                        style={{ border: '1px solid var(--color-border)' }}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-1.5 py-0.5 rounded font-bold"
                            style={{ background: 'var(--color-surface-2)', color: 'var(--color-primary)' }}>
                            {ts.time}
                          </span>
                          <Play size={10} className="text-primary-400 opacity-0 group-hover/ts:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                        <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>{ts.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
