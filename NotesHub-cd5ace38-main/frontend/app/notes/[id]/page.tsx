"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Pin, Folder, Tag as TagIcon, X, Plus } from 'lucide-react';

export default function NoteEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const router = useRouter();
  const { notes, collections, tags, createNote, updateNote, deleteNote, togglePin, createCustomTag } = useStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  
  const [tagInput, setTagInput] = useState('');
  const [showCollectionDropdown, setShowCollectionDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      const note = notes.find(n => n.id === id && !n.deletedAt);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setSelectedCollections(note.collectionIds);
        setSelectedTags(note.tagIds);
        setIsPinned(note.isPinned);
      } else {
        router.push('/notes');
      }
    }
  }, [id, isNew, notes, router]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    if (selectedCollections.length === 0) {
      alert('Please select at least one collection');
      return;
    }

    if (isNew) {
      createNote({
        title: title.trim(),
        content: content.trim(),
        collectionIds: selectedCollections,
        tagIds: selectedTags,
        isPinned
      });
    } else {
      updateNote(id as string, {
        title: title.trim(),
        content: content.trim(),
        collectionIds: selectedCollections,
        tagIds: selectedTags,
        isPinned
      });
    }
    router.push('/notes');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(id as string);
      router.push('/notes');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent, tagName?: string) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    
    const nameToAdd = tagName || tagInput.trim();
    if (!nameToAdd) return;

    // Check if tag exists
    let tag = tags.find(t => t.name.toLowerCase() === nameToAdd.toLowerCase());
    
    if (!tag) {
      tag = createCustomTag(nameToAdd);
    }

    if (!selectedTags.includes(tag.id)) {
      setSelectedTags([...selectedTags, tag.id]);
    }
    
    setTagInput('');
    setShowTagDropdown(false);
  };

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  const toggleCollection = (colId: string) => {
    setSelectedCollections(prev => 
      prev.includes(colId) ? prev.filter(id => id !== colId) : [...prev, colId]
    );
  };

  const filteredTags = tags.filter(t => t.name.toLowerCase().includes(tagInput.toLowerCase()) && !selectedTags.includes(t.id));

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="hidden sm:inline">{isNew ? 'Create Note' : 'Edit Note'}</span>
            {!isNew && (
              <>
                <span className="text-slate-600">/</span>
                <span className="text-slate-300 truncate max-w-[200px]">{title}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPinned(!isPinned)}
            className={`p-2 rounded-lg border transition-colors ${isPinned ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'}`}
            title={isPinned ? "Unpin note" : "Pin note"}
          >
            <Pin className={`w-5 h-5 ${isPinned ? 'fill-emerald-400/20' : ''}`} />
          </button>
          
          {!isNew && (
            <button 
              onClick={handleDelete}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          
          <button 
            onClick={handleSave}
            className="btn-primary py-2 px-4 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save Note</span>
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
        <div className="space-y-8 max-w-3xl mx-auto">
          
          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              className="w-full bg-transparent text-4xl sm:text-5xl font-bold text-white placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          {/* Metadata Row (Collections & Tags) */}
          <div className="flex flex-col sm:flex-row gap-6 pb-6 border-b border-white/10">
            
            {/* Collections Selector */}
            <div className="flex-1 relative">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                <Folder className="w-4 h-4" /> Collections <span className="text-red-400">*</span>
              </label>
              <div 
                className="min-h-[42px] p-2 rounded-xl bg-black/20 border border-white/10 flex flex-wrap gap-2 cursor-pointer hover:border-white/20 transition-colors"
                onClick={() => setShowCollectionDropdown(!showCollectionDropdown)}
              >
                {selectedCollections.length === 0 && (
                  <span className="text-slate-500 text-sm p-1">Select collections...</span>
                )}
                {selectedCollections.map(id => {
                  const col = collections.find(c => c.id === id);
                  if (!col) return null;
                  return (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 text-sm border border-purple-500/30">
                      {col.name}
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleCollection(id); }}
                        className="hover:text-white ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
              
              {showCollectionDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto p-2">
                  {collections.length === 0 ? (
                    <div className="p-3 text-sm text-slate-400 text-center">No collections exist. Create one in the sidebar.</div>
                  ) : (
                    collections.map(c => (
                      <div 
                        key={c.id}
                        onClick={() => toggleCollection(c.id)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedCollections.includes(c.id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}`}>
                          {selectedCollections.includes(c.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                        </div>
                        <span className="text-slate-200">{c.name}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Tags Selector */}
            <div className="flex-1 relative">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                <TagIcon className="w-4 h-4" /> Tags
              </label>
              <div className="min-h-[42px] p-2 rounded-xl bg-black/20 border border-white/10 flex flex-wrap gap-2 focus-within:border-emerald-500/50 transition-colors">
                {selectedTags.map(id => {
                  const tag = tags.find(t => t.id === id);
                  if (!tag) return null;
                  return (
                    <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-teal-500/20 text-teal-300 text-sm border border-teal-500/30">
                      #{tag.name}
                      <button 
                        onClick={() => removeTag(id)}
                        className="hover:text-white ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setShowTagDropdown(true);
                  }}
                  onKeyDown={handleAddTag}
                  onFocus={() => setShowTagDropdown(true)}
                  placeholder={selectedTags.length === 0 ? "Add tags..." : ""}
                  className="flex-1 min-w-[100px] bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none p-1"
                />
              </div>

              {showTagDropdown && (tagInput || filteredTags.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto p-2">
                  {filteredTags.map(t => (
                    <div 
                      key={t.id}
                      onClick={(e) => handleAddTag(e, t.name)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer text-slate-200"
                    >
                      <TagIcon className="w-4 h-4 text-slate-400" />
                      <span>{t.name}</span>
                      {t.type === 'predefined' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400 ml-auto">System</span>}
                    </div>
                  ))}
                  {tagInput && !tags.find(t => t.name.toLowerCase() === tagInput.toLowerCase()) && (
                    <div 
                      onClick={(e) => handleAddTag(e)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-emerald-500/10 cursor-pointer text-emerald-400 border-t border-white/5 mt-1 pt-3"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create new tag "{tagInput}"</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div className="min-h-[400px]">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your note here..."
              className="w-full h-full min-h-[400px] bg-transparent text-lg text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
            />
          </div>

        </div>
      </div>
    </div>
  );
}

