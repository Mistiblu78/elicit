'use client'

import type { GeneratedDocument, SessionState } from '@/context/SessionContext'

interface DocumentViewerProps {
  doc: GeneratedDocument
  session: SessionState
}

function CaptionBlock({ session }: { session: SessionState }) {
  const isMarriage =
    session.caseType === 'Divorce — No Children' ||
    session.caseType === 'Divorce — With Children'
  const requestingName =
    session.requestingParty === 'Petitioner' ? session.petitioner : session.respondent
  const matterLine = isMarriage
    ? 'In the Matter of the Marriage of'
    : 'In the Interest of the Child(ren) Subject to This Suit'

  return (
    <div className="mb-4">
      <p className="text-center font-bold">IN THE {session.court.toUpperCase()} COURT</p>
      <p className="text-center font-bold">{session.county.toUpperCase()} COUNTY, TEXAS</p>
      <table className="w-full mt-2 text-sm">
        <tbody>
          <tr>
            <td className="w-3/5 align-top">{matterLine}</td>
            <td className="w-8 text-center align-top">§</td>
            <td className="align-top"></td>
          </tr>
          <tr>
            <td className="align-top">{requestingName},</td>
            <td className="text-center align-top">§</td>
            <td className="align-top">Cause No. {session.causeNumber}</td>
          </tr>
          <tr>
            <td></td>
            <td className="text-center">§</td>
            <td></td>
          </tr>
          <tr>
            <td className="pl-6">and</td>
            <td className="text-center">§</td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td className="text-center">§</td>
            <td></td>
          </tr>
          <tr>
            <td className="align-top">
              {session.requestingParty === 'Petitioner' ? session.respondent : session.petitioner}
            </td>
            <td className="text-center align-top">§</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function SectionHeading({ text }: { text: string }) {
  return <p className="font-bold underline mt-4 mb-1">{text}</p>
}

function RequestsSection({
  doc,
  headingLabel,
}: {
  doc: GeneratedDocument
  headingLabel: string
}) {
  if (!doc.requests?.length) return null
  return (
    <>
      <SectionHeading text={headingLabel} />
      {doc.requests.map((section, si) => (
        <div key={si}>
          {section.section && (
            <p className="font-bold mt-3 mb-1">{section.section}</p>
          )}
          {section.items.map(item => (
            <p key={item.number} className="mb-2 pl-6 -indent-6">
              <span className="font-medium">{item.number}.</span>&nbsp;{item.text}
            </p>
          ))}
        </div>
      ))}
    </>
  )
}

function SignatureBlock({ session }: { session: SessionState }) {
  return (
    <div className="mt-6">
      <p>Respectfully submitted,</p>
      <p className="font-bold mt-3">{session.firmName}</p>
      <p>{session.firmAddress}</p>
      <p>{session.firmCityStateZip}</p>
      <p>Phone: {session.phone}</p>
      <p>Fax: {session.fax}</p>
      <p className="mt-4">By: /s/ {session.attorneyName}</p>
      <p className="font-bold">{session.attorneyName}</p>
      <p>Attorney for {session.requestingParty}</p>
      <p>State Bar No. {session.barNumber}</p>
      <p>{session.email}</p>
    </div>
  )
}

function CertificateBlock({
  doc,
  session,
}: {
  doc: GeneratedDocument
  session: SessionState
}) {
  const respondingName =
    session.requestingParty === 'Petitioner' ? session.respondent : session.petitioner
  const defaultText = `I certify that a true and correct copy of the foregoing was served on ${session.opposingCounsel}, attorney of record for ${respondingName}, on the date below.`
  const text = doc.certificate?.text ?? defaultText

  return (
    <div className="mt-6">
      <p className="font-bold text-center">CERTIFICATE OF SERVICE</p>
      <p className="mt-2">{text}</p>
      <p className="mt-3">/s/ {session.attorneyName}</p>
      <p>{doc.certificate?.attorney ?? session.attorneyName}</p>
    </div>
  )
}

function InterrogatoriesContent({
  doc,
  session,
}: {
  doc: GeneratedDocument
  session: SessionState
}) {
  const requestingLabel = session.requestingParty
  const respondingLabel = requestingLabel === 'Petitioner' ? 'Respondent' : 'Petitioner'
  const requestingName =
    requestingLabel === 'Petitioner' ? session.petitioner : session.respondent
  const respondingName =
    requestingLabel === 'Petitioner' ? session.respondent : session.petitioner
  const pronoun = session.opposingPronoun
  const deadline = session.responseDeadline.replace(' days', '')

  return (
    <>
      <p className="font-bold text-center mt-2 mb-2">{doc.title}</p>
      <p className="mb-3">
        To:&nbsp;&nbsp;{respondingName}, by and through {pronoun} attorney of record,{' '}
        {session.opposingCounsel}.
      </p>
      {doc.over_limit && (
        <p className="font-bold mb-3 text-red-700">
          NOTE: This document contains more than 25 interrogatories. Under Level 2 discovery, the
          limit is 25 interrogatories including all discrete subparts. Review and remove questions
          as needed before serving.
        </p>
      )}
      <p className="mb-3">
        Under rules 190 and 197 of the Texas Rules of Civil Procedure, you are required to answer
        in complete detail and in writing each of the attached interrogatories; sign your answers
        as required by rule 191.3(a); swear to the truth of your answers before a notary public as
        required by rules 191.3(a) and 197.2(d); and deliver a complete, signed copy of your
        answers to the undersigned attorney within {deadline} days following service of this
        request. If you fail to comply, the Court may order sanctions against you.
      </p>
      <SectionHeading text="Definitions" />
      <p className="mb-2">
        &ldquo;Identity and location&rdquo; means the person&rsquo;s name and present or last known
        address and telephone number.
      </p>
      <p className="mb-2">
        &ldquo;Person&rdquo; includes any natural person or representative of any entity or
        entities.
      </p>
      <p className="mb-2">
        &ldquo;Entity&rdquo; or &ldquo;entities&rdquo; includes any nonpublicly traded corporation,
        company, LLC, firm, association, trust, partnership, limited partnership, joint venture,
        proprietorship, or other business entity.
      </p>
      <p className="mb-2">
        &ldquo;Document&rdquo; includes each tangible thing, recording, or reproduction of any
        visual or auditory information, however made, whether handwritten, typewritten, printed, or
        digital, including papers, emails, text messages, social media posts, logs, photographs,
        electronic recordings, data compilations, and any drafts thereof.
      </p>
      <SectionHeading text="Instructions" />
      <p className="mb-2">
        All information not privileged that is in the possession, custody, or control of{' '}
        {respondingName}, {pronoun} attorney, investigators, agents, and employees is to be
        divulged.
      </p>
      <p className="mb-2">
        If an interrogatory calls for an answer involving more than one part, each part must be
        clearly set out. You must precede your answer to each interrogatory with the question.
      </p>
      <SectionHeading text="Option to Produce Records" />
      <p className="mb-3">
        If the answer may be derived from business records, you may answer by specifying and
        producing those records in sufficient detail to permit {requestingLabel} to locate and
        identify them. You must produce the documents at a reasonable time and place.
      </p>
      <RequestsSection doc={doc} headingLabel="INTERROGATORIES" />
      <SignatureBlock session={session} />
      <CertificateBlock doc={doc} session={session} />
    </>
  )
}

function RFPContent({ doc, session }: { doc: GeneratedDocument; session: SessionState }) {
  const requestingLabel = session.requestingParty
  const respondingLabel = requestingLabel === 'Petitioner' ? 'Respondent' : 'Petitioner'
  const requestingName =
    requestingLabel === 'Petitioner' ? session.petitioner : session.respondent
  const respondingName =
    requestingLabel === 'Petitioner' ? session.respondent : session.petitioner
  const pronoun = session.opposingPronoun
  const deadline = session.responseDeadline.replace(' days', '')

  return (
    <>
      <p className="font-bold text-center mt-2 mb-2">{doc.title}</p>
      <p className="mb-3">
        To:&nbsp;&nbsp;{respondingName}, by and through {pronoun} attorney of record,{' '}
        {session.opposingCounsel}.
      </p>
      <p className="mb-3">
        {requestingName}, {requestingLabel}, requests that {respondingName}, {respondingLabel},
        produce for inspection and copying the items described below at the time and place set out
        below.
      </p>
      <SectionHeading text="Definitions" />
      <p className="mb-2">
        &ldquo;{respondingName},&rdquo; &ldquo;you,&rdquo; and &ldquo;your&rdquo; refer to{' '}
        {respondingName}, your employees, agents, and any testifying or consulting experts retained
        on your behalf.
      </p>
      <p className="mb-2">
        &ldquo;Person&rdquo; includes any natural person or representative of any entity.
      </p>
      <p className="mb-2">
        &ldquo;Entity&rdquo; includes any nonpublicly traded corporation, LLC, firm, association,
        trust, partnership, joint venture, or other business entity.
      </p>
      <p className="mb-2">
        &ldquo;Relates to&rdquo; means in whole or in part constitutes, contains, concerns,
        embodies, relates, analyzes, identifies, states, refers to, deals with, or pertains to.
      </p>
      <p className="mb-2">
        &ldquo;Item&rdquo; or &ldquo;document&rdquo; includes each tangible thing or reproduction
        of any information, whether handwritten, typewritten, printed, or digital, including papers,
        emails, text messages, social media, logs, photographs, electronic recordings, data
        compilations, and any drafts thereof.
      </p>
      <p className="mb-2">&ldquo;Parties&rdquo; means Petitioner or Respondent or both.</p>
      <SectionHeading text="Instructions" />
      <p className="mb-2">
        All information responsive to this request that is not privileged and that is in your
        possession, custody, or control is to be produced.
      </p>
      <p className="mb-2">
        If any information is available in electronic form, you must produce it on CD-ROM, USB
        drive, by email, or via a file-hosting service in an accessible format.
      </p>
      <SectionHeading text="Time Period" />
      <p className="mb-3">
        The discovery requested is for documents prepared, received, or generated since ______ unless
        otherwise provided in this request.
      </p>
      <SectionHeading text="Documents to Be Produced" />
      <p className="mb-3">
        All items set forth in Exhibit A are to be produced electronically or made available for
        inspection and copying within {deadline} days following service of this request. You must
        produce documents as kept in the ordinary course of business or organize and label them to
        correspond with the categories in this request.
      </p>
      <SectionHeading text="Amendment or Supplementation of Response" />
      <p className="mb-1">
        If you learn your response was incomplete or incorrect, you must amend or supplement it —
      </p>
      <p className="mb-1 pl-6">
        1. to the extent the request seeks identification of persons with knowledge, trial witnesses,
        or expert witnesses, and
      </p>
      <p className="mb-3 pl-6">
        2. to the extent the request seeks other information, unless additional information has been
        made known to other parties in writing or on the record.
      </p>
      <SectionHeading text="Content of Response" />
      <p className="mb-1">
        With respect to each item or category, you must state objections and assert privileges as
        required and state, as appropriate, that —
      </p>
      <p className="mb-1 pl-6">1. production will be permitted as requested;</p>
      <p className="mb-1 pl-6">
        2. the requested items are being served on {requestingLabel} with the response;
      </p>
      <p className="mb-1 pl-6">
        3. production will take place at a specified time and place; or
      </p>
      <p className="mb-3 pl-6">
        4. no items have been identified — after a diligent search — that are responsive to the
        request.
      </p>
      <RequestsSection doc={doc} headingLabel="EXHIBIT A" />
      <SignatureBlock session={session} />
      <CertificateBlock doc={doc} session={session} />
    </>
  )
}

function RFAContent({ doc, session }: { doc: GeneratedDocument; session: SessionState }) {
  const requestingLabel = session.requestingParty
  const respondingLabel = requestingLabel === 'Petitioner' ? 'Respondent' : 'Petitioner'
  const requestingName =
    requestingLabel === 'Petitioner' ? session.petitioner : session.respondent
  const respondingName =
    requestingLabel === 'Petitioner' ? session.respondent : session.petitioner
  const pronoun = session.opposingPronoun
  const deadline = session.responseDeadline.replace(' days', '')

  return (
    <>
      <p className="font-bold text-center mt-2 mb-2">{doc.title}</p>
      <p className="mb-3">
        To:&nbsp;&nbsp;{respondingName}, by and through {pronoun} attorney of record,{' '}
        {session.opposingCounsel}.
      </p>
      <p className="mb-3">
        {requestingLabel}, {requestingName} requests {respondingName}, {respondingLabel}, to admit
        the truth of the matters, including statements of opinion or of the application of law to
        fact or the genuineness of any documents served with this request, as set forth in the
        attachment. These requests for admissions are made under Rule 198.1 of the Texas Rules of
        Civil Procedure, and each of the matters of which an admission is requested shall be deemed
        admitted unless a response is delivered within {deadline} days after service of this
        request. Unless {respondingName} states an objection or asserts a privilege,{' '}
        {respondingName} must specifically admit or deny each request or explain in detail the
        reasons that {respondingName} cannot admit or deny the request.
      </p>
      <RequestsSection doc={doc} headingLabel="REQUESTS FOR ADMISSIONS" />
      <SignatureBlock session={session} />
      <CertificateBlock doc={doc} session={session} />
    </>
  )
}

function DisclosureContent({ session }: { session: SessionState }) {
  const requestingLabel = session.requestingParty
  const respondingLabel = requestingLabel === 'Petitioner' ? 'Respondent' : 'Petitioner'
  const requestingName =
    requestingLabel === 'Petitioner' ? session.petitioner : session.respondent
  const respondingName =
    requestingLabel === 'Petitioner' ? session.respondent : session.petitioner
  const pronoun = session.opposingPronoun
  const deadline = session.responseDeadline.replace(' days', '')

  const items = [
    'State the correct names of the parties to the lawsuit.',
    'State the names, addresses, and telephone numbers of any potential parties.',
    `State the legal theories and, in general, the factual bases for the claims or defenses of ${respondingName}. (You need not marshal or compile all evidence that may be offered at trial.)`,
    'State the amount and any method of calculating economic damages.',
    "State the names, addresses, and telephone numbers of persons having knowledge of relevant facts, and give a brief statement of each identified person's connection with the case.",
    `For any testifying expert — a. state the expert's name, address, and telephone number; b. state the subject matter on which the expert will testify; c. state the general substance of the expert's mental impressions and opinions and a brief summary of the basis for them or, if the expert is not retained by, employed by, or otherwise subject to the control of ${respondingName}, documents reflecting such information; d. if an expert is retained by, employed by, or otherwise subject to the control of ${respondingName}, produce the originals or copies of the following: i. all documents, tangible things, reports, models, or data compilations that have been provided to, reviewed by, or prepared by or for the expert in anticipation of the expert's testimony; and ii. the expert's current resume and bibliography.`,
    'Produce the originals or copies of any settlement agreements described in Rule 192.3(g) of the Texas Rules of Civil Procedure.',
    'Produce the originals or copies of any discoverable witness statements described in Rule 192.3(h) of the Texas Rules of Civil Procedure.',
    'Produce the originals or copies of (a) all medical records and bills that are reasonably related to the injuries or damages asserted or (b) an authorization permitting the disclosure of such medical records and bills.',
    `Produce the originals or copies of all medical records and bills obtained by ${respondingName} by virtue of an authorization furnished by ${requestingName}.`,
    'State the name, address, and telephone number of any person who may be designated as a responsible third party.',
  ]

  const certText = `I certify that a true and correct copy of the foregoing ${requestingLabel}'s Requests for Disclosure to ${respondingLabel} was served on ${session.opposingCounsel}, attorney of record for ${respondingName}, on the date below.`

  return (
    <>
      <p className="font-bold text-center mt-2 mb-2">
        {requestingLabel.toUpperCase()}&apos;S REQUESTS FOR DISCLOSURE TO{' '}
        {respondingLabel.toUpperCase()}
      </p>
      <p className="mb-3">
        To:&nbsp;&nbsp;{respondingName}, by and through {pronoun} attorney of record,{' '}
        {session.opposingCounsel}.
      </p>
      <p className="mb-3">
        Pursuant to rule 194a of the Texas Rules of Civil Procedure and subchapter B, chapter 301,
        Family Code, you are requested to disclose the information or material described below within{' '}
        {deadline} days after service of this request. The originals or copies of documents and other
        tangible items requested must be produced for inspection and copying within {deadline} days
        after service, together with a written response. No objection or assertion of work product
        privilege is permitted to this request. If you fail to comply, the court may order sanctions.
        Your response must be signed.
      </p>
      <SectionHeading text="REQUESTS FOR DISCLOSURE" />
      <div className="mt-2">
        {items.map((text, i) => (
          <p key={i} className="mb-2 pl-6 -indent-6">
            <span className="font-medium">{i + 1}.</span>&nbsp;{text}
          </p>
        ))}
      </div>
      <SignatureBlock session={session} />
      <div className="mt-6">
        <p className="font-bold text-center">CERTIFICATE OF SERVICE</p>
        <p className="mt-2">{certText}</p>
        <p className="mt-3">/s/ {session.attorneyName}</p>
        <p>{session.attorneyName}</p>
      </div>
    </>
  )
}

export default function DocumentViewer({ doc, session }: DocumentViewerProps) {
  return (
    <div className="relative">
      <div
        className="max-h-[65vh] overflow-y-auto bg-white border border-gray-200 rounded-lg px-10 py-8 text-sm leading-relaxed font-serif"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        <CaptionBlock session={session} />
        {doc.type === 'interrogatories' && (
          <InterrogatoriesContent doc={doc} session={session} />
        )}
        {doc.type === 'rfp' && <RFPContent doc={doc} session={session} />}
        {doc.type === 'rfa' && <RFAContent doc={doc} session={session} />}
        {doc.type === 'disclosure' && <DisclosureContent session={session} />}
      </div>
      {/* Scroll fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent rounded-b-lg" />
    </div>
  )
}
