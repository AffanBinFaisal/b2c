export interface User {
  id: string;
  email: string;
  name: string;
  preferences: {
    searchLogic: 'AND' | 'OR';
  };
}

export interface Collection {
  id: string;
  name: string;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  collectionIds: string[];
  tagIds: string[];
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export interface Tag {
  id: string;
  name: string;
  type: 'predefined' | 'custom';
  ownerId: string | null;
  createdAt: number;
}

export const PREDEFINED_TAGS: Tag[] = [
  { id: 'tag-decisions', name: 'decisions', type: 'predefined', ownerId: null, createdAt: 1700000000000 },
  { id: 'tag-action-items', name: 'action-items', type: 'predefined', ownerId: null, createdAt: 1700000000000 },
  { id: 'tag-research', name: 'research', type: 'predefined', ownerId: null, createdAt: 1700000000000 },
  { id: 'tag-ideas', name: 'ideas', type: 'predefined', ownerId: null, createdAt: 1700000000000 },
  { id: 'tag-reference', name: 'reference', type: 'predefined', ownerId: null, createdAt: 1700000000000 },
];

