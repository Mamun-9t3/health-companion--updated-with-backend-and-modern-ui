"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as Lucide from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({ email: res.data.email, name: res.data.name }));
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f7fa]">
      {/* MODERN HEADER */}
      <section className="relative pt-20 pb-32 px-6 text-center text-white bg-gradient-to-br from-[#0ea5e9] via-[#0284c7] to-[#0369a1] rounded-b-[3rem] md:rounded-b-[4rem] overflow-hidden shrink-0 w-full">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 animate-[fadeUp_0.6s_ease-out]">
          <div className="mx-auto h-16 w-16 bg-white/20 backdrop-blur-sm text-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/20">
             <Lucide.HeartPulse size={36} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            Welcome back
          </h1>
          <p className="text-lg opacity-90 max-w-xl mx-auto font-medium">
            Sign in to access your Health Companion.
          </p>
        </div>
      </section>

      {/* OVERLAPPING CARD */}
      <section className="max-w-md w-full mx-auto px-6 -mt-16 mb-20 relative z-20 flex-1 flex flex-col">
        <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lucide.Mail className="h-5 w-5 text-[#94a3b8]" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-xl relative block w-full px-4 py-3.5 pl-11 bg-white border border-[#cbd5e1] text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9] transition-all"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                 <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lucide.Lock className="h-5 w-5 text-[#94a3b8]" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-xl relative block w-full px-4 py-3.5 pl-11 bg-white border border-[#cbd5e1] text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9]/30 focus:border-[#0ea5e9] transition-all"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
               <div className="text-sm">
                <Link href="#" className="font-semibold text-[#0ea5e9] hover:text-[#0284c7] transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-[#0ea5e9] hover:bg-[#0284c7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0ea5e9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <Lucide.Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-[15px]">
            <span className="text-[#64748b]">Don't have an account? </span>
            <Link href="/signup" className="font-semibold text-[#0ea5e9] hover:text-[#0284c7] transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
