'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/context/SessionContext'
import { replaceInDocument } from '@/lib/replacePlaceholders'
import DocumentTabs from '@/components/output/DocumentTabs'

export default function OutputPage() {
  const { session } = useSession()
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (!session.documents) {
      router.replace('/input')
    }
  }, [session.documents, router])

  if (!session.documents) return null

  const documents = session.documents.map(doc => replaceInDocument(doc, session))

  const activeDoc = documents[activeIndex]

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
          <h1 className="text-xl font-semibold text-navy">Your Discovery Documents</h1>
          <div className="w-24" />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <DocumentTabs
            documents={documents}
            activeIndex={activeIndex}
            onTabChange={setActiveIndex}
          >
            <p className="text-sm text-gray-muted">
              {activeDoc
                ? `${activeDoc.type === 'interrogatories' ? 'Interrogatories' : activeDoc.type === 'rfp' ? 'Requests for Production' : activeDoc.type === 'rfa' ? 'Requests for Admissions' : 'Requests for Disclosure'} document ready for review.`
                : null}
            </p>
          </DocumentTabs>
        </div>
      </div>
    </main>
  )
}
