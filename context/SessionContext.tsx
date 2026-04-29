'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface GeneratedDocument {
  type: string
  caption: string
  title: string
  to_line: string
  cover: string
  definitions: Array<{ term: string; definition: string }>
  requests: Array<{ section: string; items: Array<{ number: number; text: string }> }>
  signature_block: string
  certificate: string
  review_notice: string
  interrogatory_count: number | null
  over_limit: boolean
}

interface SessionState {
  // Identifying info — PII, never sent to API
  petitioner: string
  respondent: string
  opposingCounsel: string
  causeNumber: string
  court: string
  county: string
  requestingParty: 'Petitioner' | 'Respondent'
  opposingPronoun: 'his' | 'her' | 'their'
  attorneyName: string
  firmName: string
  firmAddress: string
  firmCityStateZip: string
  phone: string
  fax: string
  barNumber: string
  email: string

  // Case details — sent to API
  caseType: 'Divorce — No Children' | 'Divorce — With Children' | 'Original SAPCR' | 'Modification'
  modificationType: 'Conservatorship/Possession' | 'Child Support' | 'Both' | null
  discoveryLevel: 'Level 1' | 'Level 2' | 'Level 3'
  requestTypes: Array<'Interrogatories' | 'RFP' | 'RFA' | 'Disclosure'>
  responseDeadline: '30 days' | '50 days'
  caseNotes: string

  // Generated documents
  documents: GeneratedDocument[] | null

  // Session management
  apiCallCount: number
  isLoading: boolean
  error: 'rate_limit' | 'session_limit' | 'api_error' | null
}

interface SessionContextType {
  session: SessionState
  updateSession: (updates: Partial<SessionState>) => void
}

const defaultState: SessionState = {
  petitioner: '',
  respondent: '',
  opposingCounsel: '',
  causeNumber: '',
  court: '',
  county: '',
  requestingParty: 'Petitioner',
  opposingPronoun: 'his',
  attorneyName: '',
  firmName: '',
  firmAddress: '',
  firmCityStateZip: '',
  phone: '',
  fax: '',
  barNumber: '',
  email: '',
  caseType: 'Divorce — No Children',
  modificationType: null,
  discoveryLevel: 'Level 2',
  requestTypes: [],
  responseDeadline: '30 days',
  caseNotes: '',
  documents: null,
  apiCallCount: 0,
  isLoading: false,
  error: null,
}

const SessionContext = createContext<SessionContextType | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(defaultState)

  function updateSession(updates: Partial<SessionState>) {
    setSession(prev => ({ ...prev, ...updates }))
  }

  return (
    <SessionContext.Provider value={{ session, updateSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): SessionContextType {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
