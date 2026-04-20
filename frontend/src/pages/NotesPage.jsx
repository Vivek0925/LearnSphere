import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, StickyNote } from 'lucide-react';
import { notesService } from '../services';
import { LoadingSpinner, PageHeader, EmptyState } from '../components/common';

const SUBJECT_COLORS = {
  'Data Structures': '#6366f1',
  'Algorithms': '#f59e0b',
  'Operating Systems': '#10b981',
  'DBMS': '#3b82f6',
  'Computer Networks': '#ec4899',
  'Software Engineering': '#8b5cf6',
};

// 🔥 EXTRA STATIC LINKS
const extraLinks = [
  {
    subjectName: "Data Structures",
    title: "Graph Algorithms",
    url: "https://www.geeksforgeeks.org/dsa/graph-data-structure-and-algorithms/"
  },
  {
    subjectName: "Data Structures",
    title: "Sorting Algorithms",
    url: "https://www.geeksforgeeks.org/dsa/sorting-algorithms/"
  },
  {
    subjectName: "DBMS",
    title: "SQL Basics",
    url: "https://www.geeksforgeeks.org/sql/what-is-sql/"
  }
];

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = '';

  const subjects = [
    'Data Structures',
    'Algorithms',
    'Operating Systems',
    'DBMS',
    'Computer Networks',
    'Software Engineering'
  ];

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

      <PageHeader
        title="Notes"
        subtitle="Topic-wise structured notes for all subjects"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="input-field pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSubject('')} className="badge px-3 py-1.5">
            All
          </button>

          {subjects.map(s => (
            <button key={s}
              onClick={() => setSubject(subject === s ? '' : s)}
              className="badge px-3 py-1.5 text-xs"
              style={{
                background: subject === s ? `${SUBJECT_COLORS[s]}20` : '#222',
                color: subject === s ? SUBJECT_COLORS[s] : '#aaa'
              }}>
              {s.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <LoadingSpinner text="Loading notes..." />
      ) : (
        notes.length === 0 ? (
          <EmptyState
            icon={StickyNote}
            title="No notes found"
            description="Try different search"
          />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">

            {/* 🔥 DB LINKS */}
            {notes.map((note) => (
              Array.isArray(note.links) && note.links.map((link, i) => {

                let mainTitle = note.subjectName + " Notes";
                let subtitle = link.title;

                if (note.subjectName === "Data Structures") {
                  mainTitle = "DSA Notes";

                  if (link.title.toLowerCase().includes("w3")) {
                    subtitle = "DSA W3 Notes";
                  } else if (link.title.toLowerCase().includes("striver")) {
                    subtitle = "Strivers DSA Sheet";
                  }
                }

                return (
                  <motion.div
                    key={note._id + "-link-" + i}
                    className="card p-5 cursor-pointer hover:scale-[1.03] transition"
                    onClick={() => window.open(link.url, "_blank")}
                  >
                    <h2 className="text-lg font-bold text-white">
                      {mainTitle}
                    </h2>

                    <p className="text-sm mt-1 text-gray-400">
                      {subtitle}
                    </p>

                    <button className="mt-3 px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded w-fit">
                      Open Link
                    </button>
                  </motion.div>
                );
              })
            ))}

            {/* 🔥 EXTRA LINKS (NO DSA NOTES) */}
            {extraLinks
              .filter(extra =>
                !notes.some(note =>
                  note.links?.some(l => l.url === extra.url)
                )
              )
              .map((link, i) => (
                <motion.div
                  key={"extra-" + i}
                  className="card p-5 cursor-pointer hover:scale-[1.03] transition"
                  onClick={() => window.open(link.url, "_blank")}
                >
                  {/* ✅ DIRECT TITLE */}
                  <h2 className="text-lg font-bold text-white">
                    {link.title}
                  </h2>

                  <p className="text-sm mt-1 text-gray-400">
                    {link.subjectName}
                  </p>

                  <button className="mt-3 px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded w-fit">
                    Open Link
                  </button>
                </motion.div>
              ))}

          </div>
        )
      )}

    </div>
  );
}