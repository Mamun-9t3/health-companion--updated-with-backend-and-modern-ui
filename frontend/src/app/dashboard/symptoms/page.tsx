"use client";

import { useState } from 'react';
import * as Lucide from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: string, isEmergency: boolean } | null>(null);

  const checkSymptoms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/symptoms/check', { symptoms });
      setResult(res.data);
      if (res.data.isEmergency) {
         toast.error("Emergency detected! Seek help immediately.");
      }
    } catch (error) {
       toast.error('Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
           <Lucide.Stethoscope className="text-indigo-600" />
           Symptom Checker
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Describe what you are feeling, and our AI will suggest the right specialist.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Input Section */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <form onSubmit={checkSymptoms} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Describe your symptoms in detail:
                  </label>
                  <textarea
                     rows={6}
                     value={symptoms}
                     onChange={(e) => setSymptoms(e.target.value)}
                     disabled={loading}
                     placeholder="E.g., I have had a headache for 3 days, accompanied by slight nausea and sensitivity to light..."
                     className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 dark:text-white resize-none"
                  />
               </div>
               
               <button
                  type="submit"
                  disabled={loading || !symptoms.trim()}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
               >
                  {loading ? (
                     <><Lucide.Loader2 className="animate-spin" size={18} /> Analyzing...</>
                  ) : (
                     <><Lucide.Search size={18} /> Analyze Symptoms</>
                  )}
               </button>
            </form>
         </div>

         {/* Result Section */}
         <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-center min-h-[300px]">
            {!result && !loading && (
               <div className="space-y-3 text-gray-500">
                  <Lucide.ClipboardList size={48} className="mx-auto text-gray-400" />
                  <p>Your analysis will appear here.</p>
               </div>
            )}

            {loading && (
               <div className="space-y-4 text-indigo-600">
                  <Lucide.Activity size={48} className="mx-auto animate-pulse" />
                  <p className="animate-pulse">Consulting AI Knowledge Base...</p>
               </div>
            )}

            {result && !loading && (
               <div className={`w-full text-left p-6 rounded-xl ${result.isEmergency ? 'bg-red-50 text-red-900 border border-red-200' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm'}`}>
                  {result.isEmergency && (
                     <div className="flex items-center gap-2 font-bold mb-4 text-red-700">
                        <Lucide.AlertOctagon size={24} />
                        EMERGENCY WARNING
                     </div>
                  )}
                  <div className="prose dark:prose-invert prose-indigo">
                     <h3 className="text-lg font-semibold mb-2">Analysis Results:</h3>
                     <p className="whitespace-pre-wrap">{result.analysis}</p>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
