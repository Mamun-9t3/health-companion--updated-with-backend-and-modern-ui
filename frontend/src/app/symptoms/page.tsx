"use client";

import { useState } from "react";
import api from '@/utils/api';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import * as Lucide from 'lucide-react';

export default function SymptomsPage() {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: string; isEmergency: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/symptoms/check', { symptoms });
      setResult(res.data);
      if (res.data.isEmergency) {
        toast.error('Emergency symptoms detected!', { duration: 5000 });
      } else {
        toast.success('Symptoms analyzed');
      }
    } catch (err) {
      toast.error('Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f7fa]">
      {/* 1. MODERN HEADER: Gradient + Rounded Bottom + Soft Padding */}
      <section className="relative pt-20 pb-32 px-6 text-center text-white bg-gradient-to-br from-[#0ea5e9] via-[#0284c7] to-[#0369a1] rounded-b-[3rem] md:rounded-b-[4rem] overflow-hidden shrink-0">
        
        {/* Optional: Subtle top glow effect for texture */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none"></div>

        <div className="relative z-10 animate-[fadeUp_0.6s_ease-out]">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <span className="text-4xl drop-shadow-md">🧠</span> Symptom Checker
          </h1>
          <p className="text-lg opacity-90 max-w-xl mx-auto font-medium">
            Describe your symptoms and find out which specialist to consult.
          </p>
        </div>
      </section>

      {/* 2. THE OVERLAPPING CARD: Negative Top Margin (-mt-20) + Soft Shadow */}
      <section className="max-w-3xl w-full mx-auto px-6 -mt-20 mb-20 relative z-20 flex-1 flex flex-col">
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex-1 flex flex-col">
          <h2 className="text-2xl font-bold text-[#1e293b] text-center mb-6">What are you feeling?</h2>
          
          <form onSubmit={handleSubmit} className="flex gap-3 mb-8 w-full">
            <input
              type="text"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              disabled={loading}
              placeholder="e.g. fever, headache, skin rash, eye pain..."
              className="flex-1 px-5 py-3.5 bg-white border border-[#cbd5e1] rounded-xl text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9] transition-all"
              required
            />
            <button
              type="submit"
              disabled={loading || !symptoms.trim()}
              className="bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-[#94a3b8] disabled:cursor-not-allowed text-white font-semibold py-3.5 px-8 rounded-xl transition-colors duration-200 flex items-center justify-center min-w-[120px]"
            >
              {loading ? <Lucide.Loader2 className="animate-spin" size={20} /> : 'Check'}
            </button>
          </form>

          {/* Common Symptoms Tags */}
          <div>
            <h3 className="text-sm font-bold text-[#475569] mb-3">Common Symptoms</h3>
            <div className="flex flex-wrap gap-2.5">
              {['Fever', 'Cough', 'Skin Rash', 'Eye Pain', 'Headache', 'Stomach Pain'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSymptoms((prev) => prev ? `${prev}, ${tag.toLowerCase()}` : tag.toLowerCase())}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    symptoms.toLowerCase().includes(tag.toLowerCase()) 
                    ? 'bg-[#0ea5e9] text-white' 
                    : 'bg-[#e2e8f0] text-[#475569] hover:bg-[#cbd5e1]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          {result && (
            <div className={`mt-10 p-6 rounded-xl border animate-[fadeUp_0.4s_ease-out] ${
              result.isEmergency 
                ? 'bg-red-50 border-red-200' 
                : 'bg-[#f8fafc] border-[#e2e8f0]'
            }`}>
              <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${result.isEmergency ? 'text-red-600' : 'text-[#0ea5e9]'}`}>
                {result.isEmergency ? <Lucide.AlertCircle size={24} /> : <Lucide.Activity size={24} />}
                AI Analysis
              </h3>
              <div className="prose prose-sm max-w-none text-[#334155] prose-strong:text-[#1e293b]">
                <ReactMarkdown>{result.analysis}</ReactMarkdown>
              </div>
              
              {result.isEmergency && (
                <div className="mt-5 p-4 bg-red-100 border border-red-200 rounded-xl text-red-700 text-sm font-bold flex items-center gap-3">
                  <Lucide.AlertTriangle className="shrink-0" size={20} />
                  Please seek immediate medical attention or visit the nearest emergency room.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
