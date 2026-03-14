"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, LogOut, LogIn } from "lucide-react";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isClient, setIsClient] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Handle client-side hydration mismatch for localStorage
  useEffect(() => {
    setIsClient(true);
    checkAuthStatus();
  }, [pathname]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsDropdownOpen(false);
    toast.success("Successfully logged out");
    router.push("/");
  };

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mt-4 mb-0 relative z-50">
      <nav className="flex justify-between items-center px-6 md:px-8 h-[70px] bg-white/95 backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 rounded-2xl max-w-7xl mx-auto relative">
        <Link href="/" className="text-[1.3rem] font-bold text-[#0ea5e9]">
          Health Companion
        </Link>
        
        <div className="flex items-center gap-8">
          {/* Desktop Links */}
          <ul className="hidden md:flex gap-8 list-none m-0 p-0">
            <li><Link href="/" className="font-medium text-[#475569] hover:text-[#0ea5e9] transition-colors">Home</Link></li>
            <li><Link href="/wellness" className="font-medium text-[#475569] hover:text-[#0ea5e9] transition-colors">Wellness</Link></li>
            <li><Link href="/symptoms" className="font-medium text-[#475569] hover:text-[#0ea5e9] transition-colors">Symptoms</Link></li>
            <li><Link href="/map" className="font-medium text-[#475569] hover:text-[#0ea5e9] transition-colors">Clinics</Link></li>
            <li><Link href="/chatbot" className="font-medium text-[#475569] hover:text-[#0ea5e9] transition-colors">AI Doctor</Link></li>
          </ul>

          {/* User Profile / Auth Button */}
          <div className="relative">
            {isLoggedIn ? (
              <div>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f1f5f9] text-[#0ea5e9] hover:bg-[#e0f2fe] transition-colors shadow-sm border border-gray-200 focus:outline-none"
                >
                  <User size={20} />
                </button>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 py-1 z-50 animate-[slideUp_0.2s_ease-out_forwards]">
                      <div className="px-4 py-3 border-b border-gray-50 bg-gray-50 rounded-t-xl mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">My Account</p>
                      </div>
                      <Link 
                        href="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#f8fafc] hover:text-[#0ea5e9] transition-colors"
                      >
                        <User size={16} /> User Dashboard
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link 
                href="/login"
                className="flex items-center gap-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-medium py-2 px-5 rounded-full transition-colors shadow-sm"
              >
                <LogIn size={18} /> Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
