'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from 'framer-motion';
import styles from './chat.module.css';
import { CHAT_ENDPOINT } from '@/lib/chat';
import { Send, Sparkles } from "lucide-react";

const POPULAR_QUESTIONS = [
  "What is a Class Committee?",
  "What is the attendance requirement at NIT Trichy ?",
  "What is the assessment pattern ?",
];

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  isTyping?: boolean;
  status?: string;
  isStreaming?: boolean;
  thoughts?: string;
  isThinking?: boolean;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);

  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
  }, []);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    if (status !== 'authenticated' || !session?.backendToken) {
      console.error("User not authenticated");
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      role: 'bot',
      content: '',
      isTyping: false,
      isStreaming: true,
      thoughts: ''
    }]);

    try {
      const response = await fetch(`${CHAT_ENDPOINT}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.backendToken}`
        },
        body: JSON.stringify({
          message: textToSend,
          session_id: sessionId
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);

            if (data.type === 'status') {
              setMessages(prev => prev.map(msg =>
                msg.id === botMsgId
                  ? { ...msg, status: data.content }
                  : msg
              ));
            } else if (data.type === 'thought_chunk') {
              setMessages(prev => prev.map(msg =>
                msg.id === botMsgId
                  ? {
                    ...msg,
                    thoughts: (msg.thoughts || '') + data.content,
                    isThinking: true
                  }
                  : msg
              ));
            } else if (data.type === 'text_chunk') {
              // Append chunk to content
              setMessages(prev => prev.map(msg =>
                msg.id === botMsgId
                  ? {
                    ...msg,
                    content: (msg.content || '') + data.content,
                    status: undefined,
                    isThinking: false
                  }
                  : msg
              ));
            } else if (data.type === 'text') {
              // Legacy/Full text replacement (fallback)
              setMessages(prev => prev.map(msg =>
                msg.id === botMsgId
                  ? { ...msg, content: data.content, status: undefined, isThinking: false }
                  : msg
              ));
            } else if (data.type === 'error') {
              setMessages(prev => prev.map(msg =>
                msg.id === botMsgId
                  ? { ...msg, content: `Error: ${data.content}` }
                  : msg
              ));
            }
          } catch (e) {
            console.error("Error parsing stream line:", line, e);
          }
        }
      }

      // Stream finished
      setMessages(prev => prev.map(msg =>
        msg.id === botMsgId
          ? { ...msg, isStreaming: false, isThinking: false }
          : msg
      ));

    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => prev.map(msg =>
        msg.id === botMsgId
          ? { ...msg, content: "Sorry, connection failed.", isStreaming: false }
          : msg
      ));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-xl font-medium text-gray-600 animate-pulse">Loading WikiNITT Chat...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Welcome to WikiNITT Chat</h1>
          <p className="text-gray-600 mb-6">Please sign in to start chatting regarding NITT.</p>
          <button
            onClick={() => signIn("google")}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Background Mesh */}
      <div className={styles.backgroundWrapper}>
        <div className={styles.blobBlue}></div>
        <div className={styles.blobIndigo}></div>
        <div className={styles.noiseOverlay}></div>
      </div>

      {/* Main Chat Area */}
      <div className={styles.main}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.brand}>
            <Link href="/" className="hover:opacity-80 transition-opacity flex items-center">
              <img src="/logo.png" alt="WikiNITT" className="h-10 w-10 object-contain" />
            </Link>
          </div>
          <div className={styles.navLinks}>
            <Link href="/">Home</Link>
            <Link href="/map">Map</Link>
            <Link href="/articles">Articles</Link>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.hamburger}
              aria-label="Toggle navigation"
              onClick={() => setMobileMenuOpen((p) => !p)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/map" onClick={() => setMobileMenuOpen(false)}>Map</Link>
            <Link href="/articles" onClick={() => setMobileMenuOpen(false)}>Articles</Link>
          </div>
        )}

        <div className={styles.chatScrollArea}>
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={styles.emptyStateContainer}
                key="empty"
              >
                <div className={styles.heroSparkles}>✦ ✦</div>
                <h1 className={styles.welcomeHeadline}>Ask WikiBot anything</h1>
                <p className={styles.welcomeSub}>Quick answers about NIT Trichy, academics, hostels, clubs, policies, and more.</p>

                {/* MOST POPULAR QUESTIONS GRID */}
                <div className={styles.suggestionsGrid}>
                  {POPULAR_QUESTIONS.map((q, i) => (
                    <button key={i} className={styles.suggestionCard} onClick={() => handleSend(q)}>
                      <span className={styles.cardText}>{q}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div key="chat">
                {messages.map((msg) => (
                  <div key={msg.id} className={`${styles.messageRow} ${msg.role === 'bot' ? styles.botRow : ''}`}>
                    <div className={`${styles.messageContent} ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'bot' && (
                        <div className={`${styles.avatar} ${styles.botAvatar}`}>AI</div>
                      )}

                      <div className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.botBubble}`}>

                        {/* Thinking Block */}
                        {msg.thoughts && (
                          <div className={styles.thinkingBlock}>
                            <div className={styles.thinkingHeader}>
                              <Sparkles />
                              <span>Thinking Process</span>
                              {msg.isThinking && <span className={styles.pulsingDot}></span>}
                            </div>
                            <div className={styles.thinkingContent}>
                              {msg.thoughts}
                            </div>
                          </div>
                        )}

                        {msg.isTyping ? (
                          <Typewriter
                            text={msg.content}
                            onComplete={() => {
                              setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isTyping: false } : m));
                            }}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap relative">
                            {msg.content}
                            {msg.isStreaming && !msg.isThinking && (
                              <span className={styles.cursor}></span>
                            )}
                            {msg.status && (
                              <div className="mt-2 text-xs text-indigo-200 italic flex items-center gap-1">
                                <Sparkles /> {msg.status}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {msg.role === 'user' && (
                        <div className={`${styles.avatar} ${styles.userAvatar}`}>You</div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} style={{ height: '1px' }} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className={styles.inputContainer}>
          <div className={styles.inputBoxWrapper}>
            <textarea
              className={styles.textarea}
              placeholder="Ask anything..."
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className={`${styles.sendButton} ${input.trim() ? styles.active : ''}`}
              onClick={() => handleSend()}
            >
              <Send />
            </button>
          </div>
          <div className={styles.disclaimer}>
            AI can make mistakes. Verify important info.
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---
const Typewriter = ({ text, onComplete }: { text: string, onComplete: () => void }) => {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplay(text.substring(0, i + 1));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        onComplete();
      }
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {display}
      <span className={styles.cursor}></span>
    </span>
  );
};
