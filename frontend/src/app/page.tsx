"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import DashboardPage from "./dashboard/page";

export default function HomePage() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuth(true);
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  if (isAuth) {
    return <DashboardPage />;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 bg-gradient-to-br from-[#0ea5e9] via-[#0284c7] to-[#0369a1] rounded-b-[3rem] md:rounded-b-[4rem] text-white w-full overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none"></div>
        <div className="max-w-2xl animate-[fadeUp_0.8s_ease-out] relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            Your Personal{" "}
            <span className="bg-gradient-to-r from-[#e0f2fe] to-white text-transparent bg-clip-text">
              Health Companion
            </span>
          </h1>
          <p className="text-lg opacity-90 mb-8 leading-relaxed">
            Smart wellness tracking, AI-powered symptom checking, and instant
            health guidance — all in one place.
          </p>
          <a
            href="#features"
            className="inline-block px-7 py-3 bg-[#0ea5e9] text-white rounded-lg font-semibold border-2 border-[#e0f2fe]/20 hover:bg-[#0284c7] hover:border-[#e0f2fe]/40 hover:-translate-y-[1px] transition-all shadow-lg"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-10 text-[#1e293b]">What We Offer</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Card 1 */}
          <Link href="/wellness" className="flex flex-col items-center text-center bg-white rounded-2xl p-9 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(14,165,233,0.15)] hover:-translate-y-1.5 transition-all duration-250">
            <div className="text-5xl mb-4">🌿</div>
            <h3 className="text-xl font-semibold mb-2.5 text-[#1e293b]">Wellness Timer</h3>
            <p className="text-[0.92rem] text-[#64748b] leading-relaxed mb-4">
              Stay productive with Pomodoro sessions and track healthy habits like hydration, stretching, and breathing.
            </p>
            <span className="font-semibold text-[#0ea5e9] text-sm mt-auto">Get Started &rarr;</span>
          </Link>

          {/* Card 2 */}
          <Link href="/symptoms" className="flex flex-col items-center text-center bg-white rounded-2xl p-9 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(14,165,233,0.15)] hover:-translate-y-1.5 transition-all duration-250">
            <div className="text-5xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2.5 text-[#1e293b]">Symptom Checker</h3>
            <p className="text-[0.92rem] text-[#64748b] leading-relaxed mb-4">
              Enter your symptoms and get instant suggestions on which specialist you should consult.
            </p>
            <span className="font-semibold text-[#0ea5e9] text-sm mt-auto">Check Now &rarr;</span>
          </Link>

          {/* Card 3 */}
          <Link href="/map" className="flex flex-col items-center text-center bg-white rounded-2xl p-9 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(14,165,233,0.15)] hover:-translate-y-1.5 transition-all duration-250">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-xl font-semibold mb-2.5 text-[#1e293b]">Find Hospitals</h3>
            <p className="text-[0.92rem] text-[#64748b] leading-relaxed mb-4">
              Locate nearby hospitals and clinics on an interactive map with just one click.
            </p>
            <span className="font-semibold text-[#0ea5e9] text-sm mt-auto">Find Nearby &rarr;</span>
          </Link>

          {/* Card 4 */}
          <Link href="/chatbot" className="flex flex-col items-center text-center bg-white rounded-2xl p-9 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(14,165,233,0.15)] hover:-translate-y-1.5 transition-all duration-250">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2.5 text-[#1e293b]">AI Doctor</h3>
            <p className="text-[0.92rem] text-[#64748b] leading-relaxed mb-4">
              Chat with our AI-powered health assistant for quick guidance on common symptoms.
            </p>
            <span className="font-semibold text-[#0ea5e9] text-sm mt-auto">Ask Now &rarr;</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
