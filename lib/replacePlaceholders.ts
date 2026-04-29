'use client'

import type { SessionState, GeneratedDocument } from '@/context/SessionContext'

export function replacePlaceholders(text: string, session: SessionState): string {
  const deadline = session.responseDeadline.replace(' days', '')
  const today = new Date().toLocaleDateString('en-US')
  const map: Record<string, string> = {
    '[PETITIONER]': session.petitioner,
    '[RESPONDENT]': session.respondent,
    '[CHILD]': '',
    '[CHILDREN]': '',
    '[OPPOSING COUNSEL]': session.opposingCounsel,
    '[ATTORNEY]': session.attorneyName,
    '[FIRM]': session.firmName,
    '[FIRM ADDRESS]': session.firmAddress,
    '[FIRM CITY STATE ZIP]': session.firmCityStateZip,
    '[PHONE]': session.phone,
    '[FAX]': session.fax,
    '[BAR NO.]': session.barNumber,
    '[EMAIL]': session.email,
    '[COURT]': session.court,
    '[COUNTY]': session.county,
    '[CAUSE NO.]': session.causeNumber,
    '[PARTY REPRESENTED]': session.requestingParty,
    '[OPPOSING PRONOUN]': session.opposingPronoun,
    '[DATE]': today,
    '[AMOUNT]': '',
    '[BUSINESS]': '',
    '[EXHIBIT]': '',
    '[RESPONSE DEADLINE]': deadline,
  }
  return Object.entries(map).reduce(
    (acc, [k, v]) => acc.replaceAll(k, v ?? ''),
    text
  )
}

export function replaceInDocument(
  doc: GeneratedDocument,
  session: SessionState
): GeneratedDocument {
  if (doc.type === 'disclosure') return { type: 'disclosure' }

  const r = (s: string) => replacePlaceholders(s, session)
  const sb = doc.signature_block
  const cert = doc.certificate

  return {
    type: doc.type,
    title: doc.title ? r(doc.title) : undefined,
    requests: doc.requests?.map(section => ({
      section: r(section.section),
      items: section.items.map(item => ({
        number: item.number,
        text: r(item.text),
      })),
    })),
    signature_block: sb
      ? {
          firm: r(sb.firm),
          address: r(sb.address),
          city_state_zip: r(sb.city_state_zip),
          phone: r(sb.phone),
          fax: r(sb.fax),
          attorney: r(sb.attorney),
          party_represented: r(sb.party_represented),
          bar_no: r(sb.bar_no),
          email: r(sb.email),
        }
      : undefined,
    certificate: cert
      ? { text: r(cert.text), attorney: r(cert.attorney) }
      : undefined,
    review_notice: doc.review_notice ? r(doc.review_notice) : undefined,
    interrogatory_count: doc.interrogatory_count ?? null,
    over_limit: doc.over_limit ?? false,
  }
}
