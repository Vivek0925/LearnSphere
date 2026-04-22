import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowRight, Star, Layers } from "lucide-react";
import { subjectService } from "../services";
import { LoadingSpinner, PageHeader, ProgressBar } from "../components/common";
import { useAuth } from "../context/AuthContext";

const SEM_PDF = {
  3: "/3rd-syllabus.pdf",
  4: "/4_Sem_Syllabus.pdf",
  5: "/5_Sem_Syllabus.pdf", // add when you have it
  6: "/6_Sem_Syllabus.pdf",
  7: "/7_Sem_Syllabus.pdf",
  8: "/8_Sem_Syllabus.pdf",
};

const SEM_COLORS = {
  3: "#6366f1",
  4: "#f59e0b",
  5: "#10b981",
  6: "#ec4899",
  7: "#3b82f6",
  8: "#8b5cf6",
};
const difficultyColor = { easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" };
const SEMS = [3, 4, 5, 6, 7, 8];

export default function SubjectsPage() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSem, setActiveSem] = useState(() => {
    return parseInt(localStorage.getItem("ls_active_sem")) || user?.year
      ? Math.min(Math.max((parseInt(user?.year) || 1) + 2, 3), 8)
      : 3;
  });

  useEffect(() => {
    subjectService
      .getAll()
      .then((res) => setSubjects(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem("ls_active_sem", activeSem);
  }, [activeSem]);

  const bySem = (sem) =>
    subjects.filter(
      (s) =>
        s.semester === sem &&
        s.name.toLowerCase().includes(search.toLowerCase()),
    );

  const filtered = bySem(activeSem);

  if (loading) return <LoadingSpinner text="Loading subjects..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Subjects" subtitle="CSE curriculum — Sem 3 to Sem 8" />

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: "var(--color-text-muted)" }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subjects..."
          className="input-field pl-10"
        />
      </div>

      {/* Sem Tab Bar */}
      <div className="flex gap-2 flex-wrap">
        {SEMS.map((sem) => (
          <button
            key={sem}
            onClick={() => setActiveSem(sem)}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
            style={
              activeSem === sem
                ? {
                    background: `linear-gradient(135deg, ${SEM_COLORS[sem]}, ${SEM_COLORS[sem]}cc)`,
                    color: "#fff",
                    boxShadow: `0 4px 16px ${SEM_COLORS[sem]}40`,
                  }
                : {
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-muted)",
                  }
            }
          >
            Sem {sem}
            <span className="ml-2 text-xs opacity-70">
              ({bySem(sem).length})
            </span>
          </button>
        ))}
      </div>

      {/* Sem label */}
      <div className="flex items-center gap-3">
        <div
          className="w-1 h-6 rounded-full"
          style={{ background: SEM_COLORS[activeSem] }}
        />
        <h2
          className="font-bold text-lg"
          style={{ color: "var(--color-text)" }}
        >
          Semester {activeSem} — {filtered.length} Subjects
        </h2>
      </div>

      {SEM_PDF[activeSem] && (
        <div className="mt-2">
          <a
            href={SEM_PDF[activeSem]}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: `${SEM_COLORS[activeSem]}20`,
              color: SEM_COLORS[activeSem],
            }}
          >
            📄 View Full Semester Syllabus
          </a>
        </div>
      )}

      {/* Subject Grid */}
      {filtered.length === 0 ? (
        <div
          className="text-center py-16"
          style={{ color: "var(--color-text-muted)" }}
        >
          No subjects found for Sem {activeSem}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((subject, i) => (
            <motion.div
              key={subject._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={`/subjects/${subject._id}`}
                className="card p-6 block group hover:border-primary-400/40 transition-all duration-300 h-full"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl text-2xl flex items-center justify-center"
                      style={{ background: `${subject.color}20` }}
                    >
                      {subject.icon}
                    </div>
                    <div>
                      <h3
                        className="font-bold text-sm leading-snug"
                        style={{ color: "var(--color-text)" }}
                      >
                        {subject.name}
                      </h3>
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded-lg mt-0.5 inline-block"
                        style={{
                          background: `${subject.color}20`,
                          color: subject.color,
                        }}
                      >
                        {subject.code}
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="mt-1 opacity-0 group-hover:opacity-100
                    text-primary-400 transition-all group-hover:translate-x-1 flex-shrink-0"
                  />
                </div>

                <p
                  className="text-xs mb-4 line-clamp-2"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {subject.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Layers
                      size={13}
                      style={{ color: "var(--color-text-muted)" }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {subject.topics.length} topics
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star size={13} className="text-amber-400" />
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {Math.max(
                        ...subject.topics.map((t) => t.importanceScore),
                        0,
                      )}{" "}
                      max
                    </span>
                  </div>
                  <span
                    className="badge text-xs ml-auto"
                    style={{
                      background: `${difficultyColor[subject.difficulty]}20`,
                      color: difficultyColor[subject.difficulty],
                    }}
                  >
                    {subject.difficulty}
                  </span>
                </div>

                {/* Top topics */}
                <div className="space-y-2">
                  {subject.topics.slice(0, 3).map((topic) => (
                    <div key={topic.name} className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: subject.color }}
                      />
                      <span
                        className="text-xs flex-1 truncate"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {topic.name}
                      </span>
                      <div className="w-16">
                        <ProgressBar
                          value={topic.importanceScore}
                          color={subject.color}
                          showValue={false}
                          size="sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
