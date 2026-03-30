"use client";

import React, { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { FileText, Folder, Tag, Clock, Pin, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { notes, collections, tags, user } = useStore();
  const router = useRouter();

  const activeNotes = useMemo(() => notes.filter(n => !n.deletedAt && n.ownerId === user?.id), [notes, user]);
  const pinnedNotes = useMemo(() => activeNotes.filter(n => n.isPinned).sort((a, b) => b.updatedAt - a.updatedAt), [activeNotes]);
  const recentNotes = useMemo(() => [...activeNotes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10), [activeNotes]);

  // Stats
  const totalNotes = activeNotes.length;
  const totalCollections = collections.length;
  
  // Top Tags
  const topTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    activeNotes.forEach(note => {
      note.tagIds.forEach(tagId => {
        tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
      });
    });
    
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tagId, count]) => {
        const tag = tags.find(t => t.id === tagId);
        return { tag, count };
      })
      .filter(t => t.tag);
  }, [activeNotes, tags]);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(timestamp));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name.split(' ')[0]}</h1>
          <p className="text-slate-400">Here's what's happening in your knowledge base.</p>
        </div>
        <button 
          onClick={() => router.push('/notes/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Note
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total Notes</p>
            <p className="text-3xl font-bold text-white">{totalNotes}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Folder className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Collections</p>
            <p className="text-3xl font-bold text-white">{totalCollections}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
            <Tag className="w-6 h-6 text-teal-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-400 mb-1">Top Tags</p>
            <div className="flex flex-wrap gap-1">
              {topTags.length > 0 ? topTags.map(({ tag, count }) => (
                <span key={tag?.id} className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                  #{tag?.name}
                </span>
              )) : <span className="text-sm text-slate-500">No tags used yet</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (Pinned & Recent) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Pin className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-semibold text-white">Pinned Notes</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pinnedNotes.map(note => (
                  <Link href={`/notes/${note.id}`} key={note.id} className="glass-card p-5 group block">
                    <h3 className="text-lg font-medium text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">{note.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-3 mb-4">{note.content}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{formatDate(note.updatedAt)}</span>
                      <div className="flex gap-1">
                        {note.collectionIds.slice(0, 2).map(cid => {
                          const col = collections.find(c => c.id === cid);
                          return col ? <span key={cid} className="px-2 py-1 rounded bg-white/5">{col.name}</span> : null;
                        })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recent Notes */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              </div>
              <Link href="/notes" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="glass-panel rounded-2xl overflow-hidden">
              {recentNotes.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {recentNotes.map(note => (
                    <Link href={`/notes/${note.id}`} key={note.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                      <div className="flex-1 min-w-0 mr-4">
                        <h3 className="text-base font-medium text-slate-200 group-hover:text-white truncate mb-1">{note.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{formatDate(note.updatedAt)}</span>
                          {note.tagIds.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              <span>{note.tagIds.length} tags</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>No notes yet. Create your first note to get started!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Area (Collections Overview) */}
        <div className="space-y-8">
          <section className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Folder className="w-5 h-5 text-teal-400" />
              Collections Overview
            </h2>
            <div className="space-y-3">
              {collections.length > 0 ? collections.map(collection => {
                const count = activeNotes.filter(n => n.collectionIds.includes(collection.id)).length;
                return (
                  <Link href={`/notes?collection=${collection.id}`} key={collection.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group">
                    <span className="text-slate-300 group-hover:text-white truncate mr-2">{collection.name}</span>
                    <span className="text-xs font-medium bg-white/10 text-slate-300 px-2 py-1 rounded-full">{count}</span>
                  </Link>
                );
              }) : (
                <p className="text-sm text-slate-500 text-center py-4">No collections created.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

