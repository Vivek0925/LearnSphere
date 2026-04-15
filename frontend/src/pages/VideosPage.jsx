import React, { useState, useEffect } from 'react';
import { Play, X, SkipForward, Search } from 'lucide-react';

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
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">📚 Smart Study Videos</h1>

      {/* 🔍 SEARCH BAR */}
      <div className="flex gap-2">
        <div className="flex items-center border rounded-xl px-3 flex-1">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search Binary Tree, OS Scheduling..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchVideos()}
            className="w-full p-2 outline-none bg-transparent"
          />
        </div>

        <button
          onClick={fetchVideos}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl"
        >
          Search
        </button>
      </div>

      {/* SUBJECT FILTER */}
      <div className="flex gap-2 flex-wrap">
        {subjects.map(s => (
          <button
            key={s}
            onClick={() => setSubject(s)}
            className={`px-3 py-1 rounded-xl ${
              subject === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* FOCUS MODE */}
      <button
        onClick={() => setFocusMode(!focusMode)}
        className="px-4 py-2 bg-black text-white rounded-xl"
      >
        {focusMode ? "Exit Focus Mode" : "Focus Mode"}
      </button>

      {/* VIDEOS GRID */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {videos.map(v => (
          <div
            key={v._id}
            onClick={() => setSelected(v)}
            className="cursor-pointer border rounded-xl overflow-hidden hover:shadow-lg"
          >
            <div className="relative">
              <img
                src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                className="w-full"
              />
              <span className="absolute bottom-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                {v.duration}
              </span>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm">{v.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* VIDEO MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl p-4">
            <button onClick={() => setSelected(null)}>
              <X />
            </button>

            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${selected.youtubeId}?rel=0&modestbranding=1`}
              allowFullScreen
            />

            {!focusMode && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">Timestamps</h3>
                {selected.timestamps.map((t, i) => (
                  <button key={i} className="block">
                    {t.time} - {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}