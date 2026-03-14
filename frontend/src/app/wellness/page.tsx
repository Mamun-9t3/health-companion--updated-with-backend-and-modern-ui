"use client";

import { useState, useEffect } from "react";
import * as Lucide from "lucide-react";
import toast from "react-hot-toast";
import api from "@/utils/api";

const POMODORO_TIME = 25 * 60;
const SHORT_BREAK = 5 * 60;

export default function WellnessPage() {
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"pomodoro" | "break">("pomodoro");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/wellness/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      toast.success(`${mode === 'pomodoro' ? 'Focused session complete! Take a break.' : 'Break is over! Time to focus.'}`, { icon: '🔔' });
      if (mode === 'pomodoro') {
        logActivity('focus', 25);
        switchMode("break");
      } else {
        switchMode("pomodoro");
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "pomodoro" ? POMODORO_TIME : SHORT_BREAK);
  };

  const switchMode = (newMode: "pomodoro" | "break") => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === "pomodoro" ? POMODORO_TIME : SHORT_BREAK);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  const logActivity = async (type: string, amount: number) => {
    setLoading(true);
    try {
      await api.post('/wellness/activity', { type, amount, duration: 0 });
      let message = `Logged ${amount} mins of ${type}`;
      if (type === 'hydration') message = `Logged ${amount} ml of water`;
      if (type === 'focus') message = `Logged ${amount} mins of focus`;
      toast.success(message);
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
            <span className="text-4xl drop-shadow-md">🌿</span> Wellness Tracker
          </h1>
          <p className="text-lg opacity-90 max-w-xl mx-auto font-medium">
            Boost productivity with the Pomodoro technique and track healthy habits.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl w-full mx-auto px-6 -mt-20 mb-20 relative z-20 flex-1 flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          {/* Timer Section */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col items-center justify-center min-h-[420px]">
            {/* Mode Switcher */}
            <div className="flex gap-2 mb-10 bg-[#f1f5f9] p-1.5 rounded-full border border-gray-200">
              <button
                onClick={() => switchMode("pomodoro")}
                className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all ${
                  mode === "pomodoro" 
                    ? "bg-white text-[#0ea5e9] shadow-sm" 
                    : "text-[#64748b] hover:text-[#1e293b]"
                }`}
              >
                Focus
              </button>
              <button
                onClick={() => switchMode("break")}
                className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all ${
                  mode === "break" 
                    ? "bg-white text-[#10b981] shadow-sm" 
                    : "text-[#64748b] hover:text-[#1e293b]"
                }`}
              >
                Short Break
              </button>
            </div>

            {/* Timer Display */}
            <div className="text-8xl font-black tracking-tighter tabular-nums mb-12 text-[#1e293b]">
              {formatTime(timeLeft)}
            </div>

            {/* Controls */}
            <div className="flex gap-4 w-full justify-center">
              <button
                onClick={toggleTimer}
                className={`px-12 py-4 rounded-xl font-bold text-lg transition-transform hover:-translate-y-1 w-48 ${
                  isActive 
                    ? "bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] border-b-4 border-[#cbd5e1]" 
                    : "bg-[#0ea5e9] hover:bg-[#0284c7] text-white border-b-4 border-[#0369a1]"
                }`}
              >
                {isActive ? "PAUSE" : "START"}
              </button>
              <button
                onClick={resetTimer}
                className="p-4 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] transition-colors border-b-4 border-[#cbd5e1] hover:-translate-y-1"
                title="Reset Timer"
              >
                 <Lucide.RotateCcw size={24} />
              </button>
            </div>
          </div>

          {/* Habit Tracker Section */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 flex flex-col justify-center gap-5">
            <h2 className="text-2xl font-bold text-[#1e293b] mb-4 text-center md:text-left">Quick Log</h2>
            
            <div className="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0] flex items-center justify-between hover:border-[#0ea5e9]/30 transition-colors">
              <div className="flex gap-4 items-center">
                <div className="bg-[#e0f2fe] p-3 rounded-xl text-[#0ea5e9]">
                  <Lucide.Droplets size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1e293b]">Hydration</h3>
                  <p className="text-sm text-[#64748b]">
                    Today: {stats?.stats?.find((s:any) => s.type === 'hydration')?._sum.amount || 0} ml
                  </p>
                </div>
              </div>
              <button 
                onClick={() => logActivity('hydration', 250)}
                disabled={loading}
                className="bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-[#94a3b8] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
              >
                +250 ml
              </button>
            </div>

            <div className="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0] flex items-center justify-between hover:border-[#8b5cf6]/30 transition-colors">
              <div className="flex gap-4 items-center">
                <div className="bg-[#f5f3ff] p-3 rounded-xl text-[#8b5cf6]">
                  <Lucide.Activity size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1e293b]">Stretching</h3>
                  <p className="text-sm text-[#64748b]">
                    Today: {stats?.stats?.find((s:any) => s.type === 'stretching')?._sum.amount || 0} mins
                  </p>
                </div>
              </div>
              <button 
                onClick={() => logActivity('stretching', 15)}
                disabled={loading}
                className="bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-[#94a3b8] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
              >
                +15 mins
              </button>
            </div>
            
            <div className="bg-[#f8fafc] rounded-xl p-5 border border-[#e2e8f0] flex items-center justify-between hover:border-[#f59e0b]/30 transition-colors">
              <div className="flex gap-4 items-center">
                <div className="bg-[#fffbeb] p-3 rounded-xl text-[#f59e0b]">
                  <Lucide.Brain size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[#1e293b]">Focus Sessions</h3>
                  <p className="text-sm text-[#64748b]">
                    Today: {stats?.stats?.find((s:any) => s.type === 'focus')?._sum.amount || 0} mins
                  </p>
                </div>
              </div>
              <button 
                onClick={() => logActivity('focus', 25)}
                disabled={loading}
                className="bg-[#0ea5e9] hover:bg-[#0284c7] disabled:bg-[#94a3b8] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors"
              >
                +25 mins
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
