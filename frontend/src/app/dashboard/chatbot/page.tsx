"use client";

import { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function ChatbotPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to UI immediately
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        sessionId,
        message: userMessage.content,
      });

      if (!sessionId && res.data.sessionId) {
        setSessionId(res.data.sessionId);
      }

      // Add AI reply
      setMessages((prev) => [
        ...prev,
        { 
          role: 'ai', 
          content: res.data.reply, 
          isEmergency: res.data.isEmergency 
        },
      ]);
      
      if (res.data.isEmergency) {
         toast.error("Emergency detected! Please seek immediate help.", { duration: 5000 });
      }

    } catch (error) {
       toast.error('Failed to send message');
       setMessages((prev) => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Lucide.Bot size={24} />
          </div>
          <div>
             <h2 className="font-semibold text-lg">AI Health Assistant</h2>
             <p className="text-blue-100 text-sm">Always here to answer your health questions</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
        
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="text-center py-10">
            <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Lucide.Stethoscope size={32} />
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium text-lg">How can I help you today?</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2">
              Describe your symptoms, ask health questions, or get advice on general wellness.
            </p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : msg.isEmergency 
                     ? 'bg-red-50 border border-red-200 text-red-900 dark:bg-red-900/30 dark:text-red-200 rounded-bl-none'
                     : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700'
              }`}
            >
              {msg.isEmergency && (
                 <div className="flex items-center gap-2 font-bold mb-2 text-red-600 dark:text-red-400">
                    <Lucide.AlertTriangle size={18} />
                    EMERGENCY
                 </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none p-4 flex gap-2 items-center text-gray-500">
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
               <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            placeholder="Type your message..."
            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Lucide.Send size={20} />
          </button>
        </form>
      </div>

    </div>
  );
}
