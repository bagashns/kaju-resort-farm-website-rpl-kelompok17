'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Halo, saya **KajuBot**, asisten AI Kaju Resort Farm. Silakan tanyakan hal seputar lokasi, katalog hewan ternak, atau panduan cara pemesanan.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSend = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent) return;

    if (!textToSend) {
      setInput('');
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: messageContent }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi AI.');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Maaf, koneksi terganggu. Silakan coba lagi nanti, atau hubungi [Admin via WhatsApp](https://wa.me/62895349275679) di 0895-3492-75679.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const quickReplies = [
    { label: 'Lokasi Farm', text: 'Di mana lokasi Kaju Resort Farm?' },
    { label: 'Katalog Ternak', text: 'Apa saja hewan ternak yang tersedia?' },
    { label: 'Cara Memesan', text: 'Bagaimana langkah-langkah memesan hewan ternak di sini?' },
    { label: 'WhatsApp Admin', text: 'Minta kontak WhatsApp admin.' },
  ];

  const renderMessageContent = (text: string) => {
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    formattedText = formattedText.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:underline font-semibold">$1</a>'
    );

    return <div dangerouslySetInnerHTML={{ __html: formattedText }} className="whitespace-pre-line text-sm leading-relaxed" />;
  };

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

      {/* Minimalist Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-emerald-800 hover:bg-emerald-950 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 cursor-pointer"
        aria-label="Tanya AI"
      >
        {isOpen ? (
          <i className="fas fa-times text-lg"></i>
        ) : (
          <i className="fas fa-comment-alt text-lg"></i>
        )}
      </button>

      {/* Minimalist Chat Window */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 w-80 max-w-[calc(100vw-2rem)] h-[450px] max-h-[calc(100vh-8rem)] z-50 flex flex-col bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#0b271d] text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <h4 className="font-semibold text-sm">KajuBot</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-3 overflow-y-auto bg-slate-50 space-y-3 custom-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-800 text-white'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex gap-1.5 overflow-x-auto custom-scrollbar">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleSend(reply.text)}
                disabled={isLoading}
                className="whitespace-nowrap bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded px-2.5 py-1 text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {reply.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-2.5 bg-white border-t border-slate-200 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              placeholder="Ketik pertanyaan..."
              className="flex-grow bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-800 transition-colors disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-emerald-800 hover:bg-emerald-950 text-white px-3 py-1.5 rounded text-xs transition-colors cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
            >
              Kirim
            </button>
          </div>
        </div>
      )}
    </>
  );
}
