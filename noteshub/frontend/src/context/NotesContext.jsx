import { createContext, useContext, useState, useCallback } from 'react'
import { notesAPI, collectionsAPI, tagsAPI } from '../services/api'

const NotesContext = createContext(null)

export const useNotes = () => {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error('useNotes must be used within NotesProvider')
  }
  return context
}

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([])
  const [notesTotal, setNotesTotal] = useState(0)
  const [collections, setCollections] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchNotes = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await notesAPI.getAll(params)
      const payload = response.data
      const list = Array.isArray(payload) ? payload : payload.items ?? []
      const total = typeof payload.total === 'number' ? payload.total : list.length
      setNotes(list)
      setNotesTotal(total)
      return { success: true, data: list, total }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to fetch notes'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCollections = useCallback(async () => {
    try {
      setError(null)
      const response = await collectionsAPI.getAll()
      setCollections(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to fetch collections'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const fetchTags = useCallback(async () => {
    try {
      setError(null)
      const response = await tagsAPI.getAll()
      setTags(response.data)
      return { success: true, data: response.data }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to fetch tags'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const createNote = async (data) => {
    try {
      setError(null)
      const response = await notesAPI.create(data)
      await fetchNotes()
      return { success: true, data: response.data }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to create note'
      setError(message)
      return { success: false, error: message }
    }
  }

  const updateNote = async (id, data) => {
    try {
      setError(null)
      const response = await notesAPI.update(id, data)
      await fetchNotes()
      return { success: true, data: response.data }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update note'
      setError(message)
      return { success: false, error: message }
    }
  }

  const deleteNote = async (id) => {
    try {
      setError(null)
      await notesAPI.delete(id)
      await fetchNotes()
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete note'
      setError(message)
      return { success: false, error: message }
    }
  }

  const togglePin = async (id, isPinned) => {
    try {
      setError(null)
      if (isPinned) {
        await notesAPI.unpin(id)
      } else {
        await notesAPI.pin(id)
      }
      await fetchNotes()
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to toggle pin'
      setError(message)
      return { success: false, error: message }
    }
  }

  const createCollection = async (name) => {
    try {
      setError(null)
      const response = await collectionsAPI.create({ name })
      await fetchCollections()
      return { success: true, data: response.data }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to create collection'
      setError(message)
      return { success: false, error: message }
    }
  }

  const updateCollection = async (id, name) => {
    try {
      setError(null)
      const response = await collectionsAPI.update(id, { name })
      await fetchCollections()
      return { success: true, data: response.data }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to update collection'
      setError(message)
      return { success: false, error: message }
    }
  }

  const deleteCollection = async (id) => {
    try {
      setError(null)
      await collectionsAPI.delete(id)
      await fetchCollections()
      await fetchNotes()
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to delete collection'
      setError(message)
      return { success: false, error: message }
    }
  }

  const createTag = async (name) => {
    try {
      setError(null)
      const response = await tagsAPI.create({ name })
      await fetchTags()
      return { success: true, data: response.data }
    } catch (err) {
      const message = err.response?.data?.detail || 'Failed to create tag'
      setError(message)
      return { success: false, error: message }
    }
  }

  const value = {
    notes,
    notesTotal,
    collections,
    tags,
    loading,
    error,
    fetchNotes,
    fetchCollections,
    fetchTags,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    createCollection,
    updateCollection,
    deleteCollection,
    createTag,
  }

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}
