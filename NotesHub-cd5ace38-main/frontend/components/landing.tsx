"use client";

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { Sparkles, Database, Search, ArrowRight, Lock, Zap, Layers } from 'lucide-react';

export default function LandingPage() {
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && name) {
      login(email, name);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Database className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">NotesHub</span>
        </div>
        <button 
          onClick={() => setIsLoginMode(true)}
          className="text-slate-300 hover:text-white font-medium transition-colors"
        >
          Sign In
        </button>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20 max-w-7xl mx-auto w-full">
        
        {isLoginMode ? (
          <div className="w-full max-w-md glass-card p-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-400">Enter your details to access your knowledge base.</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="Alex the Knowledge Worker"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  placeholder="alex@example.com"
                />
              </div>
              <button type="submit" className="w-full btn-primary mt-6 flex items-center justify-center gap-2">
                Access NotesHub <ArrowRight className="w-5 h-5" />
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsLoginMode(false)}
                className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
              >
                Back to home
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-emerald-500/30 text-emerald-400 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                <span>The intelligent way to organize your thoughts</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-tight">
                Your Second Brain, <br/>
                <span className="text-gradient">Perfectly Organized.</span>
              </h1>
              
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light mb-10 leading-relaxed">
                Stop losing your notes. NotesHub provides full-text search, multi-dimensional filtering, and intelligent organization to make knowledge retrieval instant.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => setIsLoginMode(true)} className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-lg px-8 py-4">
                  Start Organizing <ArrowRight className="w-5 h-5" />
                </button>
                <button className="btn-secondary w-full sm:w-auto text-lg px-8 py-4">
                  View Demo
                </button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
              <div className="glass-card p-8 group">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Search className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Instant Retrieval</h3>
                <p className="text-slate-400 leading-relaxed">
                  Full-text search across all your notes with multi-dimensional filtering by collections and tags. Find anything in milliseconds.
                </p>
              </div>
              
              <div className="glass-card p-8 group">
                <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Layers className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Flexible Organization</h3>
                <p className="text-slate-400 leading-relaxed">
                  Group related notes into collections. A single note can live in multiple collections, matching how your brain actually works.
                </p>
              </div>
              
              <div className="glass-card p-8 group">
                <div className="w-14 h-14 rounded-full bg-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Intelligent Tagging</h3>
                <p className="text-slate-400 leading-relaxed">
                  Use predefined system tags or create your own custom taxonomy. Cross-reference ideas effortlessly across different projects.
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

