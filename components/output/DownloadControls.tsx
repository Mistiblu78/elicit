'use client'

import { useState } from 'react'
import type { GeneratedDocument, SessionState } from '@/context/SessionContext'
import { buildDocx } from '@/lib/buildDocx'
import { buildZip } from '@/lib/buildZip'

const TYPE_LABELS: Record<string, string> = {
  interrogatories: 'Interrogatories',
  rfp: 'Requests for Production',
  rfa: 'Requests for Admissions',
  disclosure: 'Requests for Disclosure',
}

const FILE_NAMES: Record<string, string> = {
  interrogatories: 'Interrogatories.docx',
  rfp: 'Requests_for_Production.docx',
  rfa: 'Requests_for_Admissions.docx',
  disclosure: 'Requests_for_Disclosure.docx',
}

interface DownloadControlsProps {
  activeDoc: GeneratedDocument
  allDocs: GeneratedDocument[]
  session: SessionState
  reviewChecked: boolean
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function buildPlainText(doc: GeneratedDocument, session: SessionState): string {
  if (doc.type === 'disclosure') {
    const respondingLabel = session.requestingParty === 'Petitioner' ? 'Respondent' : 'Petitioner'
    const respondingName =
      session.requestingParty === 'Petitioner' ? session.respondent : session.petitioner
    const deadline = session.responseDeadline.replace(' days', '')
    return [
      `${session.requestingParty.toUpperCase()}'S REQUESTS FOR DISCLOSURE TO ${respondingLabel.toUpperCase()}`,
      '',
      `To:  ${respondingName}, by and through ${session.opposingPronoun} attorney of record, ${session.opposingCounsel}.`,
      '',
      `Pursuant to rule 194a of the Texas Rules of Civil Procedure, you are requested to disclose the information or material described below within ${deadline} days after service of this request.`,
      '',
      'REQUESTS FOR DISCLOSURE',
      '',
      '1. State the correct names of the parties to the lawsuit.',
      '2. State the names, addresses, and telephone numbers of any potential parties.',
      `3. State the legal theories and factual bases for the claims or defenses of ${respondingName}.`,
      '4. State the amount and any method of calculating economic damages.',
      "5. State the names, addresses, and telephone numbers of persons having knowledge of relevant facts.",
      '6. For any testifying expert — state name, address, phone, subject matter, mental impressions and opinions, and produce documents reviewed by the expert.',
      '7. Produce any settlement agreements described in Rule 192.3(g).',
      '8. Produce any discoverable witness statements described in Rule 192.3(h).',
      '9. Produce all medical records and bills reasonably related to the injuries or damages asserted.',
      `10. Produce all medical records and bills obtained by ${respondingName} by virtue of an authorization furnished by the requesting party.`,
      '11. State the name, address, and telephone number of any person who may be designated as a responsible third party.',
    ].join('\n')
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
  allDocs,
  session,
  reviewChecked,
}: DownloadControlsProps) {
  const [downloadingOne, setDownloadingOne] = useState(false)
  const [downloadingAll, setDownloadingAll] = useState(false)

  const label = TYPE_LABELS[activeDoc.type] ?? activeDoc.type
  const disabledCls = !reviewChecked ? 'opacity-40 pointer-events-none' : ''

  async function handleDownloadSingle() {
    if (!reviewChecked) return
    setDownloadingOne(true)
    try {
      const blob = await buildDocx(activeDoc, session)
      const fileName = FILE_NAMES[activeDoc.type] ?? `${activeDoc.type}.docx`
      triggerDownload(blob, fileName)
    } finally {
      setDownloadingOne(false)
    }
  }

  async function handleDownloadAll() {
    if (!reviewChecked) return
    setDownloadingAll(true)
    try {
      const blob = await buildZip(allDocs, session)
      triggerDownload(blob, 'Elicit_Discovery_Documents.zip')
    } finally {
      setDownloadingAll(false)
    }
  }

  function copyToClipboard() {
    const text = buildPlainText(activeDoc, session)
    navigator.clipboard.writeText(text).catch(() => {})
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handleDownloadSingle}
        disabled={downloadingOne}
        className={`px-4 py-2 bg-navy text-white text-sm rounded-md font-medium hover:bg-navy/90 transition-colors disabled:opacity-60 disabled:cursor-wait ${disabledCls}`}
      >
        {downloadingOne ? 'Preparing...' : `Download ${label}`}
      </button>
      <button
        onClick={handleDownloadAll}
        disabled={downloadingAll}
        className={`px-4 py-2 border border-navy text-navy text-sm rounded-md font-medium hover:bg-navy/10 transition-colors disabled:opacity-60 disabled:cursor-wait ${disabledCls}`}
      >
        {downloadingAll ? 'Preparing zip...' : 'Download all (.zip)'}
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
