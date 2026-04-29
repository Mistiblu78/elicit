'use client'

import type { GeneratedDocument, SessionState } from '@/context/SessionContext'

const TYPE_LABELS: Record<string, string> = {
  interrogatories: 'Interrogatories',
  rfp: 'Requests for Production',
  rfa: 'Requests for Admissions',
  disclosure: 'Requests for Disclosure',
}

interface DownloadControlsProps {
  activeDoc: GeneratedDocument
  session: SessionState
  reviewChecked: boolean
  onDownloadSingle?: () => void
  onDownloadAll?: () => void
}

function buildPlainText(doc: GeneratedDocument, session: SessionState): string {
  if (doc.type === 'disclosure') {
    const respondingLabel = session.requestingParty === 'Petitioner' ? 'Respondent' : 'Petitioner'
    const respondingName = session.requestingParty === 'Petitioner' ? session.respondent : session.petitioner
    const deadline = session.responseDeadline.replace(' days', '')
    const lines = [
      `${session.requestingParty.toUpperCase()}'S REQUESTS FOR DISCLOSURE TO ${respondingLabel.toUpperCase()}`,
      '',
      `To:  ${respondingName}, by and through ${session.opposingPronoun} attorney of record, ${session.opposingCounsel}.`,
      '',
      `Pursuant to rule 194a of the Texas Rules of Civil Procedure and subchapter B, chapter 301, Family Code, you are requested to disclose the information or material described below within ${deadline} days after service of this request.`,
      '',
      'REQUESTS FOR DISCLOSURE',
      '',
      '1. State the correct names of the parties to the lawsuit.',
      '2. State the names, addresses, and telephone numbers of any potential parties.',
      `3. State the legal theories and, in general, the factual bases for the claims or defenses of ${respondingName}.`,
      '4. State the amount and any method of calculating economic damages.',
      "5. State the names, addresses, and telephone numbers of persons having knowledge of relevant facts, and give a brief statement of each identified person's connection with the case.",
      "6. For any testifying expert — a. state the expert's name, address, and telephone number; b. state the subject matter on which the expert will testify; c. state the general substance of the expert's mental impressions and opinions and a brief summary of the basis for them.",
      '7. Produce the originals or copies of any settlement agreements described in Rule 192.3(g) of the Texas Rules of Civil Procedure.',
      '8. Produce the originals or copies of any discoverable witness statements described in Rule 192.3(h) of the Texas Rules of Civil Procedure.',
      '9. Produce the originals or copies of (a) all medical records and bills that are reasonably related to the injuries or damages asserted or (b) an authorization permitting the disclosure of such medical records and bills.',
      `10. Produce the originals or copies of all medical records and bills obtained by ${respondingName} by virtue of an authorization furnished by the requesting party.`,
      '11. State the name, address, and telephone number of any person who may be designated as a responsible third party.',
    ]
    return lines.join('\n')
  }

  const lines: string[] = []
  if (doc.title) { lines.push(doc.title); lines.push('') }

  for (const section of doc.requests ?? []) {
    if (section.section) { lines.push(section.section.toUpperCase()); lines.push('') }
    for (const item of section.items) {
      lines.push(`${item.number}. ${item.text}`)
      lines.push('')
    }
  }

  return lines.join('\n')
}

export default function DownloadControls({
  activeDoc,
  session,
  reviewChecked,
  onDownloadSingle,
  onDownloadAll,
}: DownloadControlsProps) {
  const label = TYPE_LABELS[activeDoc.type] ?? activeDoc.type
  const disabledCls = !reviewChecked ? 'opacity-40 pointer-events-none' : ''

  function copyToClipboard() {
    const text = buildPlainText(activeDoc, session)
    navigator.clipboard.writeText(text).catch(() => {})
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={onDownloadSingle}
        className={`px-4 py-2 bg-navy text-white text-sm rounded-md font-medium hover:bg-navy/90 transition-colors ${disabledCls}`}
      >
        Download {label}
      </button>
      <button
        onClick={onDownloadAll}
        className={`px-4 py-2 border border-navy text-navy text-sm rounded-md font-medium hover:bg-navy/10 transition-colors ${disabledCls}`}
      >
        Download all (.zip)
      </button>
      <button
        onClick={copyToClipboard}
        className="ml-auto px-4 py-2 text-gray-muted text-sm hover:text-navy transition-colors"
      >
        Copy to clipboard
      </button>
    </div>
  )
}
