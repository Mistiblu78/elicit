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

  function handleGenerate() {
    if (!validate()) {
      onValidationFail()
      return
    }
    // Set loading state and navigate to output — the output page makes the API call
    updateSession({ isLoading: true, error: null, documents: null })
    router.push('/output')
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
