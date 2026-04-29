'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/context/SessionContext'
import IdentifyingInfoForm from '@/components/input/IdentifyingInfoForm'
import CaseDetailsForm from '@/components/input/CaseDetailsForm'
import CaseNotesField from '@/components/input/CaseNotesField'
import GenerateButton from '@/components/input/GenerateButton'

export default function InputPage() {
  const { clearSession } = useSession()
  const router = useRouter()
  const [showErrors, setShowErrors] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function confirmNewSession() {
    clearSession()
    router.push('/')
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">New Discovery Request</h1>
        <button
          onClick={() => setShowConfirm(true)}
          className="text-sm text-gray-muted hover:text-navy transition-colors"
        >
          Start new session
        </button>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-black mb-4">Identifying Information</h2>
        <p className="text-sm text-gray-muted mb-4">
          This information populates your documents automatically. It is never sent to the AI model.
        </p>
        <IdentifyingInfoForm showErrors={showErrors} />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-black mb-4">Case Details</h2>
        <CaseDetailsForm />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-black mb-4">Case Notes</h2>
        <p className="text-sm text-gray-muted mb-2">
          Describe the disputed issues using placeholders instead of real names. The example below shows correct usage — clear it and enter your own facts.
        </p>
        <CaseNotesField />
      </section>

      <GenerateButton onValidationFail={() => setShowErrors(true)} />
    </main>
  )
}
