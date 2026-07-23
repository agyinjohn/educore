'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, BarChart3, Users, Shield } from 'lucide-react';

const loginFeatures = [
  { icon: Users, text: 'Manage students, staff & classes in one place' },
  { icon: BarChart3, text: 'Real-time analytics and performance reports' },
  { icon: Shield, text: 'Enterprise-grade security & role-based access' },
];

const registerFeatures = [
  { icon: GraduationCap, text: 'Your own school portal at yourschool.educore.app' },
  { icon: Users, text: 'Manage unlimited students, teachers & parents' },
  { icon: BarChart3, text: 'Finance, attendance & academic reports built-in' },
  { icon: Shield, text: 'Free to start — no credit card required' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname?.includes('login');

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 backdrop-blur border border-white/20 shadow-lg rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xl font-bold tracking-tight">EduCore</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-tight">
              The all-in-one platform for modern schools
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Streamline administration, boost engagement, and drive better outcomes for your institution.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-4">
            {(isLogin ? loginFeatures : registerFeatures).map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 border border-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-50 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="pt-4 border-t border-white/20">
            {isLogin ? (
              <p className="text-blue-200 text-sm">
                Trusted by <span className="text-white font-semibold">500+</span> institutions worldwide
              </p>
            ) : (
              <p className="text-blue-200 text-sm">
                Set up in <span className="text-white font-semibold">under 5 minutes</span> — no technical knowledge needed
              </p>
            )}
          </div>
        </div>

        {/* Bottom switch link */}
        <div className="relative z-10 text-sm text-blue-200">
          {isLogin ? (
            <>
              New to EduCore?{' '}
              <Link href="/register" className="text-white font-semibold hover:underline">
                Create a free account →
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/login" className="text-white font-semibold hover:underline">
                Sign in →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50/60">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 px-6 py-4 border-b border-gray-100 bg-white">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-600/30">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="text-gray-900 font-bold">EduCore</span>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/80 shadow-sm shadow-gray-900/5 p-8 sm:p-10">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} EduCore. All rights reserved. ·{' '}
          <Link href="/privacy" className="hover:text-gray-600">Privacy</Link> ·{' '}
          <Link href="/terms" className="hover:text-gray-600">Terms</Link>
        </div>
      </div>
    </div>
  );
}
