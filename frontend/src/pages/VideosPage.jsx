import React, { useState, useEffect } from 'react';
import { Play, X, Search, Clock, Video, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { LoadingSpinner, PageHeader, EmptyState } from '../components/common';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [subject, setSubject] = useState('Data Structures');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const subjects = [
    'Data Structures',
    'Algorithms',
    'Operating Systems',
    'DBMS',
    'Computer Networks',
    'Software Engineering'
  ];

  useEffect(() => {
    fetchVideos();
  }, [subject]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/videos?subject=${subject}&topic=${search}`
      );
      const data = await res.json();
      setVideos(Array.isArray(data) ? data : []);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading Smart Videos..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Smart Study Videos"
        subtitle="Curated educational content for every subject"
        action={
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              focusMode
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'btn-secondary'
            }`}
          >
            {focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
          </button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3 p-4 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(111,97,255,0.1), rgba(143,135,255,0.06))',
          border: '1px solid rgba(111,97,255,0.25)'
        }}
      >
        <Sparkles size={18} className="text-primary-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
            Smarter Video Discovery
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Search by topic, switch subject chips, then open any card to watch with generated chapter timestamps.
          </p>
        </div>
      </motion.div>

      {/* 🔍 SEARCH BAR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-3"
      >
        <div
          className="flex items-center gap-3 flex-1 input-field py-0"
        >
          <Search size={18} />
          <input
            type="text"
            placeholder="Search Binary Tree, OS Scheduling..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchVideos()}
            className="w-full py-3 outline-none bg-transparent text-sm"
            style={{ color: 'var(--color-text)', border: 'none' }}
          />
        </div>

        <button
          onClick={fetchVideos}
          className="btn-primary text-sm py-3 px-6"
        >
          Search
        </button>
      </motion.div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
          Recommended Videos
          <span className="text-sm font-normal ml-2" style={{ color: 'var(--color-text-muted)' }}>
            ({videos.length})
          </span>
        </h3>

        <div className="flex gap-2 flex-wrap">
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                subject === s
                  ? 'btn-primary !py-1.5 !px-3'
                  : 'btn-secondary !py-1.5 !px-3'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* VIDEOS GRID */}
      {videos.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No videos found"
          description="Try another keyword or switch to a different subject."
          action={
            <button onClick={fetchVideos} className="btn-primary text-sm py-2.5 px-5">
              Refresh Results
            </button>
          }
        />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {videos.map((v, idx) => (
            <motion.div
              key={v._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => setSelected(v)}
              className="card overflow-hidden cursor-pointer group"
            >
              <div className="relative overflow-hidden h-52 border-b border-[var(--color-border)]">
                <img
                  src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/35 transition-all flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-primary-500/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={22} className="text-white fill-white ml-0.5" />
                  </div>
                </div>

                <span className="absolute bottom-3 right-3 badge bg-black/65 text-white text-xs flex items-center gap-1">
                  <Clock size={11} /> {v.duration}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-base line-clamp-2" style={{ color: 'var(--color-text)' }}>
                  {v.title}
                </h3>

                <div className="flex items-center justify-between">
                  <span className="badge text-xs" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                    {v.topic || subject}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {v.difficulty || 'intermediate'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* VIDEO MODAL */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 w-screen h-screen bg-transparent flex justify-center items-center p-2 md:p-6 z-[999]"
          style={{ isolation: 'isolate' }}
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-[95vw] md:w-[60vw] h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Close Button */}
            <div
              className="flex justify-between items-center px-6 md:px-8 py-4 flex-shrink-0 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-lg md:text-2xl font-bold line-clamp-2 flex-1" style={{ color: 'var(--color-text)' }}>
                {selected.title}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-red-500/20 transition-all hover:text-red-500 flex-shrink-0 ml-4"
                style={{ color: 'var(--color-text)' }}
              >
                <X size={28} />
              </button>
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {/* Video Player - Full Width */}
              <div className="w-full bg-gradient-to-b from-slate-950 via-black to-slate-900 aspect-video md:aspect-auto md:h-[40vh]">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selected.youtubeId}?rel=0&modestbranding=1&autoplay=1`}
                  allowFullScreen
                  className="w-full h-full"
                  style={{ border: 'none' }}
                />
              </div>

              {/* Timestamps Section */}
              {!focusMode && (
                <div
                  className="px-6 md:px-8 py-8 border-t"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <h3 className="font-bold mb-6 text-xl flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <span className="text-2xl">⏱️</span> Timestamps
                  </h3>
                  {selected.timestamps?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selected.timestamps.map((t, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="p-4 rounded-xl text-left transition-all hover:border-blue-500/50 group"
                          style={{
                            background: 'var(--color-surface-2)',
                            color: 'var(--color-text)',
                            border: '1.5px solid var(--color-border)'
                          }}
                        >
                          <div className="font-bold text-lg text-blue-400 group-hover:text-blue-300 transition-colors">
                            {t.time}
                          </div>
                          <div className="text-sm opacity-80 mt-1">{t.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="p-4 rounded-xl text-sm"
                      style={{
                        background: 'var(--color-surface-2)',
                        color: 'var(--color-text-muted)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      No chapter timestamps were found in this video description.
                    </div>
                  )}
                </div>
              )}

              {/* Video Info Section */}
              <div className="px-6 md:px-8 py-8 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="font-bold mb-3 text-lg" style={{ color: 'var(--color-text)' }}>
                  📝 About
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div className="px-4 py-2 rounded-lg" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                    <span className="text-xs opacity-70">Duration</span>
                    <div className="font-semibold text-blue-400">{selected.duration}</div>
                  </div>
                  <div className="px-4 py-2 rounded-lg" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                    <span className="text-xs opacity-70">Topic</span>
                    <div className="font-semibold text-purple-400">{selected.topic}</div>
                  </div>
                  <div className="px-4 py-2 rounded-lg" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                    <span className="text-xs opacity-70">Difficulty</span>
                    <div className="font-semibold text-yellow-400">{selected.difficulty}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}