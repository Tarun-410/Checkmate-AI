'use client';

import { useRef, useEffect, useState } from 'react';
import { useCoaching } from '@/hooks/useCoaching';
import { Brain, Send, Loader2, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CoachingMessage } from '@/types';

// Suggested questions shown when chat is empty
const SUGGESTED_QUESTIONS = [
  'Why was my last blunder so bad?',
  'What should I improve most?',
  'What opening suits my style?',
  'Explain the tactical theme I missed',
  'How can I avoid these mistakes?',
];

export function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let currentListType: 'ul' | 'ol' | null = null;

  const flushList = (key: number) => {
    if (currentListType === 'ul') {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-1.5 space-y-1 text-[#e2e8f0]">
          {currentList}
        </ul>
      );
    } else if (currentListType === 'ol') {
      elements.push(
        <ol key={`list-${key}`} className="list-decimal pl-5 my-1.5 space-y-1 text-[#e2e8f0]">
          {currentList}
        </ol>
      );
    }
    currentList = [];
    currentListType = null;
  };

  const parseInline = (text: string): React.ReactNode[] => {
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-extrabold text-[#ffffff]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={idx} className="italic text-[#06b6d4] font-medium">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-[#c084fc] font-mono text-xs font-bold whitespace-nowrap">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList(index);
      elements.push(
        <h4 key={index} className="text-xs font-bold text-[#38bdf8] uppercase tracking-wider mt-4 mb-1 flex items-center gap-1.5">
          {parseInline(trimmed.slice(4))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList(index);
      elements.push(
        <h3 key={index} className="text-sm font-bold text-[#f1f5f9] mt-4 mb-1.5 flex items-center gap-1.5">
          {parseInline(trimmed.slice(3))}
        </h3>
      );
      return;
    }

    // Unordered lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (currentListType && currentListType !== 'ul') {
        flushList(index);
      }
      currentListType = 'ul';
      currentList.push(
        <li key={`li-${index}`} className="leading-relaxed text-[#e2e8f0] text-xs">
          {parseInline(trimmed.slice(2))}
        </li>
      );
      return;
    }

    // Ordered lists
    const matchNumbered = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (matchNumbered) {
      if (currentListType && currentListType !== 'ol') {
        flushList(index);
      }
      currentListType = 'ol';
      currentList.push(
        <li key={`li-${index}`} className="leading-relaxed text-[#e2e8f0] text-xs">
          {parseInline(matchNumbered[2])}
        </li>
      );
      return;
    }

    // Empty line
    if (!trimmed) {
      flushList(index);
      return;
    }

    // Blockquotes
    if (trimmed.startsWith('> ')) {
      flushList(index);
      elements.push(
        <blockquote key={index} className="pl-3 border-l-2 border-[#a855f7] text-[#94a3b8] italic my-2 py-0.5 text-xs bg-[rgba(124,58,237,0.03)] rounded-r pr-2">
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Regular line
    flushList(index);
    elements.push(
      <p key={index} className="mb-2 last:mb-0 text-[#e2e8f0] leading-relaxed text-xs">
        {parseInline(line)}
      </p>
    );
  });

  flushList(lines.length);

  return <div className="space-y-1">{elements}</div>;
}

interface MessageBubbleProps {
  message: CoachingMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isUser
            ? 'bg-[rgba(124,58,237,0.2)] border border-[rgba(124,58,237,0.3)]'
            : 'bg-[rgba(6,182,212,0.15)] border border-[rgba(6,182,212,0.25)]'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-[#a855f7]" />
        ) : (
          <Brain className="w-3.5 h-3.5 text-[#06b6d4]" />
        )}
      </div>

      {/* Message content */}
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'rounded-tr-sm bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.2)] text-[#f1f5f9]'
            : 'rounded-tl-sm bg-[rgba(15,15,26,0.8)] border border-[rgba(148,163,184,0.08)] text-[#e2e8f0]'
        }`}
      >
        {isUser ? (
          message.content
        ) : message.content ? (
          <MarkdownRenderer content={message.content} />
        ) : (
          <span className="flex items-center gap-1.5 text-[#475569]">
            <Loader2 className="w-3 h-3 animate-spin" />
            Thinking...
          </span>
        )}
      </div>
    </motion.div>
  );
}

interface CoachingChatProps {
  playerRating?: number;
}

export function CoachingChat({ playerRating }: CoachingChatProps) {
  const { sendMessage, isStreaming, coachMessages } = useCoaching();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [coachMessages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput('');
    await sendMessage(text, playerRating);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[rgba(148,163,184,0.08)]">
        <div className="w-7 h-7 rounded-lg bg-[rgba(6,182,212,0.15)] border border-[rgba(6,182,212,0.25)] flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-[#06b6d4]" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#f1f5f9]">AI Coach</h3>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[10px] text-[#475569]">
              {isStreaming ? 'Thinking...' : 'Ready to help'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {coachMessages.length === 0 ? (
          /* Welcome state */
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.2)] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-[#06b6d4]" />
            </div>
            <p className="text-sm font-semibold text-[#f1f5f9] mb-1">
              Your AI Chess Coach
            </p>
            <p className="text-xs text-[#475569] mb-6 leading-relaxed max-w-[220px] mx-auto">
              Ask me anything about your game, mistakes, or how to improve.
            </p>

            {/* Suggested questions */}
            <div className="space-y-2 text-left">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg border border-[rgba(148,163,184,0.08)] bg-[rgba(15,15,26,0.6)] text-xs text-[#94a3b8] hover:bg-[rgba(124,58,237,0.06)] hover:border-[rgba(124,58,237,0.2)] hover:text-[#f1f5f9] transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {coachMessages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-[rgba(148,163,184,0.08)]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach anything..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 resize-none bg-[rgba(8,8,16,0.8)] border border-[rgba(148,163,184,0.1)] rounded-xl px-3.5 py-2.5 text-sm text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[rgba(124,58,237,0.4)] focus:ring-1 focus:ring-[rgba(124,58,237,0.2)] transition-all max-h-28 overflow-y-auto"
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:from-[#8b5cf6] hover:to-[#7c3aed] transition-all shadow-[0_2px_12px_rgba(124,58,237,0.3)] hover:shadow-[0_4px_20px_rgba(124,58,237,0.4)]"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-[#334155] mt-2 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
