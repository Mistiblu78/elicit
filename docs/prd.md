# Elicit — Product Requirements

## Problem Statement

Texas family law attorneys spend significant time manually drafting discovery requests — Interrogatories, Requests for Production, Requests for Admissions, and Requests for Disclosure. The knowledge required is in the attorney's head; the work is in the formatting, structure, rule compliance, and completeness. No tool exists built specifically for Texas family law with jurisdiction-specific rules, case types, and discovery structures baked in alongside an ethics-compliant privacy architecture. Elicit eliminates drafting time while keeping the attorney in full control of the final work product — AI drafts, attorney reviews and serves.

---

## User Stories

### Epic: Landing Page and Onboarding

- As a Texas family law attorney visiting Elicit for the first time, I want to understand the app's compliance posture and data handling before I enter any case information, so that I can be confident using it with active client matters.
  - [ ] On first visit, attorney sees a three-point onboarding notice explaining: (1) the two-field approach — identifying info vs. placeholder-only case notes; (2) attorney review requirement; (3) session-only data handling
  - [ ] Primary compliance notice is visible above the input form on every session (not just first visit)
  - [ ] Single call to action on the landing page: "Get Started" navigates to Page 2
  - [ ] No case information is requested on the landing page

---

### Epic: Case Input

- As a Texas family law attorney, I want to select my exact case type — including a modification sub-type when applicable — so that Claude drafts discovery appropriate to my specific proceeding and not a generic family law matter.
  - [ ] Case type dropdown shows four options: Divorce — No Children / Divorce — With Children / Original SAPCR / Modification
  - [ ] Selecting Modification reveals a required second dropdown: Conservatorship/Possession / Child Support / Both
  - [ ] Modification sub-selection must be made before Generate is available
  - [ ] Case type and modification sub-type are passed as structured fields in the API payload — not embedded in case notes
  - [ ] Divorce — With Children and Original SAPCR produce similar discovery; both include conservatorship, child support, and conduct-related requests as appropriate to the case facts

- As a Texas family law attorney, I want to enter my identifying information once and have it automatically inserted into every generated document, so that I never manually fill in party names, cause numbers, or attorney details.
  - [ ] Form collects all identifying information: Petitioner name, Respondent name, opposing counsel name, cause number, court, county, requesting party (Petitioner/Respondent), opposing pronoun (his/her/their), attorney name, firm name, firm address, firm city/state/zip, phone, fax, bar number, email
  - [ ] These fields are collected by the app and never sent to the API
  - [ ] All collected values are used in automatic find-and-replace after the API responds and before the document is displayed
  - [ ] Missing required fields are highlighted red on the field itself; Generate does not submit while required fields are empty
  - [ ] The attorney never manually fills placeholders — substitution is automatic

- As a Texas family law attorney, I want to describe my case facts using role-based placeholders in the case notes field, so that no client PII touches the AI model.
  - [ ] Case notes field ships with pre-filled example text demonstrating correct placeholder usage (realistic family law scenario using [PETITIONER], [RESPONDENT], [CHILD], etc.) — attorney clears it and enters their own facts
  - [ ] Input field notice is displayed next to the case notes field explaining the placeholder system and listing the available placeholders
  - [ ] A running character counter is visible below the field
  - [ ] At 2000 characters, an inline character count warning appears
  - [ ] Notes exceeding 2000 characters trigger an inline validation message: "Case notes must be 2000 characters or fewer." Generate is blocked until the attorney reduces the count
  - [ ] Case notes (placeholder-only) are the content sent to the API; no PII is included in the API payload

- As a Texas family law attorney, I want to select which discovery request types to generate and set the response deadline, so that the output matches the specific discovery I'm serving on this matter.
  - [ ] Checkboxes for four request types: Interrogatories / Requests for Production / Requests for Admissions / Requests for Disclosure — any combination can be selected
  - [ ] At least one request type must be selected; Generate is unavailable if none are checked
  - [ ] Discovery level dropdown: Level 1 / Level 2 / Level 3
  - [ ] Response deadline field: 30 days or 50 days — maps to [RESPONSE DEADLINE] placeholder in all generated documents
  - [ ] Requesting party selection (Petitioner/Respondent) drives the document title and party references

- As a Texas family law attorney selecting interrogatories for a complex family law case, I want a heads-up about the 25-interrogatory limit before I generate, so that I'm not surprised when Claude flags excess requests in the output.
  - [ ] Soft warning appears when Interrogatories is checked AND case type is Divorce — With Children, Original SAPCR, or Modification (any sub-type)
  - [ ] Warning text: "Complex family law cases can generate more than 25 interrogatories. Claude will flag any excess in the document — review before serving."
  - [ ] Warning is one line of helper text — non-blocking, no alarm styling, no color emphasis
  - [ ] No warning is shown when case type is Divorce — No Children
  - [ ] Warning appears/disappears dynamically as case type and request type selections change

---

### Epic: Document Generation

- As a Texas family law attorney, I want clear feedback that document drafting is in progress after I click Generate, so that I know the app received my request and is working on it.
  - [ ] Generate button changes to "Drafting your requests..." and becomes inactive immediately on click
  - [ ] No page transition occurs at this moment — button state is the confirmation
  - [ ] Page 3 loads only after the API responds successfully

