import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, StickyNote, Tag, BookOpen } from 'lucide-react';
import { PageHeader } from '../components/common';
import { notesService } from '../services';

const NOTES_DATA = [
  {
    id: 1,
    title: 'Binary Trees Fundamentals',
    category: 'Data Structures',
    difficulty: 'Beginner',
    tags: ['tree', 'binary', 'traversal', 'ds'],
    keywords: ['preorder', 'inorder', 'postorder', 'nodes'],
    url: 'https://www.geeksforgeeks.org/binary-tree-data-structure/'
  },
  {
    id: 2,
    title: 'Graph Representations and Traversal',
    category: 'Data Structures',
    difficulty: 'Intermediate',
    tags: ['graph', 'bfs', 'dfs', 'adjacency'],
    keywords: ['vertices', 'edges', 'queue', 'stack'],
    url: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/'
  },
  {
    id: 3,
    title: 'CPU Scheduling Algorithms',
    category: 'Operating Systems',
    difficulty: 'Intermediate',
    tags: ['os', 'scheduling', 'fcfs', 'rr'],
    keywords: ['cpu', 'turnaround', 'waiting time', 'priority'],
    url: 'https://www.geeksforgeeks.org/cpu-scheduling-in-operating-systems/'
  },
  {
    id: 4,
    title: 'Deadlock Detection and Prevention',
    category: 'Operating Systems',
    difficulty: 'Advanced',
    tags: ['os', 'deadlock', 'bankers', 'resource allocation'],
    keywords: ['mutex', 'hold and wait', 'circular wait', 'safe state'],
    url: 'https://www.geeksforgeeks.org/deadlock-handling-strategies-in-operating-system/'
  },
  {
    id: 5,
    title: 'SQL Joins and Queries',
    category: 'DBMS',
    difficulty: 'Beginner',
    tags: ['sql', 'joins', 'query', 'dbms'],
    keywords: ['inner join', 'left join', 'group by', 'select'],
    url: 'https://www.geeksforgeeks.org/sql-join-set-1-inner-left-right-and-full-joins/'
  },
  {
    id: 6,
    title: 'Database Normalization Notes',
    category: 'DBMS',
    difficulty: 'Intermediate',
    tags: ['normalization', '1nf', '2nf', '3nf'],
    keywords: ['functional dependency', 'schema', 'decomposition'],
    url: 'https://www.geeksforgeeks.org/normal-forms-in-dbms/'
  },
  {
    id: 7,
    title: 'Dijkstra and Shortest Path',
    category: 'Algorithms',
    difficulty: 'Advanced',
    tags: ['graph', 'dijkstra', 'greedy', 'shortest path'],
    keywords: ['priority queue', 'weighted graph', 'optimization'],
    url: 'https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/'
  },
  {
    id: 8,
    title: 'TCP/IP and OSI Layers',
    category: 'Computer Networks',
    difficulty: 'Beginner',
    tags: ['cn', 'tcp/ip', 'osi', 'protocols'],
    keywords: ['network layer', 'transport', 'application layer'],
    url: 'https://www.geeksforgeeks.org/tcp-ip-model/'
  },
  {
    id: 9,
    title: 'Software Testing Essentials',
    category: 'Software Engineering',
    difficulty: 'Intermediate',
    tags: ['testing', 'se', 'unit test', 'integration'],
    keywords: ['verification', 'validation', 'test plan'],
    url: 'https://www.geeksforgeeks.org/software-testing-basics/'
  },
  {
    id: 10,
    title: 'Hashing and Collision Handling',
    category: 'Data Structures',
    difficulty: 'Intermediate',
    tags: ['hashing', 'hash table', 'collision', 'chaining'],
    keywords: ['open addressing', 'load factor', 'rehashing'],
    url: 'https://www.geeksforgeeks.org/hashing-data-structure/'
  }
];

const DIFFICULTY_STYLES = {
  Beginner: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  Intermediate: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  Advanced: 'bg-rose-500/15 text-rose-300 border-rose-400/30'
};

function normalize(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function buildGfgFallbackResults(query) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const encodedQuery = encodeURIComponent(trimmedQuery);
  return [
    {
      id: `gfg-main-${encodedQuery}`,
      title: `GeeksforGeeks results for "${trimmedQuery}"`,
      category: 'Web Search',
      _displayLevel: 'Intermediate',
      _safeTags: ['gfg', 'topic search', 'articles'],
      url: `https://www.geeksforgeeks.org/?s=${encodedQuery}`
    },
    {
      id: `gfg-notes-${encodedQuery}`,
      title: `Top notes and tutorials: ${trimmedQuery}`,
      category: 'Web Search',
      _displayLevel: 'Beginner',
      _safeTags: ['gfg', 'notes', 'quick revision'],
      url: `https://www.google.com/search?q=site%3Ageeksforgeeks.org+${encodedQuery}+notes`
    }
  ];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMatch(text, term) {
  if (!term) return text;

  const safeTerm = escapeRegExp(term.trim());
  if (!safeTerm) return text;

  const parts = text.split(new RegExp(`(${safeTerm})`, 'ig'));
  return parts.map((part, index) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark
        key={`${part}-${index}`}
        className="bg-indigo-400/30 text-indigo-100 px-0.5 rounded"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    )
  );
}

