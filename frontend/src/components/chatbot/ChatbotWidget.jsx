import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User, Loader2 } from 'lucide-react';
import { chatbotService } from '../../services';

const suggestedQueries = [
  'Explain binary search',
  'What topics are most important for exams?',
  'Explain deadlock in OS',
  'What is normalization in DBMS?',
  'Explain OSI model layers',
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'assistant',
      text: "Hi! I'm your AI tutor 🎓 Ask me about any engineering topic, PYQ trends, or notes!",
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const handler = () => setOpen(o => !o);
    window.addEventListener('toggleChatbot', handler);
    return () => window.removeEventListener('toggleChatbot', handler);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg = { id: Date.now(), role: 'user', text: msg, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await chatbotService.sendMessage(msg);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'assistant',
        text: res.data.response,
        sources: res.data.sources,
        time: new Date()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'assistant',
        text: "I'm having trouble connecting right now. Please make sure the backend is running.",
        time: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #6f61ff, #8f87ff)', boxShadow: '0 8px 32px rgba(111,97,255,0.4)' }}
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
            className="fixed bottom-24 right-6 z-50 w-[360px] h-[520px] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 24px 64px rgba(111,97,255,0.2)',
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center gap-3 border-b border-[var(--color-border)]"
              style={{ background: 'linear-gradient(135deg, rgba(111,97,255,0.15), rgba(143,135,255,0.08))' }}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>LearnSphere AI</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Online
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto p-1.5 rounded-lg hover:bg-[var(--color-surface-2)]" style={{ color: 'var(--color-text-muted)' }}>
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
                  <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${msg.role === 'user' ? 'bg-primary-500' : 'bg-gradient-to-br from-primary-400 to-primary-600'}`}>
                    {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
                  </div>
                  <div className={`max-w-[75%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white rounded-tr-sm'
                      : 'rounded-tl-sm'
                  }`}
                    style={msg.role !== 'user' ? { background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' } : {}}>
                    {msg.text}
                    {msg.sources?.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/20 text-xs opacity-70">
                        {msg.sources.map((s, i) => <span key={i} className="block">📎 {s.title}</span>)}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-2 items-center">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <Bot size={13} className="text-white" />
                  </div>
                  <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <Loader2 size={14} className="animate-spin text-primary-400" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap">
                {suggestedQueries.slice(0, 3).map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] hover:border-primary-400 hover:text-primary-400 transition-all"
                    style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}>
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-[var(--color-border)]">
              <div className="flex gap-2 items-center p-1 rounded-2xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
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
