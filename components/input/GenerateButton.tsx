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
    // 1. All 16 identifying info fields must be non-empty
    for (const field of IDENTIFYING_FIELDS) {
      const value = session[field]
      if (typeof value === 'string' && value.trim() === '') return false
    }

    // 2. At least one request type selected
    if (session.requestTypes.length === 0) return false

    // 3. If caseType === 'Modification', modificationType must not be null
    if (session.caseType === 'Modification' && session.modificationType === null) return false

    // 4. caseNotes.length <= 2000
    const notes = session.caseNotes
    if (notes.length > 2000) return false

    return true
  }

  function handleGenerate() {
    if (!validate()) {
      onValidationFail()
      return
    }

    updateSession({ isLoading: true })
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
