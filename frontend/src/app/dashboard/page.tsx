"use client";

import { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/wellness/stats');
      setStats(res.data);
    } catch (err: any) {
      console.error('Failed to load stats', err?.response?.data || err);
    }
  };

  const logActivity = async (type: string, amount: number) => {
    setLoading(true);
     try {
       await api.post('/wellness/activity', { type, amount, duration: 0 });
       toast.success(`Logged ${amount} ${type === 'hydration' ? 'ml water' : 'mins'}`);
       fetchStats();
     } catch(err) {
       toast.error('Failed to log activity');
     } finally {
       setLoading(false);
     }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f7fa]">
      {/* 1. MODERN HEADER: Gradient + Rounded Bottom + Soft Padding */}
      <section className="relative pt-20 pb-32 px-6 text-center text-white bg-gradient-to-br from-[#0ea5e9] via-[#0284c7] to-[#0369a1] rounded-b-[3rem] md:rounded-b-[4rem] overflow-hidden shrink-0 w-full">
        {/* Optional: Subtle top glow effect for texture */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none"></div>

        <div className="relative z-10 animate-[fadeUp_0.6s_ease-out]">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <span className="text-4xl drop-shadow-md">👋</span> Welcome Back!
          </h1>
          <p className="text-lg opacity-90 max-w-xl mx-auto font-medium">
            Track your daily health activities and wellness score.
          </p>
        </div>
      </section>

      {/* 2. THE OVERLAPPING CARD GRID: Negative Top Margin (-mt-20) + Soft Shadow */}
      <div className="max-w-6xl w-full mx-auto px-6 -mt-20 mb-20 relative z-20 flex-1 flex flex-col">
        {/* Wellness Score & Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Score */}
          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col justify-between hover:shadow-[0_12px_32px_rgba(14,165,233,0.15)] transition-all">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-[#1e293b] text-lg">Overall Wellness</h3>
              <div className="p-2.5 bg-[#f0fdf4] text-[#16a34a] rounded-xl"><Lucide.Activity size={22} /></div>
            </div>
            <div className="mb-4">
               <span className="text-5xl font-extrabold text-[#0ea5e9]">{stats?.score || 100}</span>
               <span className="text-[#64748b] ml-1 font-medium">/ 100</span>
            </div>
            <p className="text-sm text-[#475569]">Based on your recent activity logging.</p>
          </div>

          {/* Card 2: Hydration */}
          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col justify-between hover:shadow-[0_12px_32px_rgba(14,165,233,0.15)] transition-all">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-[#1e293b] text-lg">Hydration Today</h3>
              <div className="p-2.5 bg-[#e0f2fe] text-[#0ea5e9] rounded-xl"><Lucide.Droplets size={22} /></div>
            </div>
            <div className="mb-6">
               <span className="text-4xl font-bold text-[#1e293b]">
                 {stats?.stats?.find((s:any) => s.type === 'hydration')?._sum.amount || 0}
               </span>
               <span className="text-[#64748b] ml-2 font-medium">ml</span>
            </div>
            <button 
               onClick={() => logActivity('hydration', 250)}
               disabled={loading}
               className="w-full py-3 bg-[#f8fafc] hover:bg-[#0ea5e9] hover:text-white border border-[#e2e8f0] hover:border-[#0ea5e9] text-[#334155] rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
            >
              <Lucide.Plus size={18} /> Drink 250ml
            </button>
          </div>

          {/* Card 3: Active Minutes */}
          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col justify-between hover:shadow-[0_12px_32px_rgba(14,165,233,0.15)] transition-all">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-[#1e293b] text-lg">Active Minutes</h3>
              <div className="p-2.5 bg-[#f5f3ff] text-[#8b5cf6] rounded-xl"><Lucide.Timer size={22} /></div>
            </div>
            <div className="mb-6">
               <span className="text-4xl font-bold text-[#1e293b]">
                 {stats?.stats?.find((s:any) => s.type === 'stretching')?._sum.amount || 0}
               </span>
               <span className="text-[#64748b] ml-2 font-medium">mins</span>
            </div>
            <button 
               onClick={() => logActivity('stretching', 15)}
               disabled={loading}
               className="w-full py-3 bg-[#f8fafc] hover:bg-[#0ea5e9] hover:text-white border border-[#e2e8f0] hover:border-[#0ea5e9] text-[#334155] rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
            >
              <Lucide.Plus size={18} /> Log 15m Stretch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
