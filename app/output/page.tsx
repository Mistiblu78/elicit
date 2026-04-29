'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/context/SessionContext'
import { replaceInDocument } from '@/lib/replacePlaceholders'
import DocumentTabs from '@/components/output/DocumentTabs'
import DocumentViewer from '@/components/output/DocumentViewer'
import ReviewCheckbox from '@/components/output/ReviewCheckbox'
import DownloadControls from '@/components/output/DownloadControls'
import InterrogatoriesBadge from '@/components/output/InterrogatoriesBadge'
import LoadingSkeleton from '@/components/shared/LoadingSkeleton'
import ErrorState from '@/components/shared/ErrorState'

export default function OutputPage() {
  const { session, updateSession, clearSession } = useSession()
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [reviewChecked, setReviewChecked] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [consecutiveErrors, setConsecutiveErrors] = useState(0)
  const calledRef = useRef(false)

  const makeApiCall = useCallback(async () => {
    try {
      const payload = {
        caseType: session.caseType,
        modificationType: session.modificationType,
        discoveryLevel: session.discoveryLevel,
        requestTypes: session.requestTypes,
        responseDeadline: session.responseDeadline,
        caseNotes: session.caseNotes,
        apiCallCount: session.apiCallCount,
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.status === 429) {
        setConsecutiveErrors(prev => prev + 1)
        updateSession({ isLoading: false, error: 'rate_limit' })
        return
      }

      const data = await res.json()

      if (data.error === 'session_limit') {
        updateSession({ isLoading: false, error: 'session_limit' })
        return
      }

      if (data.error === 'api_error' || !res.ok) {
        setConsecutiveErrors(prev => prev + 1)
        updateSession({ isLoading: false, error: 'api_error' })
        return
      }

      setConsecutiveErrors(0)
      updateSession({
        documents: data,
        apiCallCount: session.apiCallCount + 1,
        isLoading: false,
        error: null,
      })
    } catch {
      setConsecutiveErrors(prev => prev + 1)
      updateSession({ isLoading: false, error: 'api_error' })
    }
  }, [session, updateSession])

  // Trigger API call when isLoading=true and no documents (initial load or retry)
  useEffect(() => {
    if (session.isLoading && !session.documents && !calledRef.current) {
      calledRef.current = true
      makeApiCall()
    }
  }, [session.isLoading, session.documents, makeApiCall])

  // Redirect to input if there's nothing to show
  useEffect(() => {
    if (!session.isLoading && !session.documents && !session.error) {
      router.replace('/input')
    }
  }, [session.isLoading, session.documents, session.error, router])

  function handleRetry() {
    calledRef.current = false
    updateSession({ isLoading: true, error: null, documents: null })
  }

  function handleNewSession() {
    setShowConfirm(true)
  }

  function confirmNewSession() {
    clearSession()
    router.push('/')
  }

  // Loading state
  if (session.isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => { updateSession({ isLoading: false }); router.push('/input') }}
              className="text-sm text-navy hover:underline font-medium"
            >
              ← Back to edit
            </button>
            <h1 className="text-xl font-semibold text-black">Your Discovery Documents</h1>
            <button
              onClick={handleNewSession}
              className="text-sm text-gray-muted hover:text-navy transition-colors"
            >
              Start new session
            </button>
          </div>
          <LoadingSkeleton requestTypes={session.requestTypes} />
        </div>
      </main>
    )
  }

  // Error state
  if (session.error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => router.push('/input')}
              className="text-sm text-navy hover:underline font-medium"
            >
              ← Back to edit
            </button>
            <h1 className="text-xl font-semibold text-black">Your Discovery Documents</h1>
            <button
              onClick={handleNewSession}
              className="text-sm text-gray-muted hover:text-navy transition-colors"
            >
              Start new session
            </button>
          </div>
          <ErrorState
            error={session.error}
            consecutiveErrors={consecutiveErrors}
            onRetry={handleRetry}
          />
        </div>
      </main>
    )
  }

  if (!session.documents) return null

  const documents = session.documents.map(doc => replaceInDocument(doc, session))
  const activeDoc = documents[activeIndex]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Confirmation overlay */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <p className="text-sm text-gray-700 mb-4">
              This will clear your current session. Continue?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmNewSession}
                className="px-4 py-2 text-sm bg-navy text-white rounded-md hover:bg-navy/90 transition-colors"
              >
                Yes, clear session
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/input')}
            className="text-sm text-navy hover:underline font-medium"
          >
            ← Back to edit
          </button>
          <h1 className="text-xl font-semibold text-black">Your Discovery Documents</h1>
          <button
            onClick={handleNewSession}
            className="text-sm text-gray-muted hover:text-navy transition-colors"
          >
            Start new session
          </button>
        </div>

        {/* Review checkbox */}
        <div className="mb-4 bg-white rounded-lg border border-light-blue px-5 py-4">
          <ReviewCheckbox checked={reviewChecked} onChange={setReviewChecked} />
        </div>

        {/* Document tabs + viewer */}
        <div className="bg-white rounded-lg shadow-sm border border-light-blue">
          <DocumentTabs
            documents={documents}
            activeIndex={activeIndex}
            onTabChange={idx => { setActiveIndex(idx); setReviewChecked(false) }}
          >
            {activeDoc?.type === 'interrogatories' && (
              <div className="mb-3">
                <InterrogatoriesBadge doc={activeDoc} />
                {activeDoc.review_notice && (
                  <p className="text-xs text-gray-muted mt-1">{activeDoc.review_notice}</p>
                )}
              </div>
            )}
            <DocumentViewer doc={activeDoc} session={session} />
          </DocumentTabs>
        </div>

        {/* Download controls */}
        <div className="mt-4 bg-white rounded-lg border border-light-blue px-5 py-4">
          <DownloadControls
            activeDoc={activeDoc}
            allDocs={documents}
            session={session}
            reviewChecked={reviewChecked}
          />
        </div>
      </div>
    </main>
  )
}