export default function NotesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [webResults, setWebResults] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const indexedNotes = useMemo(
    () =>
      NOTES_DATA.map((note) => {
        const safeTags = Array.isArray(note.tags) ? note.tags : [];
        const level = note.level || note.difficulty || '';

        return {
          ...note,
          _safeTags: safeTags,
          _displayLevel: level,
          _searchIndex: {
            title: normalize(note.title),
            category: normalize(note.category),
            level: normalize(level),
            keywords: (Array.isArray(note.keywords) ? note.keywords : []).map((keyword) => normalize(keyword)),
            tags: safeTags.map((tag) => normalize(tag))
          }
        };
      }),
    []
  );

  const filteredNotes = useMemo(() => {
    const normalizedQuery = normalize(debouncedSearch);
    if (!normalizedQuery) return indexedNotes;

    const queryWords = normalizedQuery.split(' ').filter(Boolean);

    return indexedNotes.filter((note) => {
      const fields = [
        note._searchIndex.title,
        note._searchIndex.category,
        note._searchIndex.level,
        ...note._searchIndex.keywords,
        ...note._searchIndex.tags
      ];

      // Every query word must be found in at least one searchable field.
      return queryWords.every((word) => fields.some((field) => field.includes(word)));
    });
  }, [debouncedSearch, indexedNotes]);

  useEffect(() => {
    let isActive = true;

    const fetchWebResults = async () => {
      const query = debouncedSearch.trim();

      if (!query) {
        setWebResults([]);
        return;
      }

      try {
        const response = await notesService.searchWeb(query);
        if (isActive) {
          setWebResults(Array.isArray(response?.data) ? response.data : []);
        }
      } catch (error) {
        if (isActive) {
          setWebResults([]);
        }
        console.error('[NotesPage Search] Web result fetch failed', error?.message || error);
      }
    };

    fetchWebResults();

    return () => {
      isActive = false;
    };
  }, [debouncedSearch]);

  const resultsToRender = useMemo(() => {
    if (!debouncedSearch.trim()) return filteredNotes;

    const existingUrls = new Set(filteredNotes.map((note) => note.url));
    const remoteUnique = webResults.filter((item) => item?.url && !existingUrls.has(item.url));

    if (remoteUnique.length > 0) {
      return [...filteredNotes, ...remoteUnique.map((item) => ({
        ...item,
        _safeTags: Array.isArray(item.tags) ? item.tags : ['gfg', 'web result'],
        _displayLevel: item.level || item.difficulty || 'Intermediate'
      }))];
    }

    const fallbackResults = buildGfgFallbackResults(debouncedSearch);
    const uniqueFallbacks = fallbackResults.filter((item) => !existingUrls.has(item.url));

    return [...filteredNotes, ...uniqueFallbacks];
  }, [debouncedSearch, filteredNotes, webResults]);

  useEffect(() => {
    console.debug('[NotesPage Search]', {
      input: searchInput,
      debouncedInput: debouncedSearch,
      localResultCount: filteredNotes.length,
      totalRenderedCount: resultsToRender.length,
      renderedResultIds: resultsToRender.map((note) => note.id)
    });
  }, [searchInput, debouncedSearch, filteredNotes, resultsToRender]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Engineering Notes"
        subtitle="Browse notes like a video feed: search, filter, and open instantly"
      />

      <section className="rounded-2xl border border-indigo-400/20 bg-[var(--color-surface)] p-4 sm:p-5">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search title, category, keyword, or tag..."
            className="w-full rounded-xl border border-indigo-400/20 bg-[var(--color-surface-2)] py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
            style={{ color: 'var(--color-text)' }}
          />
        </div>

      </section>

      <AnimatePresence mode="wait">
        {resultsToRender.length > 0 ? (
          <motion.section
            key="notes-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 gap-4 lg:grid-cols-3"
          >
            {resultsToRender.map((note, index) => (
              <motion.article
                key={note.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
                className="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-500/20"
              >
                <div className="relative h-32 bg-gradient-to-br from-indigo-500/25 via-slate-600/20 to-cyan-500/20 p-4">
                  <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_top_right,rgba(255,255,255,0.32),transparent_48%)]" />
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/30 bg-black/25 px-2.5 py-1 text-[11px] font-medium text-indigo-100">
                      <BookOpen size={12} />
                      {note.category}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                        DIFFICULTY_STYLES[note._displayLevel] || DIFFICULTY_STYLES.Intermediate
                      }`}
                    >
                      {note._displayLevel}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <h2 className="line-clamp-2 text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                    {highlightMatch(note.title, debouncedSearch)}
                  </h2>

                  <div className="flex flex-wrap gap-1.5">
                    {note._safeTags.map((tag) => (
                      <span
                        key={`${note.id}-${tag}`}
                        className="inline-flex items-center gap-1 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2 py-0.5 text-[11px] text-indigo-200"
                      >
                        <Tag size={10} />
                        {highlightMatch(tag, debouncedSearch)}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => window.open(note.url, '_blank', 'noopener,noreferrer')}
                    className="w-full rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-400 active:scale-[0.99]"
                  >
                    Open Notes
                  </button>
                </div>
              </motion.article>
            ))}
          </motion.section>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card flex flex-col items-center justify-center rounded-2xl py-16 text-center"
          >
            <div className="mb-4 rounded-2xl bg-indigo-500/15 p-4 text-indigo-300">
              <StickyNote size={28} />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              No results found
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Try a different keyword.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}