import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected application error',
    }
  }

  componentDidCatch(error, errorInfo) {
    // Keep a console trace for debugging without crashing the full app.
    console.error('Unhandled UI error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-600 mb-4">
              The app hit an unexpected error. Please refresh this page.
            </p>
            <p className="text-xs text-gray-500 break-words">{this.state.errorMessage}</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
