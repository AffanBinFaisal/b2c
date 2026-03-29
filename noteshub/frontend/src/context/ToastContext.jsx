import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}

export const ToastProvider = ({ children }) => {
  const [message, setMessage] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback((text, durationMs = 3200) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setMessage(text)
    timerRef.current = setTimeout(() => {
      setMessage(null)
      timerRef.current = null
    }, durationMs)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg bg-gray-900 text-white text-sm max-w-md text-center"
          role="status"
        >
          {message}
        </div>
      )}
    </ToastContext.Provider>
  )
}
