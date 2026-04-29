'use client'

import { useRouter } from 'next/navigation'
import { useSession } from '@/context/SessionContext'

interface GenerateButtonProps {
  onValidationFail: () => void
}

const IDENTIFYING_FIELDS = [
  'petitioner',
  'respondent',
  'opposingCounsel',
  'causeNumber',
  'court',
  'county',
  'requestingParty',
  'opposingPronoun',
  'attorneyName',
  'firmName',
  'firmAddress',
  'firmCityStateZip',
  'phone',
  'fax',
  'barNumber',
  'email',
] as const

export default function GenerateButton({ onValidationFail }: GenerateButtonProps) {
  const { session, updateSession } = useSession()
  const router = useRouter()

  function validate(): boolean {
    for (const field of IDENTIFYING_FIELDS) {
      const value = session[field]
      if (typeof value === 'string' && value.trim() === '') return false
    }
    if (session.requestTypes.length === 0) return false
    if (session.caseType === 'Modification' && session.modificationType === null) return false
    if (session.caseNotes.length > 2000) return false
    return true
  }

  async function handleGenerate() {
    if (!validate()) {
      onValidationFail()
      return
    }

    updateSession({ isLoading: true, error: null })

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
        updateSession({ isLoading: false, error: 'rate_limit' })
        return
      }

      const data = await res.json()

      if (data.error === 'session_limit') {
        updateSession({ isLoading: false, error: 'session_limit' })
        return
      }

      if (data.error === 'api_error' || !res.ok) {
        updateSession({ isLoading: false, error: 'api_error' })
        return
      }

      updateSession({
        documents: data,
        apiCallCount: session.apiCallCount + 1,
        isLoading: false,
        error: null,
      })

      router.push('/output')
    } catch {
      updateSession({ isLoading: false, error: 'api_error' })
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={session.isLoading}
      className="w-full bg-navy text-white py-3 px-6 rounded-md font-medium hover:bg-navy/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {session.isLoading ? 'Drafting your requests...' : 'Generate Documents'}
    </button>
  )
}
