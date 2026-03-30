"use client";

import React from 'react';
import NotesPage from '../page';

// The search page is functionally identical to the notes page, 
// just accessed via a different route. We can reuse the NotesPage component.
export default function SearchPage() {
  return <NotesPage />;
}

