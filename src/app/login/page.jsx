"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight, BookOpen, BarChart3, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");
      window.location.assign("/dashboard/teacher");
    } catch (loginError) {
      setError(loginError.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans not-italic text-slate-800 bg-[#f8fafc]">
      
      {/* LEFT PANEL - BRANDING (Matches your sidebar color and vibe) */}
      <div className="hidden lg:flex lg:w-5/12 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow/decoration */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="text-white text-3xl font-bold tracking-tight">3G</div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div className="text-slate-300 text-[13px] font-medium tracking-wide uppercase">
              Academic Portal
            </div>

          </div>

          <h1 className="text-white text-4xl font-bold leading-tight mb-6">
            Student Success <br />
            <span className="text-blue-400">& Talent Tracking</span>
          </h1>
          
          <p className="text-slate-400 text-[14px] leading-relaxed max-w-md">
            The central workspace for faculty to monitor academic performance, upload assessments, and identify at-risk students through data-driven distribution models.
          </p>

          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-4 text-slate-300 text-[13px] font-medium">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                <BarChart3 size={18} className="text-blue-400" />
              </div>
              Gradual, Growing & Gallant progression tracking
            </div>
            <div className="flex items-center gap-4 text-slate-300 text-[13px] font-medium">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                <BookOpen size={18} className="text-blue-400" />
              </div>
              Department of Computer Applications
            </div>
            <div className="flex items-center gap-4 text-slate-300 text-[13px] font-medium">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                <ShieldCheck size={18} className="text-blue-400" />
              </div>
              Secure faculty workspace
            </div>
          </div>
        </div>

        <div className="relative z-10 text-slate-500 text-[11px] font-medium">
          © 2026-27 3G Academic Project. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL - LOGIN FORM */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 xl:px-32 relative">
        
        {/* Mobile Header (Only shows on small screens) */}
        <div className="lg:hidden mb-10 flex items-center gap-2">
          <div className="bg-slate-900 text-white text-xl font-bold px-3 py-1 rounded">3G</div>
          <div className="text-slate-600 text-[13px] font-medium">Student Success Tracking</div>
        </div>

        <div className="w-full max-w-[420px] mx-auto">
          <div className="mb-8">
            <p className="text-[12px] font-medium text-slate-500 tracking-wide uppercase mb-2">Teacher Workspace</p>
            <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Sign in to your account</h2>
            <p className="text-[13px] text-slate-500 mt-2">
              Enter your faculty email or employee ID to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                Faculty email or employee ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white shadow-sm"
                  placeholder="e.g. teacher@kiet.edu or 2xxxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white shadow-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && <p role="alert" className="text-[12px] text-red-600">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-[13px] transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in to workspace
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Bottom Help Text */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 font-bold text-[12px]">?</span>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold text-slate-800">Need access?</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                If you are a newly assigned faculty member, please contact the IT Administrator for Department of Computer Applications to generate your credentials.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
