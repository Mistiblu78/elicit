'use client'

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx'
import type { GeneratedDocument, SessionState } from '@/context/SessionContext'

// ─── helpers ─────────────────────────────────────────────────────────────────

function para(text: string, opts?: {
  bold?: boolean
  center?: boolean
  indentLeft?: number   // twips
  spaceBefore?: number  // twips
  spaceAfter?: number   // twips
  allCaps?: boolean
}): Paragraph {
  return new Paragraph({
    alignment: opts?.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    indent: opts?.indentLeft ? { left: opts.indentLeft } : undefined,
    spacing: {
      before: opts?.spaceBefore ?? 0,
      after: opts?.spaceAfter ?? 100,
    },
    children: [
      new TextRun({
        text,
        bold: opts?.bold ?? false,
        allCaps: opts?.allCaps ?? false,
        size: 24, // 12pt
        font: 'Times New Roman',
      }),
    ],
  })
}

function blank(): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: '', size: 24, font: 'Times New Roman' })],
    spacing: { after: 0 },
  })
}

function sectionHeading(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        underline: {},
        size: 24,
        font: 'Times New Roman',
      }),
    ],
  })
}

// ─── caption ─────────────────────────────────────────────────────────────────

const noBorder = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
}

function cell(text: string, opts?: { bold?: boolean; rightAlign?: boolean }): TableCell {
  return new TableCell({
    borders: noBorder,
    children: [
      new Paragraph({
        alignment: opts?.rightAlign ? AlignmentType.RIGHT : AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            bold: opts?.bold ?? false,
            size: 24,
            font: 'Times New Roman',
          }),
        ],
      }),
    ],
  })
}

function captionRow(left: string, showCauseNo: boolean, causeNo: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        borders: noBorder,
        width: { size: 65, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [new TextRun({ text: left, size: 24, font: 'Times New Roman' })],
          }),
        ],
      }),
      new TableCell({
        borders: noBorder,
        width: { size: 5, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: '§', size: 24, font: 'Times New Roman' })],
          }),
        ],
      }),
      new TableCell({
        borders: noBorder,
        width: { size: 30, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: showCauseNo ? `Cause No. ${causeNo}` : '',
                size: 24,
                font: 'Times New Roman',
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

function buildCaption(session: SessionState): Array<Paragraph | Table> {
  const courtLine = `IN THE ${session.court.toUpperCase()}`
  const countyLine = `${session.county.toUpperCase()} COUNTY, TEXAS`
  const isMarriage =
    session.caseType === 'Divorce — No Children' ||
    session.caseType === 'Divorce — With Children'
  const matterLine = isMarriage
    ? 'In the Matter of the Marriage of'
    : 'In the Interest of the Child(ren) Subject to This Suit'

  return [
    para(courtLine, { center: true, bold: true }),
    para(countyLine, { center: true, bold: true }),
    blank(),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      },
      rows: [
        captionRow(matterLine, false, ''),
        captionRow(`${session.petitioner},`, true, session.causeNumber),
        captionRow('', false, ''),
        captionRow('     and', false, ''),
        captionRow('', false, ''),
        captionRow(session.respondent, false, ''),
      ],
    }),
    blank(),
  ]
}

// ─── to line ─────────────────────────────────────────────────────────────────

function buildToLine(
  respondingName: string,
  pronoun: string,
  opposingCounsel: string
): Paragraph {
  return para(
    `To:  ${respondingName}, by and through ${pronoun} attorney of record, ${opposingCounsel}.`,
    { spaceAfter: 120 }
  )
}

// ─── signature block ─────────────────────────────────────────────────────────

function buildSignatureBlock(session: SessionState): Paragraph[] {
  const requestingLabel = session.requestingParty
  return [
    blank(),
    para('Respectfully submitted,', { spaceAfter: 200 }),
    para(session.firmName, { bold: true }),
    para(session.firmAddress),
    para(session.firmCityStateZip),
    para(`Phone: ${session.phone}`),
    para(`Fax: ${session.fax}`),
    blank(),
    para(`By: /s/ ${session.attorneyName}`, { spaceBefore: 80 }),
    para(session.attorneyName, { bold: true }),
    para(`Attorney for ${requestingLabel}`),
    para(`State Bar No. ${session.barNumber}`),
    para(session.email),
  ]
}

// ─── certificate of service ──────────────────────────────────────────────────

