import React, { useState, useEffect } from 'react';
import { Play, X, SkipForward, Search, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [subject, setSubject] = useState('Data Structures');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [focusMode, setFocusMode] = useState(false);

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
    const res = await fetch(
      `http://localhost:5000/api/videos?subject=${subject}&topic=${search}`
    );
    const data = await res.json();
    setVideos(data);
  };

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          📚 Smart Study Videos
        </h1>
        <p className="text-gray-400 mt-2">Curated educational content for every subject</p>
      </motion.div>

      {/* 🔍 SEARCH BAR */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-3">
        <div
          className="flex items-center gap-3 flex-1 px-4 py-3 rounded-2xl backdrop-blur-sm transition-all hover:border-blue-400/50"
          style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            color: 'var(--color-text-muted)'
          }}
        >
          <Search size={18} />
          <input
            type="text"
            placeholder="Search Binary Tree, OS Scheduling..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchVideos()}
            className="w-full outline-none bg-transparent text-sm"
            style={{ color: 'var(--color-text)' }}
          />
        </div>

        <button
          onClick={fetchVideos}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          Search
        </button>
      </motion.div>

      {/* SUBJECT FILTER */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex gap-3 flex-wrap">
        {subjects.map((s, idx) => (
          <button
            key={s}
            onClick={() => setSubject(s)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              subject === s
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-gray-100'
            }`}
          >
            {s}
          </button>
        ))}
      </motion.div>

      {/* FOCUS MODE */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <button
          onClick={() => setFocusMode(!focusMode)}
          className={`px-6 py-3 rounded-xl font-medium transition-all ${
            focusMode
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          {focusMode ? "Exit Focus Mode 🎯" : "Focus Mode 🎯"}
        </button>
      </motion.div>

      {/* VIDEOS GRID */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {videos.map((v, idx) => (
          <motion.div
            key={v._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelected(v)}
            className="cursor-pointer group rounded-2xl overflow-hidden transition-all"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="relative overflow-hidden h-48">
              <img
                src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {/* Play Icon Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <div className="scale-0 group-hover:scale-100 transition-transform duration-300 bg-blue-600 rounded-full p-3">
                  <Play size={24} className="text-white fill-white" />
                </div>
              </div>
              {/* Duration Badge */}
              <span
                className="absolute bottom-3 right-3 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 bg-black/60 text-white"
              >
                <Clock size={12} /> {v.duration}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-sm line-clamp-2" style={{ color: 'var(--color-text)' }}>
                {v.title}
              </h3>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                {v.topic}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* VIDEO MODAL */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 z-50"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Close Button */}
            <div
              className="flex justify-between items-center p-6 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-xl font-bold line-clamp-1" style={{ color: 'var(--color-text)' }}>
                {selected.title}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg hover:bg-red-500/20 transition-all hover:text-red-500"
                style={{ color: 'var(--color-text)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Video Player */}
            <div className="w-full bg-black">
              <iframe
                width="100%"
                height="500"
                src={`https://www.youtube.com/embed/${selected.youtubeId}?rel=0&modestbranding=1`}
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Timestamps Section */}
            {!focusMode && (
              <div
                className="p-6 border-t"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <h3 className="font-bold mb-4 text-lg" style={{ color: 'var(--color-text)' }}>
                  ⏱️ Timestamps
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {selected.timestamps?.map((t, i) => (
                    <button
                      key={i}
                      className="p-3 rounded-lg text-left transition-all hover:bg-blue-600/20"
                      style={{
                        background: 'var(--color-surface-2)',
                        color: 'var(--color-text)'
                      }}
                    >
                      <div className="font-semibold text-blue-400">{t.time}</div>
                      <div className="text-sm opacity-80">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}