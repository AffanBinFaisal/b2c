"use client";

import React, { useState, useMemo, Suspense } from 'react';
import { useStore } from '@/lib/store';
import NoteCard from '@/components/note-card';
import { Search, Filter, Plus, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function NotesContent() {
  const { notes, collections, tags, user, searchNotes, updatePreferences } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialCollection = searchParams.get('collection');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollections, setSelectedCollections] = useState<string[]>(initialCollection ? [initialCollection] : []);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const searchLogic = user?.preferences?.searchLogic || 'AND';

  const toggleLogic = () => {
    updatePreferences(searchLogic === 'AND' ? 'OR' : 'AND');
  };

  const toggleCollection = (id: string) => {
    setSelectedCollections(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleTag = (id: string) => {
    setSelectedTags(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSelectedCollections([]);
    setSelectedTags([]);
    setSearchQuery('');
  };

  const filteredNotes = useMemo(() => {
    return searchNotes(searchQuery, selectedCollections, selectedTags, searchLogic);
  }, [searchQuery, selectedCollections, selectedTags, searchLogic, searchNotes, notes]);

  const activeFilterCount = selectedCollections.length + selectedTags.length + (searchQuery ? 1 : 0);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">All Notes</h1>
          <p className="text-slate-400">Browse and filter your entire knowledge base.</p>
        </div>
        <button 
          onClick={() => router.push('/notes/new')}
          className="btn-primary flex items-center gap-2 shrink-0"
        >
          <Plus className="w-5 h-5" /> New Note
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes by title or content..."
              className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${showFilters || activeFilterCount > 0 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-white/10 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-300">Match Logic:</span>
                <button 
                  onClick={toggleLogic}
                  className="flex items-center bg-black/30 rounded-lg p-1 border border-white/5"
                >
                  <span className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${searchLogic === 'AND' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>AND (All)</span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${searchLogic === 'OR' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>OR (Any)</span>
                </button>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors">
                  <X className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Collections Filter */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">Collections</h3>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {collections.map(c => (
                    <button
                      key={c.id}
                      onClick={() => toggleCollection(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${selectedCollections.includes(c.id) ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                  {collections.length === 0 && <span className="text-sm text-slate-500 italic">No collections available</span>}
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {tags.map(t => (
                    <button
                      key={t.id}
                      onClick={() => toggleTag(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${selectedTags.includes(t.id) ? 'bg-teal-500/20 border-teal-500/50 text-teal-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'}`}
                    >
                      #{t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-6 flex items-center justify-between text-sm text-slate-400">
        <span>Showing {filteredNotes.length} result{filteredNotes.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar">
        {filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <NoteCard key={note.id} note={note} collections={collections} tags={tags} />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No notes found</h3>
            <p className="text-slate-400 max-w-md">
              We couldn't find any notes matching your current filters and search query. Try adjusting your criteria or create a new note.
            </p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="mt-6 btn-secondary">
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    }>
      <NotesContent />
    </Suspense>
  );
}

