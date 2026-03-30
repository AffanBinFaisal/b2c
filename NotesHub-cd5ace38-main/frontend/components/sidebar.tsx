"use client";

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { 
  LayoutDashboard, 
  FileText, 
  Folder, 
  Plus, 
  MoreVertical, 
  LogOut, 
  Settings,
  Search,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const { user, logout, collections, createCollection, renameCollection, deleteCollection } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [editCollectionName, setEditCollectionName] = useState('');

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      createCollection(newCollectionName.trim());
      setNewCollectionName('');
      setIsCreatingCollection(false);
    }
  };

  const handleRenameCollection = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editCollectionName.trim()) {
      renameCollection(id, editCollectionName.trim());
      setEditingCollectionId(null);
    }
  };

  const handleDeleteCollection = (id: string) => {
    if (confirm('Are you sure you want to delete this collection? All notes exclusively in this collection will be permanently deleted.')) {
      deleteCollection(id);
    }
  };

  return (
    <aside className="w-64 bg-[#1e293b]/50 border-r border-white/10 flex flex-col h-full backdrop-blur-xl z-20">
      {/* Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <DatabaseIcon className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">NotesHub</span>
      </div>

      {/* Main Navigation */}
      <nav className="px-4 space-y-1 mb-8">
        <Link 
          href="/" 
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link 
          href="/notes" 
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/notes' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
        >
          <FileText className="w-5 h-5" />
          <span className="font-medium">All Notes</span>
        </Link>
        <Link 
          href="/search" 
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/search' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
        >
          <Search className="w-5 h-5" />
          <span className="font-medium">Search</span>
        </Link>
      </nav>

      {/* Collections */}
      <div className="px-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collections</span>
          <button 
            onClick={() => setIsCreatingCollection(true)}
            className="text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {isCreatingCollection && (
          <form onSubmit={handleCreateCollection} className="px-3 mb-2">
            <input
              autoFocus
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onBlur={() => setIsCreatingCollection(false)}
              placeholder="Collection name..."
              className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
            />
          </form>
        )}

        <div className="space-y-1">
          {collections.map(collection => (
            <div key={collection.id} className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
              {editingCollectionId === collection.id ? (
                <form onSubmit={(e) => handleRenameCollection(collection.id, e)} className="flex-1 mr-2">
                  <input
                    autoFocus
                    type="text"
                    value={editCollectionName}
                    onChange={(e) => setEditCollectionName(e.target.value)}
                    onBlur={() => setEditingCollectionId(null)}
                    className="w-full bg-black/20 border border-white/10 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </form>
              ) : (
                <Link 
                  href={`/notes?collection=${collection.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <Folder className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                  <span className="text-sm text-slate-300 group-hover:text-slate-200 truncate">{collection.name}</span>
                </Link>
              )}
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setEditingCollectionId(collection.id);
                    setEditCollectionName(collection.name);
                  }}
                  className="p-1 text-slate-500 hover:text-slate-300"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => handleDeleteCollection(collection.id)}
                  className="p-1 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {collections.length === 0 && !isCreatingCollection && (
            <div className="px-3 py-2 text-sm text-slate-500 italic">No collections yet.</div>
          )}
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function DatabaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  )
}