- As a Texas family law attorney, I want a loading experience that communicates progress without anxiety while I wait for my documents, so that I feel informed rather than uncertain.
  - [ ] Tabs are pre-rendered on Page 3 with correct labels (one per selected request type) before content arrives — attorney sees what's being drafted
  - [ ] Skeleton cards pulse with document structure: title area, paragraph line blocks, section label placeholders, download button outlines
  - [ ] Elicit logo animation plays centered above the skeleton: cyan particles from the logo drift upward at varying speeds and opacity, looping until the response arrives then fading out
  - [ ] Wait time estimate displayed below the animation: "This usually takes 8–15 seconds."
  - [ ] On API response: skeleton fades out, real document content fades in — smooth transition, no flash

- As a Texas family law attorney, I want errors handled gracefully without losing my form data, so that I can retry without re-entering anything.
  - [ ] All errors appear inline on the loading screen — no modal, no separate page, no redirect to Page 2
  - [ ] Skeleton cards and logo animation stop on error; error message replaces skeleton content
  - [ ] Form data from Page 2 is held in session state throughout — never cleared by an error
  - [ ] **Rate limit (429):** Displays "Too many requests. Please wait a moment and try again." with a Try Again button
  - [ ] **Session limit (10 API calls reached):** Displays "You've reached the session limit. To start a new case, refresh the page." — no Try Again button; refresh is the only path forward
  - [ ] **API timeout or network error:** Displays "Something went wrong while drafting your requests. Please try again." with a Try Again button
  - [ ] If the same API/network error occurs twice in a row, a second line is added: "If the problem continues, check your connection or try again shortly."
  - [ ] Try Again re-triggers the same API call with identical input — no re-entry required

---

### Epic: Document Review and Output

