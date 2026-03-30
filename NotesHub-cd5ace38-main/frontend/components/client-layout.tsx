"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import LandingPage from '@/components/landing';
import Sidebar from '@/components/sidebar';
import { Loader2 } from 'lucide-react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Subtle background glow for main content area */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-emerald-500/5 blur-[150px] pointer-events-none rounded-full" />
        {children}
      </main>
    </div>
  );
}

