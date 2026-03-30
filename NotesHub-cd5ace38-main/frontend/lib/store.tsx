"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Collection, Note, Tag, PREDEFINED_TAGS } from './types';

interface StoreContextType {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
  updatePreferences: (logic: 'AND' | 'OR') => void;

  collections: Collection[];
  createCollection: (name: string) => void;
  renameCollection: (id: string, newName: string) => void;
  deleteCollection: (id: string) => void;

  notes: Note[];
  createNote: (note: Omit<Note, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;

  tags: Tag[];
  createCustomTag: (name: string) => Tag;
  
  searchNotes: (query: string, collectionIds: string[], tagIds: string[], logic: 'AND' | 'OR') => Note[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>(PREDEFINED_TAGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('noteshub_user');
    const storedCollections = localStorage.getItem('noteshub_collections');
    const storedNotes = localStorage.getItem('noteshub_notes');
    const storedTags = localStorage.getItem('noteshub_tags');

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCollections) setCollections(JSON.parse(storedCollections));
    if (storedNotes) setNotes(JSON.parse(storedNotes));
    if (storedTags) {
      const parsedTags = JSON.parse(storedTags);
      // Ensure predefined tags are always present
      const customTags = parsedTags.filter((t: Tag) => t.type === 'custom');
      setTags([...PREDEFINED_TAGS, ...customTags]);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('noteshub_user', JSON.stringify(user));
    localStorage.setItem('noteshub_collections', JSON.stringify(collections));
    localStorage.setItem('noteshub_notes', JSON.stringify(notes));
    localStorage.setItem('noteshub_tags', JSON.stringify(tags));
  }, [user, collections, notes, tags, isLoaded]);

  // --- User Actions ---
  const login = (email: string, name: string) => {
    setUser({
      id: 'user-' + Date.now(),
      email,
      name,
      preferences: { searchLogic: 'AND' }
    });
  };

  const logout = () => setUser(null);

  const updatePreferences = (logic: 'AND' | 'OR') => {
    if (user) {
      setUser({ ...user, preferences: { ...user.preferences, searchLogic: logic } });
    }
  };

  // --- Collection Actions ---
  const createCollection = (name: string) => {
    if (!user) return;
    const newCollection: Collection = {
      id: 'col-' + Date.now(),
      name,
      ownerId: user.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCollections([...collections, newCollection]);
  };

  const renameCollection = (id: string, newName: string) => {
    setCollections(collections.map(c => c.id === id ? { ...c, name: newName, updatedAt: Date.now() } : c));
  };

  const deleteCollection = (id: string) => {
    // Hard delete collection
    setCollections(collections.filter(c => c.id !== id));
    // Hard delete notes that ONLY belong to this collection, or remove this collection from notes
    setNotes(notes.map(n => {
      if (n.collectionIds.includes(id)) {
        const newCollectionIds = n.collectionIds.filter(cid => cid !== id);
        // If it was the only collection, mark for deletion (or hard delete as per PRD: "hard-deletes all contained notes" - wait, PRD says "When a note belongs to only one collection and that collection is deleted, the note is hard-deleted")
        if (newCollectionIds.length === 0) {
           return { ...n, deletedAt: Date.now() }; // Soft delete for now, or filter out completely. Let's filter out completely for hard delete.
        }
        return { ...n, collectionIds: newCollectionIds, updatedAt: Date.now() };
      }
      return n;
    }).filter(n => n.collectionIds.length > 0)); // Remove notes with no collections
  };

  // --- Note Actions ---
  const createNote = (noteData: Omit<Note, 'id' | 'ownerId' | 'createdAt' | 'updatedAt' | 'deletedAt'>) => {
    if (!user) return;
    const newNote: Note = {
      ...noteData,
      id: 'note-' + Date.now(),
      ownerId: user.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deletedAt: null,
    };
    setNotes([...notes, newNote]);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    // Soft delete
    setNotes(notes.map(n => n.id === id ? { ...n, deletedAt: Date.now() } : n));
  };

  const togglePin = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: Date.now() } : n));
  };

  // --- Tag Actions ---
  const createCustomTag = (name: string): Tag => {
    const existing = tags.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newTag: Tag = {
      id: 'tag-' + Date.now(),
      name: name.toLowerCase(),
      type: 'custom',
      ownerId: user?.id || null,
      createdAt: Date.now(),
    };
    setTags([...tags, newTag]);
    return newTag;
  };

  // --- Search ---
  const searchNotes = (query: string, filterCollectionIds: string[], filterTagIds: string[], logic: 'AND' | 'OR') => {
    if (!user) return [];
    
    let activeNotes = notes.filter(n => n.ownerId === user.id && !n.deletedAt);

    // Text Search (simple includes for MVP)
    if (query.trim()) {
      const q = query.toLowerCase();
      activeNotes = activeNotes.filter(n => 
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }

    // Filters
    if (filterCollectionIds.length > 0 || filterTagIds.length > 0) {
      activeNotes = activeNotes.filter(n => {
        const matchesCollections = filterCollectionIds.length === 0 || filterCollectionIds.some(id => n.collectionIds.includes(id));
        const matchesTags = filterTagIds.length === 0 || filterTagIds.some(id => n.tagIds.includes(id));

        if (logic === 'AND') {
          // If both filters are active, must match both. If one is active, must match it.
          const cMatch = filterCollectionIds.length === 0 || matchesCollections;
          const tMatch = filterTagIds.length === 0 || matchesTags;
          return cMatch && tMatch;
        } else {
          // OR logic: match ANY active filter
          return (filterCollectionIds.length > 0 && matchesCollections) || (filterTagIds.length > 0 && matchesTags);
        }
      });
    }

    // Sort by relevance (pinned first, then updated date)
    return activeNotes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  };

  return (
    <StoreContext.Provider value={{
      user, login, logout, updatePreferences,
      collections, createCollection, renameCollection, deleteCollection,
      notes, createNote, updateNote, deleteNote, togglePin,
      tags, createCustomTag,
      searchNotes
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

