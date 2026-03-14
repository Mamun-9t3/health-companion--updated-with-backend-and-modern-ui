"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Lucide from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

type Message = {
  id?: string;
  role: 'user' | 'ai' | 'model';
  content: string;
  isEmergency?: boolean;
};

type Session = {
  id: string;
  title: string;
  createdAt: string;
  _count?: { messages: number };
};

export default function ChatbotPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/chat/sessions');
      setSessions(res.data);
    } catch (err) {
      toast.error('Failed to load chat history');
    }
  };

  const loadSession = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/chat/sessions/${id}`);
      setMessages(res.data.messages || []);
      setActiveSessionId(id);
      setIsSidebarOpen(false);
    } catch (err) {
      toast.error('Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const payload: any = { message: userMessage };
      if (activeSessionId) payload.sessionId = activeSessionId;

      const res = await api.post('/chat/message', payload);
      
      const { sessionId, reply, isEmergency } = res.data;
      
      if (!activeSessionId) {
        setActiveSessionId(sessionId);
        fetchSessions(); // refresh sidebar to show new session
      }

      setMessages([...newMessages, { role: 'ai', content: reply, isEmergency }]);
      
    } catch (err) {
      toast.error('Failed to send message');
      // Rollback optimistic update
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#f5f7fa] h-[calc(100vh-70px)] overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Gemini-style) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[#f8fafc] border-r border-[#e2e8f0] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full`}>
         <div className="p-4">
            <button 
              onClick={startNewChat}
              className="w-full flex items-center gap-3 bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#334155] py-3 pl-4 rounded-[16px] font-semibold transition-colors shadow-sm"
            >
              <span className="text-xl leading-none">+</span> New chat
            </button>
         </div>
         
         <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
            <div className="text-[13px] font-bold text-[#64748b] px-3 py-3">
              Recent
            </div>
            {sessions.length === 0 ? (
              <p className="text-sm text-[#94a3b8] px-3 py-2 italic">No previous chats</p>
            ) : (
              sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => loadSession(session.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeSessionId === session.id ? 'bg-[#e2e8f0] text-[#1e293b] font-medium' : 'hover:bg-[#f1f5f9] text-[#475569]'}`}
                >
                  <Lucide.MessageSquare size={16} className="shrink-0 opacity-70" />
                  <div className="truncate text-[14px] leading-tight">
                     {session.title || "Health Consultation"}
                  </div>
                </button>
              ))
            )}
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto">
        {/* Mobile Header Toggle */}
        <div className="md:hidden p-4 flex items-center gap-3 bg-white border-b border-[#e2e8f0]">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-[#64748b] hover:bg-[#f1f5f9] rounded-lg"
          >
            <Lucide.Menu size={24} />
          </button>
          <span className="font-bold text-[#1e293b]">AI Doctor</span>
        </div>

        {/* Blue Header Section */}
        <section className="relative pt-12 pb-24 md:pt-16 md:pb-32 px-6 text-center text-white bg-gradient-to-br from-[#0ea5e9] via-[#0284c7] to-[#0369a1] rounded-b-[3rem] md:rounded-b-[4rem] overflow-hidden shrink-0 w-full">
          {/* Optional: Subtle top glow effect for texture */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none"></div>

          <div className="relative z-10 animate-[fadeUp_0.6s_ease-out]">
            <h1 className="text-3xl md:text-3xl font-bold mb-3 flex items-center justify-center gap-3">
              <span className="text-3xl md:text-3xl drop-shadow-md">🤖</span> AI Doctor
            </h1>
            <p className="text-lg opacity-90 max-w-xl mx-auto font-medium">
              Get quick health guidance from our AI-powered assistant.
            </p>
          </div>
        </section>

        <div className="flex flex-col items-center w-full max-w-[1000px] mx-auto px-4 py-6 md:py-10 flex-1 min-h-[600px] -mt-16 z-10">
          <div className="bg-white p-6 md:p-8 lg:p-10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col flex-1 h-full w-full relative">
            
            {/* Messages Area (Outlined Box) */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 mb-8 border border-gray-200 rounded-2xl bg-white space-y-4">
              <div className="flex gap-4 max-w-[85%]">
                 <div className="px-5 py-3.5 rounded-2xl bg-[#e2e8f0] text-[#1e293b] rounded-tl-sm text-[15px] leading-relaxed">
                    <span className="font-bold">Doctor AI:</span> Hello! Describe your symptoms and I'll try to help.
                 </div>
              </div>

              {messages.map((msg, index) => (
                 <div 
                   key={index} 
                   className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'} animate-[slideUp_0.3s_ease-out_forwards]`}
                 >
                    <div 
                      className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-[#0ea5e9] text-white rounded-tr-sm' 
                          : msg.isEmergency
                             ? 'bg-red-50 border border-red-200 text-red-900 rounded-tl-sm'
                             : 'bg-[#e2e8f0] text-[#1e293b] rounded-tl-sm'
                      }`}
                    >
                       {msg.role === 'user' ? (
                          msg.content
                       ) : (
                          <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                            {!msg.isEmergency && <span className="font-bold">Doctor AI: </span>}
                            {msg.isEmergency && <span className="font-bold text-red-700">Doctor AI Alert: </span>}
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                       )}
                    </div>
                 </div>
              ))}
              
              {loading && (
                 <div className="flex gap-4 max-w-[85%] mr-auto animate-[fadeIn_0.3s_ease-out_forwards]">
                    <div className="px-5 py-4 bg-[#e2e8f0] rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded-full bg-[#94a3b8] animate-[bounce_1s_infinite_0ms]"></div>
                       <div className="w-2 h-2 rounded-full bg-[#94a3b8] animate-[bounce_1s_infinite_150ms]"></div>
                       <div className="w-2 h-2 rounded-full bg-[#94a3b8] animate-[bounce_1s_infinite_300ms]"></div>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} className="h-px" />
            </div>

            {/* Input Area */}
            <div className="mt-auto shrink-0 w-full">
               <form 
                  onSubmit={sendMessage} 
                  className="flex gap-3 mb-5 w-full"
               >
                  <input
                     type="text"
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     disabled={loading}
                     placeholder="Describe your symptoms..."
                     className="flex-1 px-5 py-3.5 bg-white border border-[#cbd5e1] rounded-xl text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9] transition-all"
                  />
                  <button
                     type="submit"
                     disabled={!input.trim() || loading}
                     className="bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-[#94a3b8] disabled:cursor-not-allowed text-white font-semibold py-3.5 px-8 rounded-xl transition-colors duration-200 flex items-center justify-center min-w-[120px]"
                  >
                     Send
                  </button>
               </form>
               
               {/* Common Symptoms Tags */}
               <div>
                  <h3 className="text-[15px] font-bold text-[#1e293b] mb-3">Common symptoms</h3>
                  <div className="flex flex-wrap gap-2.5">
                     {['Fever', 'Cough', 'Skin Rash', 'Eye Irritation', 'Headache', 'Stomach Pain'].map((tag) => (
                        <button
                           key={tag}
                           type="button"
                           onClick={() => setInput(tag)}
                           className="px-5 py-2 rounded-full text-sm font-medium bg-[#e2e8f0] text-[#475569] hover:bg-[#cbd5e1] transition-colors"
                        >
                           {tag}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
