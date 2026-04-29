'use client'

import { useSession } from '@/context/SessionContext'

const CASE_TYPES = [
  'Divorce — No Children',
  'Divorce — With Children',
  'Original SAPCR',
  'Modification',
] as const

const MODIFICATION_TYPES = [
  'Conservatorship/Possession',
  'Child Support',
  'Both',
] as const

const DISCOVERY_LEVELS = ['Level 1', 'Level 2', 'Level 3'] as const

type RequestType = 'Interrogatories' | 'RFP' | 'RFA' | 'Disclosure'

const REQUEST_TYPE_OPTIONS: { label: string; value: RequestType }[] = [
  { label: 'Interrogatories', value: 'Interrogatories' },
  { label: 'Requests for Production', value: 'RFP' },
  { label: 'Requests for Admissions', value: 'RFA' },
  { label: 'Requests for Disclosure', value: 'Disclosure' },
]

const COMPLEX_CASE_TYPES: Array<typeof CASE_TYPES[number]> = [
  'Divorce — With Children',
  'Original SAPCR',
  'Modification',
]

export default function CaseDetailsForm() {
  const { session, updateSession } = useSession()

  const selectClass =
    'w-full border border-light-blue rounded px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:border-navy'
  const labelClass = 'block text-sm font-medium text-navy mb-1'

  function handleCaseTypeChange(value: typeof CASE_TYPES[number]) {
    const updates: Parameters<typeof updateSession>[0] = { caseType: value }
    if (value !== 'Modification') {
      updates.modificationType = null
    }
    updateSession(updates)
  }

  function toggleRequestType(type: RequestType) {
    const current = session.requestTypes
    if (current.includes(type)) {
      updateSession({ requestTypes: current.filter(t => t !== type) })
    } else {
      updateSession({ requestTypes: [...current, type] })
    }
  }

  const showInterrogatoryWarning =
    session.requestTypes.includes('Interrogatories') &&
    COMPLEX_CASE_TYPES.includes(session.caseType)

  return (
    <div className="space-y-5">

      {/* Case type */}
      <div>
        <label className={labelClass}>Case type</label>
        <select
          value={session.caseType}
          onChange={e => handleCaseTypeChange(e.target.value as typeof CASE_TYPES[number])}
          className={selectClass}
        >
          {CASE_TYPES.map(ct => (
            <option key={ct} value={ct}>{ct}</option>
          ))}
        </select>
      </div>

      {/* Modification sub-type — shown only when caseType === 'Modification' */}
      {session.caseType === 'Modification' && (
        <div>
          <label className={labelClass}>Modification type</label>
          <select
            value={session.modificationType ?? ''}
            onChange={e =>
              updateSession({
                modificationType: e.target.value as typeof MODIFICATION_TYPES[number],
              })
            }
            className={selectClass}
          >
            <option value="" disabled>Select modification type</option>
            {MODIFICATION_TYPES.map(mt => (
              <option key={mt} value={mt}>{mt}</option>
            ))}
          </select>
        </div>
      )}

      {/* Discovery level */}
      <div>
        <label className={labelClass}>Discovery level</label>
        <select
          value={session.discoveryLevel}
          onChange={e =>
            updateSession({ discoveryLevel: e.target.value as typeof DISCOVERY_LEVELS[number] })
          }
          className={selectClass}
        >
          {DISCOVERY_LEVELS.map(dl => (
            <option key={dl} value={dl}>{dl}</option>
          ))}
        </select>
      </div>

      {/* Request types */}
      <div>
        <label className={labelClass}>Request types (select at least one)</label>
        <div className="space-y-2">
          {REQUEST_TYPE_OPTIONS.map(({ label, value }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={session.requestTypes.includes(value)}
                onChange={() => toggleRequestType(value)}
                className="h-4 w-4 rounded border-gray-300 text-navy accent-navy"
              />
              <span className="text-sm text-navy">{label}</span>
            </label>
          ))}
        </div>

        {/* Soft interrogatory warning — non-blocking, small gray helper text */}
        {showInterrogatoryWarning && (
          <p className="mt-2 text-xs text-gray-muted">
            Complex family law cases can generate more than 25 interrogatories. Claude will flag any excess in the document — review before serving.
          </p>
        )}
      </div>

      {/* Response deadline */}
      <div>
        <label className={labelClass}>Response deadline</label>
        <div className="flex gap-4">
          {(['30 days', '50 days'] as const).map(deadline => (
            <label key={deadline} className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="responseDeadline"
                value={deadline}
                checked={session.responseDeadline === deadline}
                onChange={() => updateSession({ responseDeadline: deadline })}
                className="h-4 w-4 border-gray-300 text-navy accent-navy"
              />
              <span className="text-sm text-navy">{deadline}</span>
            </label>
          ))}
        </div>
      </div>

    </div>
  )
}
