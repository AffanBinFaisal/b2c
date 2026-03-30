"use client";

import React from 'react';
import { Note, Collection, Tag } from '@/lib/types';
import { Pin, Clock, Folder, Tag as TagIcon } from 'lucide-react';
import Link from 'next/link';

interface NoteCardProps {
  note: Note;
  collections: Collection[];
  tags: Tag[];
}

export default function NoteCard({ note, collections, tags }: NoteCardProps) {
  const noteCollections = note.collectionIds
    .map(id => collections.find(c => c.id === id))
    .filter(Boolean) as Collection[];

  const noteTags = note.tagIds
    .map(id => tags.find(t => t.id === id))
    .filter(Boolean) as Tag[];

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(new Date(timestamp));
  };

  return (
    <Link href={`/notes/${note.id}`} className="glass-card p-6 group block h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 flex-1 mr-4">
          {note.title}
        </h3>
        {note.isPinned && (
          <Pin className="w-5 h-5 text-emerald-400 shrink-0 fill-emerald-400/20" />
        )}
      </div>
      
      <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
        {note.content || <span className="italic opacity-50">No content</span>}
      </p>
      
      <div className="mt-auto space-y-3">
        {/* Collections & Tags */}
        <div className="flex flex-wrap gap-2">
          {noteCollections.slice(0, 2).map(c => (
            <span key={c.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
              <Folder className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{c.name}</span>
            </span>
          ))}
          {noteCollections.length > 2 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
              +{noteCollections.length - 2}
            </span>
          )}
          
          {noteTags.slice(0, 3).map(t => (
            <span key={t.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs">
              <TagIcon className="w-3 h-3" />
              <span className="truncate max-w-[80px]">{t.name}</span>
            </span>
          ))}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(note.updatedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