function buildCertificate(
  doc: GeneratedDocument,
  session: SessionState
): Paragraph[] {
  const certText =
    doc.certificate?.text ??
    `I certify that a true and correct copy of the foregoing was served on ${session.opposingCounsel}, attorney of record for ${session.requestingParty === 'Petitioner' ? session.respondent : session.petitioner}, on the date below.`

  return [
    blank(),
    para('CERTIFICATE OF SERVICE', { bold: true, center: true, spaceBefore: 200 }),
    blank(),
    para(certText),
    blank(),
    para(`/s/ ${session.attorneyName}`),
    para(session.attorneyName),
  ]
}

// ─── requests section (shared by all types) ───────────────────────────────────

function buildRequestsSection(
  doc: GeneratedDocument,
  headingLabel: string
): Paragraph[] {
  const paragraphs: Paragraph[] = []
  if (!doc.requests?.length) return paragraphs

  paragraphs.push(sectionHeading(headingLabel))
  paragraphs.push(blank())

  for (const section of doc.requests) {
    if (section.section) {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({
              text: section.section,
              bold: true,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
        })
      )
    }
    for (const item of section.items) {
      paragraphs.push(
        new Paragraph({
          indent: { left: 360, hanging: 360 },
          spacing: { before: 60, after: 120 },
          children: [
            new TextRun({
              text: `${item.number}.\t${item.text}`,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
        })
      )
    }
  }
  return paragraphs
}

// ─── INTERROGATORIES ─────────────────────────────────────────────────────────

function buildInterrogatoriesDoc(
  doc: GeneratedDocument,
  session: SessionState
): Array<Paragraph | Table> {
  const requestingLabel = session.requestingParty
  const respondingLabel = requestingLabel === 'Petitioner' ? 'Respondent' : 'Petitioner'
  const requestingName = requestingLabel === 'Petitioner' ? session.petitioner : session.respondent
  const respondingName = requestingLabel === 'Petitioner' ? session.respondent : session.petitioner
  const pronoun = session.opposingPronoun
  const deadline = session.responseDeadline.replace(' days', '')

  const children: Array<Paragraph | Table> = []

  // Caption
  children.push(...buildCaption(session))

  // Title
  children.push(
    para(doc.title ?? `${requestingLabel.toUpperCase()}'S WRITTEN INTERROGATORIES TO ${respondingLabel.toUpperCase()}`, {
      bold: true,
      center: true,
      spaceBefore: 120,
      spaceAfter: 120,
    })
  )

  // To line
  children.push(buildToLine(respondingName, pronoun, session.opposingCounsel))

  // Cover (exact from Texas State Bar template)
  children.push(
    para(
      `Under rules 190 and 197 of the Texas Rules of Civil Procedure, you are required to answer in complete detail and in writing each of the attached interrogatories; sign your answers to the interrogatories as required by rule 191.3(a) of the Texas Rules of Civil Procedure; swear to the truth of your answers before a notary public or other judicial officer as required by rules 191.3(a) and 197.2(d) of the Texas Rules of Civil Procedure or make an unsworn declaration as allowed by section 132.001 of the Texas Civil Practice and Remedies Code; and deliver a complete, signed copy of your answers, notarized if applicable, to the undersigned attorney within ${deadline} days following service of this request. If you fail to comply with the requirements above, the Court may order sanctions against you in accordance with the Texas Rules of Civil Procedure.`,
      { spaceAfter: 120 }
    )
  )

  // Definitions
  children.push(sectionHeading('Definitions'))
  children.push(
    para(
      '"Identity and location" means the person\'s name and present or last known address and telephone number. If any of the above information is not available, state any other means of identifying the individual.'
    )
  )
  children.push(
    para(
      '"Person" includes and is intended to mean any natural person or the representative of any entity or entities, as defined below.'
    )
  )
  children.push(
    para(
      '"Entity" or "entities" includes and is intended to mean any nonpublicly traded — a. corporation; b. company; c. limited liability company; d. firm; e. association; f. trust; g. business trust; h. partnership; i. limited partnership; j. family limited partnership; k. limited liability partnership; l. joint venture; m. proprietorship; or n. other form of business entity.'
    )
  )
  children.push(
    para(
      '"Document" includes each tangible thing, recording, or reproduction of any visual or auditory information, however made, whether handwritten, typewritten, printed, or digital, even if kept in only an electronic format, including papers; books; accounts; diaries; notes; memoranda; journals; calendars; letters and correspondence; emails; text messages; blogs; instant messages; postings, personal messages, tweets, and comments from any social media platform; logs; drawings; graphs; charts; photographs; electronic or videotape recordings; data; data compilations; and any drafts of the foregoing.'
    )
  )

  // Instructions
  children.push(sectionHeading('Instructions'))
  children.push(
    para(
      `All information that is not privileged that is in the possession, custody, or control of ${respondingName}, ${pronoun} attorney, investigators, agents, and consulting experts, as defined in the Texas Rules of Civil Procedure, employees, or other representatives of ${respondingName} is to be divulged. Possession, custody, or control of an item means that the person either has physical possession of the item or has a right to possession of the item that is equal or superior to that of the person who has physical possession of the item.`
    )
  )
  children.push(
    para(
      'If an interrogatory calls for an answer that involves more than one part, each part of the answer must be clearly set out so that it is understandable. You must precede your answer to each separate interrogatory with the question constituting the separate interrogatory.'
    )
  )

  // Option to Produce Records
  children.push(sectionHeading('Option to Produce Records'))
  children.push(
    para(
      `If the answer to an interrogatory may be derived or ascertained from public records, from your business records, or from a compilation, abstract, or summary of your business records, and the burden of deriving or ascertaining the answer is substantially the same for ${requestingLabel} as for you, you may answer the interrogatory by specifying and, if applicable, producing the records or compilation, abstract, or summary of the records. The records from which the answer may be derived or ascertained must be specified in sufficient detail to permit ${requestingLabel} to locate and identify them as readily as you can. If you have specified business records, you must state a reasonable time and place for examination of the documents. If you have produced any such records in response to a request for production and inspection or as a required disclosure pursuant to rule 194, please refer by Bates number to the document that would be responsive to the interrogatory. You must produce the documents at the time and place stated, unless otherwise agreed by the parties or ordered by the court, and must provide ${requestingLabel} a reasonable opportunity to inspect them.`,
      { spaceAfter: 120 }
    )
  )

  // Over-limit notice
  if (doc.over_limit) {
    children.push(
      para(
        `NOTE: This document contains more than 25 interrogatories. Under Level 2 discovery, the limit is 25 interrogatories including all discrete subparts. Review and remove questions as needed before serving.`,
        { bold: true, spaceAfter: 120 }
      )
    )
  }

  // Requests
  children.push(...buildRequestsSection(doc, 'INTERROGATORIES'))

  // Signature block + certificate
  children.push(...buildSignatureBlock(session))
  children.push(...buildCertificate(doc, session))

  return children
}

// ─── RFP ─────────────────────────────────────────────────────────────────────

function buildRFPDoc(
  doc: GeneratedDocument,
  session: SessionState
): Array<Paragraph | Table> {
  const requestingLabel = session.requestingParty
  const respondingLabel = requestingLabel === 'Petitioner' ? 'Respondent' : 'Petitioner'
  const requestingName = requestingLabel === 'Petitioner' ? session.petitioner : session.respondent
  const respondingName = requestingLabel === 'Petitioner' ? session.respondent : session.petitioner
  const pronoun = session.opposingPronoun
  const deadline = session.responseDeadline.replace(' days', '')

  const children: Array<Paragraph | Table> = []

  // Caption
  children.push(...buildCaption(session))

  // Title
  children.push(
    para(
      doc.title ??
        `${requestingLabel.toUpperCase()}'S REQUEST FOR PRODUCTION AND INSPECTION TO ${respondingLabel.toUpperCase()}`,
      { bold: true, center: true, spaceBefore: 120, spaceAfter: 120 }
    )
  )

  // To line
  children.push(buildToLine(respondingName, pronoun, session.opposingCounsel))

  // Cover (exact from Texas State Bar template)
  children.push(
    para(
      `${requestingName}, ${requestingLabel}, requests that ${respondingName}, ${respondingLabel}, produce for inspection and copying the items described below, at the time and place set out below.`,
      { spaceAfter: 120 }
    )
  )

  // Definitions
  children.push(sectionHeading('Definitions'))
  children.push(
    para(
      `"${respondingName}," "you," and "your" refer to and are intended to include ${respondingName}, your employees, and your agents, either individually or as a representative of any corporation, association, or partnership, as the case may be, as well as any testifying expert witnesses retained by you or retained on your behalf relating to this litigation and any consulting experts whose work product has been reviewed by, relates to, or forms the basis, either in whole or in part, of the mental impressions and opinions of any testifying experts.`
    )
  )
  children.push(
    para(
      '"Person" includes and is intended to mean any natural person or the representative of any entity or entities, as defined below.'
    )
  )
  children.push(
    para(
      '"Entity" or "entities" includes and is intended to mean any nonpublicly traded — a. corporation; b. company; c. limited liability company; d. firm; e. association; f. trust; g. business trust; h. partnership; i. limited partnership; j. family limited partnership; k. limited liability partnership; l. joint venture; m. proprietorship; or n. other form of business entity.'
    )
  )
  children.push(
    para(
      '"Relates to" means in whole or in part constitutes, contains, concerns, embodies, relates, analyzes, identifies, states, refers to, deals with, or in any way pertains to.'
    )
  )
  children.push(
    para(
      '"Item" or "document" includes each tangible thing, recording, or reproduction of any visual or auditory information, however made, whether handwritten, typewritten, printed, or digital, even if kept in only an electronic format, including papers; books; accounts; diaries; notes; memoranda; journals; calendars; letters and correspondence; emails; text messages; blogs; instant messages; postings, personal messages, tweets, and comments from any social media platform; logs; drawings; graphs; charts; photographs; electronic or videotape recordings; data; data compilations; and any drafts of the foregoing.'
    )
  )
  children.push(para('"Parties" means Petitioner or Respondent or both Petitioner and Respondent.'))

  // Instructions
  children.push(sectionHeading('Instructions'))
  children.push(
    para(
      'All information responsive to this request that is not privileged and that is in your possession, custody, or control is to be produced.'
    )
  )
  children.push(
    para(
      '"Possession, custody, or control" of an item means that the person either has physical possession of the item or has a right to possession of the item that is equal or superior to that of the person who has physical possession of the item.'
    )
  )
  children.push(
    para(
      `If any of this information is available in electronic form, you must produce this information by providing ${requestingLabel} with this information on either CD-ROM computer disks or USB flash drive (also variously known as a USB drive, USB stick, thumb drive, pen drive, jump drive, flash-disk, "memory stick," or USB memory) in an accessible format. In the alternative, you may produce these electronic documents by email or a file-hosting service (for example, Dropbox).`
    )
  )

  // Time Period
  children.push(sectionHeading('Time Period'))
  children.push(
    para(
      'The discovery requested is for documents prepared, received, or generated since ______ unless otherwise provided in this request. All requested documents, whenever actually prepared or generated, that relate to this period are to be produced.'
    )
  )

  // Documents to Be Produced
  children.push(sectionHeading('Documents to Be Produced'))
  children.push(
    para(
      `All items set forth in Exhibit A are to be produced electronically or made available for inspection, examination, and copying within ${deadline} days following service of this request at ______. You must either produce documents and tangible things as they are kept in the ordinary course of business or organize and label them to correspond with the categories in this request. If you have produced any of the items set forth in Exhibit A in response to another request for production and inspection or as a disclosure pursuant to rule 194a, please refer by Bates number to each document that would be responsive to each such request in Exhibit A.`
    )
  )

  // Amendment or Supplementation
  children.push(sectionHeading('Amendment or Supplementation of Response'))
  children.push(
    para(
      'If you learn that your response to this request was incomplete or incorrect when made or that, although it was complete and correct when made, it is no longer complete and correct, you must amend or supplement the response —'
    )
  )
  children.push(
    para('1.\tto the extent that the request seeks the identification of persons with knowledge of relevant facts, trial witnesses, or expert witnesses, and', {
      indentLeft: 360,
    })
  )
  children.push(
    para(
      '2.\tto the extent that the request seeks other information, unless the additional or corrective information has been made known to the other parties in writing, on the record at a deposition, or through other discovery responses.',
      { indentLeft: 360 }
    )
  )
  children.push(
    para(
      'You must make amended or supplemental responses reasonably promptly after you discover the necessity for such a response. Any amended or supplemental response should be provided in the same format as previously produced.'
    )
  )

  // Content of Response
  children.push(sectionHeading('Content of Response'))
  children.push(
    para(
      `With respect to each item or category of items, you must state objections and assert privileges as required by the Texas Rules of Civil Procedure and state, as appropriate, that —`
    )
  )
  children.push(
    para('1.\tproduction, inspection, or other requested action will be permitted as requested;', {
      indentLeft: 360,
    })
  )
  children.push(
    para(`2.\tthe requested items are being served on ${requestingLabel} with the response;`, {
      indentLeft: 360,
    })
  )
  children.push(
    para(
      '3.\tproduction, inspection, or other requested action will take place at a specified time and place, if you are objecting to the time and place of production; or',
      { indentLeft: 360 }
    )
  )
  children.push(
    para(
      '4.\tno items have been identified — after a diligent search — that are responsive to the request.',
      { indentLeft: 360, spaceAfter: 120 }
    )
  )

  // Exhibit A (the requests)
  children.push(...buildRequestsSection(doc, 'EXHIBIT A'))

  // Signature block + certificate
  children.push(...buildSignatureBlock(session))
  children.push(...buildCertificate(doc, session))

  return children
}

// ─── RFA ─────────────────────────────────────────────────────────────────────

function buildRFADoc(
  doc: GeneratedDocument,
  session: SessionState
): Array<Paragraph | Table> {
  const requestingLabel = session.requestingParty
  const respondingLabel = requestingLabel === 'Petitioner' ? 'Respondent' : 'Petitioner'
  const requestingName = requestingLabel === 'Petitioner' ? session.petitioner : session.respondent
  const respondingName = requestingLabel === 'Petitioner' ? session.respondent : session.petitioner
  const pronoun = session.opposingPronoun
  const deadline = session.responseDeadline.replace(' days', '')

  const children: Array<Paragraph | Table> = []

  // Caption
  children.push(...buildCaption(session))

  // Title
  children.push(
    para(
      doc.title ??
        `${requestingLabel.toUpperCase()}'S REQUESTS FOR ADMISSIONS TO ${respondingLabel.toUpperCase()}`,
      { bold: true, center: true, spaceBefore: 120, spaceAfter: 120 }
    )
  )

  // To line
  children.push(buildToLine(respondingName, pronoun, session.opposingCounsel))

  // Cover (exact from Texas State Bar template)
  children.push(
    para(
      `${requestingLabel}, ${requestingName} requests ${respondingName}, ${respondingLabel}, to admit the truth of the matters, including statements of opinion or of the application of law to fact or the genuineness of any documents served with this request, as set forth in the attachment. These requests for admissions are made under Rule 198.1 of the Texas Rules of Civil Procedure, and each of the matters of which an admission is requested shall be deemed admitted unless a response is delivered to ______ within ${deadline} days after service of this request. Unless ${respondingName} states an objection or asserts a privilege, ${respondingName} must specifically admit or deny each request or explain in detail the reasons that ${respondingName} cannot admit or deny the request. A response must fairly meet the substance of the request. ${respondingName} may qualify an answer, or deny a request in part, only when good faith requires. Lack of information or knowledge is not a proper response unless ${respondingName} states that a reasonable inquiry was made but that the information known or easily obtainable is insufficient to enable ${respondingName} to admit or deny. An assertion that the request presents an issue for trial is not a proper response.`,
      { spaceAfter: 120 }
    )
  )

  // Requests
  children.push(...buildRequestsSection(doc, 'REQUESTS FOR ADMISSIONS'))

  // Signature block + certificate
  children.push(...buildSignatureBlock(session))
  children.push(...buildCertificate(doc, session))

  return children
}

// ─── DISCLOSURE ──────────────────────────────────────────────────────────────

function buildDisclosureDoc(session: SessionState): Array<Paragraph | Table> {
  const requestingLabel = session.requestingParty
  const respondingLabel = requestingLabel === 'Petitioner' ? 'Respondent' : 'Petitioner'
  const requestingName = requestingLabel === 'Petitioner' ? session.petitioner : session.respondent
  const respondingName = requestingLabel === 'Petitioner' ? session.respondent : session.petitioner
  const pronoun = session.opposingPronoun
  const deadline = session.responseDeadline.replace(' days', '')

  const children: Array<Paragraph | Table> = []

  // Caption
  children.push(...buildCaption(session))

  // Title
  children.push(
    para(
      `${requestingLabel.toUpperCase()}'S REQUESTS FOR DISCLOSURE TO ${respondingLabel.toUpperCase()}`,
      { bold: true, center: true, spaceBefore: 120, spaceAfter: 120 }
    )
  )

  // To line
  children.push(buildToLine(respondingName, pronoun, session.opposingCounsel))

  // Cover (exact from Texas State Bar template)
  children.push(
    para(
      `Pursuant to rule 194a of the Texas Rules of Civil Procedure and subchapter B, chapter 301, Family Code, you are requested to disclose the information or material described below within ${deadline} days after service of this request. The originals or copies of documents and other tangible items requested must be produced for inspection and copying at ______ within ${deadline} days after service of this request, together with a written response. Each written response must be preceded by the request to which it applies. No objection or assertion of work product privilege is permitted to this request. If you fail to comply with this request, the court may order sanctions against you in accordance with the Texas Rules of Civil Procedure. Your response must be signed.`,
      { spaceAfter: 120 }
    )
  )

  // Requests for Disclosure heading
  children.push(sectionHeading('REQUESTS FOR DISCLOSURE'))
  children.push(blank())

  // All 11 items — exact from Texas State Bar template
  const items: string[] = [
    'State the correct names of the parties to the lawsuit.',
    'State the names, addresses, and telephone numbers of any potential parties.',
    `State the legal theories and, in general, the factual bases for the claims or defenses of ${respondingName}. (You need not marshal or compile all evidence that may be offered at trial.)`,
    'State the amount and any method of calculating economic damages.',
    "State the names, addresses, and telephone numbers of persons having knowledge of relevant facts, and give a brief statement of each identified person's connection with the case.",
    `For any testifying expert — a. state the expert's name, address, and telephone number; b. state the subject matter on which the expert will testify; c. state the general substance of the expert's mental impressions and opinions and a brief summary of the basis for them or, if the expert is not retained by, employed by, or otherwise subject to the control of ${respondingName}, documents reflecting such information; d. if an expert is retained by, employed by, or otherwise subject to the control of ${respondingName}, produce the originals or copies of the following: i. all documents, tangible things, reports, models, or data compilations that have been provided to, reviewed by, or prepared by or for the expert in anticipation of the expert's testimony; and ii. the expert's current resume and bibliography.`,
    'Produce the originals or copies of any settlement agreements described in Rule 192.3(g) of the Texas Rules of Civil Procedure. Rule 192.3(g) provides in part as follows: Settlement Agreements. A party may obtain discovery of the existence and contents of any relevant portions of a settlement agreement.',
    "Produce the originals or copies of any discoverable witness statements described in Rule 192.3(h) of the Texas Rules of Civil Procedure. Rule 192.3(h) provides in part as follows: Statements of Persons with Knowledge of Relevant Facts. A party may obtain discovery of the statement of any person with knowledge of relevant facts — a \"witness statement\" — regardless of when the statement was made. A witness statement is (1) a written statement signed or otherwise adopted or approved in writing by the person making it, or (2) a stenographic, mechanical, electrical, or other type of recording of a witness's oral statement, or any substantially verbatim transcription of such a recording. Any person may obtain, upon written request, his or her own statement concerning the lawsuit, which is in the possession, custody or control of any party.",
    'Produce the originals or copies of (a) all medical records and bills that are reasonably related to the injuries or damages asserted or (b) an authorization permitting the disclosure of such medical records and bills.',
    `Produce the originals or copies of all medical records and bills obtained by ${respondingName} by virtue of an authorization furnished by ${requestingName}.`,
    'State the name, address, and telephone number of any person who may be designated as a responsible third party.',
  ]

  items.forEach((text, i) => {
    children.push(
      new Paragraph({
        indent: { left: 360, hanging: 360 },
        spacing: { before: 60, after: 120 },
        children: [
          new TextRun({ text: `${i + 1}.\t${text}`, size: 24, font: 'Times New Roman' }),
        ],
      })
    )
  })

  // Signature block + certificate
  children.push(...buildSignatureBlock(session))

  // Certificate
  const certText = `I certify that a true and correct copy of the foregoing ${requestingLabel}'s Requests for Disclosure to ${respondingLabel} was served on ${session.opposingCounsel}, attorney of record for ${respondingName}, on the date below.`
  children.push(blank())
  children.push(para('CERTIFICATE OF SERVICE', { bold: true, center: true, spaceBefore: 200 }))
  children.push(blank())
  children.push(para(certText))
  children.push(blank())
  children.push(para(`/s/ ${session.attorneyName}`))
  children.push(para(session.attorneyName))

  return children
}

// ─── main export ─────────────────────────────────────────────────────────────

export async function buildDocx(
  doc: GeneratedDocument,
  session: SessionState
): Promise<Blob> {
  let children: Array<Paragraph | Table>

  switch (doc.type) {
    case 'interrogatories':
      children = buildInterrogatoriesDoc(doc, session)
      break
    case 'rfp':
      children = buildRFPDoc(doc, session)
      break
    case 'rfa':
      children = buildRFADoc(doc, session)
      break
    case 'disclosure':
      children = buildDisclosureDoc(session)
      break
    default:
      children = [para('Unknown document type.')]
  }

  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  })

  return Packer.toBlob(document)
}
