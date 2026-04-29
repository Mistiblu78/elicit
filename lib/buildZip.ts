'use client'

import JSZip from 'jszip'
import type { GeneratedDocument, SessionState } from '@/context/SessionContext'
import { buildDocx } from './buildDocx'

const FILE_NAMES: Record<string, string> = {
  interrogatories: 'Interrogatories.docx',
  rfp: 'Requests_for_Production.docx',
  rfa: 'Requests_for_Admissions.docx',
  disclosure: 'Requests_for_Disclosure.docx',
}

export async function buildZip(
  documents: GeneratedDocument[],
  session: SessionState
): Promise<Blob> {
  const zip = new JSZip()

  for (const doc of documents) {
    const blob = await buildDocx(doc, session)
    const buffer = await blob.arrayBuffer()
    const fileName = FILE_NAMES[doc.type] ?? `${doc.type}.docx`
    zip.file(fileName, buffer)
  }

  return zip.generateAsync({ type: 'blob' })
}