- As a Texas family law attorney, I want to read each generated document in a clearly formatted, paper-like view, so that I can evaluate it as I would evaluate any legal document before serving.
  - [ ] One tab per generated document type — only selected types appear; tab labels: Interrogatories / Requests for Production / Requests for Admissions / Requests for Disclosure
  - [ ] Active tab indicator uses Elicit navy (#1A4269)
  - [ ] Active tab displays the full formatted document in a card: caption block (centered, Texas court format), document title, To line, cover paragraph, definitions section (Interrogatories and RFP only), numbered requests organized under bold section headings, signature block, certificate of service
  - [ ] Real identifying information is already inserted via find-and-replace — no placeholder strings visible in the output
  - [ ] Document body uses a bottom fade effect to indicate scrollable content without abruptly cutting off
  - [ ] Interrogatories tab shows a request count badge:
    - [ ] Count ≤ 25: neutral badge styling showing request count
    - [ ] Count > 25: red badge showing count and "review limit" label (e.g., "27 — review limit")
    - [ ] Badge count is determined by the app parsing the generated document after the API responds — not predicted before generation
    - [ ] Claude's over-limit notice ("Note: The following requests total N. Under Level 2 discovery, the limit is 25...") appears at the top of the Interrogatories document when the limit is exceeded
  - [ ] RFP, RFA, and Disclosure tabs show no count badge (no numerical limit for these request types)

- As a Texas family law attorney, I want to formally acknowledge my review responsibility before I can download anything, so that the app keeps me accountable as the attorney of record.
  - [ ] Single review notice displayed once above the tabs — not repeated on each tab
  - [ ] Notice includes checkbox: "I have reviewed these documents and accept responsibility for their accuracy before serving."
  - [ ] Checkbox is unchecked on page load
  - [ ] "Download [Type]" and "Download all (.zip)" buttons are disabled (40% opacity, pointer-events none) until checkbox is checked
  - [ ] Checking the checkbox enables both download buttons immediately
  - [ ] Copy to clipboard is not gated — always available regardless of checkbox state

- As a Texas family law attorney, I want to navigate back to my input and regenerate if I need to change something, so that I can refine my output without losing session state or starting over.
  - [ ] "Back to edit" button in the top left of Page 3
  - [ ] Returns to Page 2 with all form fields, case notes, and selections intact — nothing is cleared
  - [ ] Attorney can change any field and hit Generate again; new output replaces current output on Page 3
  - [ ] Previously downloaded files are not affected by regeneration — what was downloaded is the attorney's to keep
  - [ ] Each regeneration counts against the 10-call session limit

- As a Texas family law attorney, I want a clear way to start fresh for a new case without the app implying that anything was saved, so that I understand the session-only nature of the tool.
  - [ ] "Start new session" text link in the header on Pages 2 and 3 — unobtrusive, not a prominent button
  - [ ] Clicking it shows a confirmation: "This will clear your current session. Continue?"
  - [ ] No "New Case" button or navigation that implies persistence
  - [ ] Refreshing the page clears the session with no confirmation prompt

---

### Epic: Download and Export

- As a Texas family law attorney, I want to download the document I'm currently reviewing as a formatted Word file, so that I can make final edits and serve it on opposing counsel.
  - [ ] Primary download button label updates dynamically based on the active tab: "Download Interrogatories" / "Download Requests for Production" / etc.
  - [ ] Downloads a .docx file for the active tab's document
  - [ ] .docx is properly formatted — not plain text: includes caption block, cover paragraph, definitions (where applicable), numbered requests with bold section headings, certificate of service
  - [ ] Signature block area in the .docx contains a single `{SignatureBlock}` placeholder for the attorney to complete in Word using their firm's format
  - [ ] File is fully editable — attorney can remove interrogatories, adjust language, fill in the signature block before serving

- As a Texas family law attorney who generated multiple document types, I want to download all of them at once, so that I don't have to switch tabs and download individually.
  - [ ] "Download all (.zip)" button packages all generated .docx files into a single zip
  - [ ] Zip contains one .docx per selected request type, named clearly (e.g., Interrogatories.docx, Requests_for_Production.docx)
  - [ ] "Download all (.zip)" is visually secondary to the per-document download button

- As a Texas family law attorney who wants to quickly paste document content without downloading, I want a copy-to-clipboard option as a fallback.
  - [ ] "Copy to clipboard" ghost button always visible on Page 3 — right side, low visual weight
  - [ ] Copies the full text content of the active tab's document
  - [ ] Not gated by the review checkbox

---

## What We're Building

**Page 1 — Landing / Home**
Compliance notice and onboarding. Three-point notice explaining the placeholder system, session-only data handling, and attorney review requirement. Primary compliance notice block. Single CTA: Get Started.

**Page 2 — Input**
Two sections: (1) Identifying information — party names, opposing counsel, cause number, court, county, requesting party, opposing pronoun, attorney and firm details. (2) Case details — case type (4 options with Modification sub-selection), discovery level, request types (1–4), response deadline, case notes field with pre-filled placeholder example and character counter. Soft interrogatory warning for complex case types. Generate button.

**Page 3 — Output**
Tab-based document view (one tab per selected request type). Single review checkbox gate above tabs. Formatted document preview with real names already inserted. Request count badge on Interrogatories tab (with over-limit alert). Back to edit navigation. Per-document download (.docx), Download all (.zip), Copy to clipboard.

**Core behaviors:**
- Two-stage PII handling: identifying info collected in form → find-and-replace after generation; placeholder-only case notes sent to API
- Structured API payload: case type, modification_type (when applicable), discovery level, request types, response deadline, case notes — all as discrete fields
- Issue-driven generation: Claude reads case facts and drafts requests specific to disputed issues — not a template with blanks
- Animated loading state: skeleton cards, logo particle animation, wait time estimate
- Inline error handling: 3 error states, session state always preserved, retry without re-entry
- Input validation on Page 2: character limit, required fields — errors never reach the loading screen
- Session management: 10-call limit, "Start new session" with confirmation, refresh clears everything
- Rate limiting: Cloudflare (30 req/IP/hour, HTTP 429), session limit (10 calls), max_tokens: 4000 per call

---

## What We'd Add With More Time

- **Dashboard and case tracking** — save and retrieve past sessions; first version is session-only by design
- **Discovery response drafting** — the other half of the workflow; planned next version
- **Document upload and management** — attach exhibits, upload prior orders for modification cases
- **Authentication and saved history** — attorney accounts, case history, document library
- **Discovery guide / educational content** — rule references, strategy notes, deadline calculators
- **Payment and billing** — subscription or per-use model
- **Multi-jurisdiction support** — other states; Texas specificity is the current moat
- **Expanded case type coverage** — enforcement, contempt, grandparent access, CPS-adjacent matters

---

## Non-Goals

1. **No data storage of any kind** — no database, no session logs, no analytics touching case content. Session-only is a compliance feature, not a limitation.
2. **No authentication or user accounts** — the app does not know who is using it and does not need to.
3. **No filing with the court** — all output is for service on opposing counsel under TRCP 21a. All UI language reflects this distinction.
4. **No jurisdictions outside Texas family law** — specificity is the product; no general civil, no other states.
5. **No PII detection warning on the output page** — the placeholder system is the protection layer. The output page does not second-guess an attorney who understands their own case notes.
6. **No automatic interrogatory trimming** — the app flags the limit; the attorney decides which requests to remove based on case strategy. The downloaded .docx is fully editable for this purpose.

---

## Open Questions

1. **Pre-filled case notes example text** — Content needs to be authored before build: a realistic 2–4 sentence family law scenario using correct placeholder strings. Can be finalized before /spec. *(Resolve before build.)*

2. **System prompt update required** — The existing system prompt needs three conditional instructions added to the modification section: one for Child Support only, one for Conservatorship/Possession only, one for Both. The `modification_type` field in the structured input maps directly to these instructions. *(Resolve before /spec.)*

3. **Request count badge color** — The current mockup badge text is too dark for readability. Final color values for both the neutral and over-limit badge states to be determined during build. *(Can wait until build.)*

4. **Zip file naming convention** — Confirm final file names for the Download All zip (e.g., `Elicit_Interrogatories.docx` or `Interrogatories.docx`). *(Can wait until build.)*
