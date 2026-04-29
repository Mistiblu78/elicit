'use client'

import { useSession } from '@/context/SessionContext'

const EXAMPLE_TEXT =
  '[PETITIONER] and [RESPONDENT] were married in [COUNTY] County on [DATE] and have one minor child, [CHILD], age 7. [RESPONDENT] is self-employed through [BUSINESS] and [PETITIONER] alleges [RESPONDENT] has underreported income for the past two years. [PETITIONER] also alleges [RESPONDENT] has a documented history of family violence under TFC §71.004, supported by a prior protective order obtained in [COUNTY] County in [DATE].'

const PLACEHOLDERS = [
  '[PETITIONER]',
  '[RESPONDENT]',
  '[CHILD]',
  '[CHILDREN]',
  '[OPPOSING COUNSEL]',
  '[ATTORNEY]',
  '[FIRM]',
  '[FIRM ADDRESS]',
  '[FIRM CITY STATE ZIP]',
  '[PHONE]',
  '[FAX]',
  '[BAR NO.]',
  '[EMAIL]',
  '[COURT]',
  '[COUNTY]',
  '[CAUSE NO.]',
  '[PARTY REPRESENTED]',
  '[OPPOSING PRONOUN]',
  '[DATE]',
  '[AMOUNT]',
  '[BUSINESS]',
  '[EXHIBIT]',
  '[RESPONSE DEADLINE]',
]

const MAX_CHARS = 2000

export default function CaseNotesField() {
  const { session, updateSession } = useSession()

  // Initialize with example text on first render if caseNotes is empty
  const value = session.caseNotes === '' ? EXAMPLE_TEXT : session.caseNotes
  const count = value.length
  const isOverLimit = count > MAX_CHARS
  const isNearLimit = count === MAX_CHARS

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    updateSession({ caseNotes: e.target.value })
  }

  // If caseNotes is still the empty string default, show example text in state
  // so the session reflects it (needed for validation)
  function handleFocus() {
    if (session.caseNotes === '') {
      updateSession({ caseNotes: EXAMPLE_TEXT })
    }
  }

  const textareaClass = [
    'w-full border rounded px-3 py-2 text-sm focus:outline-none resize-y min-h-[160px]',
    isOverLimit
      ? 'border-red-500 focus:border-red-500'
      : 'border-gray-300 focus:border-navy',
  ].join(' ')

  return (
    <div className="space-y-3">

      {/* Textarea */}
      <textarea
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        className={textareaClass}
        rows={7}
        maxLength={2500}
        aria-label="Case notes"
      />

      {/* Character counter + inline warnings */}
      <div className="flex justify-between items-start">
        <div className="text-xs text-gray-muted">
          {isOverLimit && (
            <span className="text-red-500 font-medium">
              Case notes must be 2000 characters or fewer.
            </span>
          )}
          {isNearLimit && !isOverLimit && (
            <span className="text-yellow-600">
              Approaching the 2000-character limit.
            </span>
          )}
        </div>
        <span className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-muted'}`}>
          {count}/2000
        </span>
      </div>

      {/* Available placeholders */}
      <div>
        <p className="text-xs text-gray-muted mb-1 font-medium">Available placeholders:</p>
        <div className="flex flex-wrap gap-1">
          {PLACEHOLDERS.map(p => (
            <span
              key={p}
              className="inline-block bg-light-blue/30 text-navy text-xs px-1.5 py-0.5 rounded font-mono"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

    </div>
  )
}
