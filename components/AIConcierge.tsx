'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Loader2, Sparkles, Bot, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  durationMs?: number
  model?: string
  source?: string
}

export default function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your LUMIÈRE Concierge. I can help you discover the perfect outfit, give styling advice, or guide you through our AI virtual try-on. What can I do for you?",
      timestamp: new Date(),
      model: 'Kimi K2.5',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // Build conversation history for context
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/openclaw/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          agent: 'main',
          history,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.reply,
          timestamp: new Date(),
          durationMs: data.data.durationMs,
          model: data.data.model,
          source: data.data.source,
        }])
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry, something went wrong: ${data.error}`,
          timestamp: new Date(),
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Connection error. Please try again.',
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages])

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-white shadow-xl shadow-accent/30 flex items-center justify-center hover:bg-accent/90 transition-colors z-40"
          >
            <Sparkles size={22} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-6 right-6 w-[400px] h-[540px] bg-white rounded-2xl shadow-2xl border border-foreground/10 flex flex-col overflow-hidden z-50
                max-md:bottom-0 max-md:right-0 max-md:w-full max-md:h-full max-md:rounded-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/10 bg-gradient-to-r from-accent/5 to-transparent">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Sparkles size={14} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">LUMIÈRE Concierge</h3>
                    <p className="text-[10px] text-foreground/40">Powered by OpenClaw · Kimi K2.5</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      msg.role === 'assistant' ? 'bg-accent/10' : 'bg-foreground/10'
                    }`}>
                      {msg.role === 'assistant' ? <Bot size={12} className="text-accent" /> : <User size={12} />}
                    </div>
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block px-3 py-2 rounded-xl text-[13px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-accent text-white rounded-tr-sm'
                          : 'bg-foreground/5 text-foreground rounded-tl-sm'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === 'assistant' && (msg.durationMs || msg.model) && (
                        <div className="flex items-center gap-1.5 mt-0.5 px-1 flex-wrap">
                          {msg.model && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-foreground/5 text-foreground/30 font-mono">{msg.model}</span>
                          )}
                          {msg.durationMs !== undefined && msg.durationMs > 0 && (
                            <span className="text-[9px] text-foreground/25">{(msg.durationMs / 1000).toFixed(1)}s</span>
                          )}
                          {msg.source === 'openclaw' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-mono">OpenClaw</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Bot size={12} className="text-accent" />
                    </div>
                    <div className="bg-foreground/5 rounded-xl rounded-tl-sm px-3 py-2">
                      <Loader2 size={14} className="animate-spin text-accent" />
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                {messages.length <= 2 && !isLoading && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/25 mb-2">Try asking</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'Date outfit', prompt: '推荐一套适合约会的穿搭' },
                        { label: 'New arrivals', prompt: 'Show me the latest arrivals' },
                        { label: 'How try-on works', prompt: '虚拟试穿怎么用？' },
                      ].map((qa, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(qa.prompt)}
                          className="px-3 py-1.5 text-[11px] text-accent border border-accent/20 rounded-full hover:bg-accent/5 hover:border-accent/40 transition-all"
                        >
                          {qa.label}
                        </button>
                      ))}
                      <Link
                        href="/try-on"
                        onClick={() => setIsOpen(false)}
                        className="px-3 py-1.5 text-[11px] text-foreground/50 border border-foreground/10 rounded-full hover:bg-foreground/5 transition-all inline-flex items-center gap-1"
                      >
                        Virtual Studio <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="px-3 py-3 border-t border-foreground/10">
                <div className="flex items-center gap-2 bg-foreground/5 rounded-xl px-3 py-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about products, styling, try-on..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/30"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
