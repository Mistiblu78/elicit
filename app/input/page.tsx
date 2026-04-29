'use client'

import { useState } from 'react'
import IdentifyingInfoForm from '@/components/input/IdentifyingInfoForm'
import CaseDetailsForm from '@/components/input/CaseDetailsForm'
import CaseNotesField from '@/components/input/CaseNotesField'
import GenerateButton from '@/components/input/GenerateButton'

export default function InputPage() {
  const [showErrors, setShowErrors] = useState(false)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy">New Discovery Request</h1>
        {/* Start new session link — added in item 7 */}
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-navy mb-4">Identifying Information</h2>
        <p className="text-sm text-gray-muted mb-4">
          This information populates your documents automatically. It is never sent to the AI model.
        </p>
        <IdentifyingInfoForm showErrors={showErrors} />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-navy mb-4">Case Details</h2>
        <CaseDetailsForm />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-navy mb-4">Case Notes</h2>
        <p className="text-sm text-gray-muted mb-2">
          Describe the disputed issues using placeholders instead of real names. The example below shows correct usage — clear it and enter your own facts.
        </p>
        <CaseNotesField />
      </section>

      <GenerateButton onValidationFail={() => setShowErrors(true)} />
    </main>
  )
}
