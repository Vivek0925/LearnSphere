import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User, Loader2, ChevronDown, Check } from 'lucide-react';
import { chatbotService } from '../../services';

const suggestedQueries = [
  'Explain binary search',
  'What topics are most important for exams?',
  'Explain deadlock in OS',
  'What is normalization in DBMS?',
  'Explain OSI model layers',
];

const FREE_MODELS = [
  { key: 'llama-3.1-8b',  label: 'Llama 3.1 8B (Free)' },
  { key: 'llama-3.2-3b',  label: 'Llama 3.2 3B (Free)' },
  { key: 'mistral-7b',    label: 'Mistral 7B (Free)' },
  { key: 'qwen-2.5-7b',   label: 'Qwen 2.5 7B (Free)' },
];

export default function ChatbotWidget() {
  const [open, setOpen]                   = useState(false);
  const [selectedModel, setSelectedModel] = useState(FREE_MODELS[0]);
  const [modelDropOpen, setModelDropOpen] = useState(false);
  const [messages, setMessages]           = useState([
    {
      id: 1,
      role: 'assistant',
      text: "Hi! I'm your AI tutor 🎓 Ask me about any engineering topic, PYQ trends, or notes!",
      time: new Date()
    }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const dropRef               = useRef(null);

  // Toggle via navbar AI Tutor button
  useEffect(() => {
    const handler = () => setOpen(o => !o);
    window.addEventListener('toggleChatbot', handler);
    return () => window.removeEventListener('toggleChatbot', handler);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close model dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setModelDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: msg, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Build history from existing messages (skip the initial greeting id=1)
    const history = messages
      .filter(m => m.id !== 1)
      .map(m => ({ role: m.role, content: m.text }));

    try {
      const res = await chatbotService.sendMessage(
        msg,
        history,
        null,
        { model: selectedModel.key }
      );
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: res.data.response,
        sources: res.data.sources,
        time: new Date()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: "I'm having trouble connecting right now. Please make sure the backend is running.",
        time: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #6f61ff, #8f87ff)',
          boxShadow: '0 8px 32px rgba(111,97,255,0.4)'
        }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} /></motion.div>
            : <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Bot size={22} /></motion.div>
          }
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] h-[540px] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 24px 64px rgba(111,97,255,0.2)',
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center gap-2 border-b border-[var(--color-border)]"
              style={{ background: 'linear-gradient(135deg, rgba(111,97,255,0.15), rgba(143,135,255,0.08))' }}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                <Sparkles size={16} className="text-white" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>LearnSphere AI</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Online · OpenRouter
                </p>
              </div>

              {/* Model dropdown */}
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setModelDropOpen(o => !o)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl transition-all hover:border-primary-400"
                  style={{
                    color: 'var(--color-text-muted)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <span className="max-w-[80px] truncate">
                    {selectedModel.label.split(' (')[0]}
                  </span>
                  <ChevronDown
                    size={11}
                    className={`transition-transform flex-shrink-0 ${modelDropOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {modelDropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-52 rounded-2xl overflow-hidden shadow-2xl z-50"
                      style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <div className="px-3 py-2 border-b border-[var(--color-border)]">
                        <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                          Free Models (OpenRouter)
                        </p>
                      </div>
                      {FREE_MODELS.map(model => (
                        <button
                          key={model.key}
                          onClick={() => { setSelectedModel(model); setModelDropOpen(false); }}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-left hover:bg-primary-500/10 transition-colors"
                          style={{ color: 'var(--color-text)' }}
                        >
                          <span>{model.label}</span>
                          {selectedModel.key === model.key && (
                            <Check size={12} className="text-primary-400 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-2)] flex-shrink-0"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold
                    ${msg.role === 'user'
                      ? 'bg-primary-500'
                      : 'bg-gradient-to-br from-primary-400 to-primary-600'
                    }`}
                  >
                    {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
                  </div>
                  <div
                    className={`max-w-[75%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed
                      ${msg.role === 'user'
                        ? 'bg-primary-500 text-white rounded-tr-sm'
                        : 'rounded-tl-sm'
                      }`}
                    style={msg.role !== 'user' ? {
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)'
                    } : {}}
                  >
                    {msg.text}
                    {msg.sources?.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/20 text-xs opacity-70">
                        {msg.sources.map((s, i) => (
                          <span key={i} className="block">📎 {s.title}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <Bot size={13} className="text-white" />
                  </div>
                  <div
                    className="px-3 py-2.5 rounded-2xl rounded-tl-sm flex items-center gap-2"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  >
                    <Loader2 size={14} className="animate-spin text-primary-400" />
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {selectedModel.label.split(' (')[0]} is thinking...
                    </span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Suggested queries (shown only at start) */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap">
                {suggestedQueries.slice(0, 3).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:border-primary-400 hover:text-primary-400 transition-all"
                    style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input bar */}
            <div className="p-3 border-t border-[var(--color-border)]">
              <div
                className="flex gap-2 items-center p-1 rounded-2xl"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              >
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about any topic..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                  style={{ color: 'var(--color-text)' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-all"
                  style={{ background: 'linear-gradient(135deg, #6f61ff, #8f87ff)' }}
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}