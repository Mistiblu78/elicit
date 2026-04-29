'use client'

type ErrorType = 'rate_limit' | 'session_limit' | 'api_error' | null

interface ErrorStateProps {
  error: ErrorType
  consecutiveErrors: number
  onRetry: () => void
}

const ERROR_CONFIG: Record<
  NonNullable<ErrorType>,
  { message: string; canRetry: boolean }
> = {
  rate_limit: {
    message: 'Too many requests. Please wait a moment and try again.',
    canRetry: true,
  },
  session_limit: {
    message: "You've reached the session limit. To start a new case, refresh the page.",
    canRetry: false,
  },
  api_error: {
    message: 'Something went wrong while drafting your requests. Please try again.',
    canRetry: true,
  },
}

export default function ErrorState({ error, consecutiveErrors, onRetry }: ErrorStateProps) {
  if (!error) return null
  const config = ERROR_CONFIG[error]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
      <p className="text-gray-700 mb-1">{config.message}</p>
      {consecutiveErrors >= 2 && config.canRetry && (
        <p className="text-sm text-gray-muted mb-4">
          If the problem continues, check your connection or try again shortly.
        </p>
      )}
      {config.canRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-5 py-2 bg-navy text-white text-sm rounded-md font-medium hover:bg-navy/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
