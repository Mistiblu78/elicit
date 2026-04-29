# **Elicit — Kick-Off Prompt**

\---

I want to build **Elicit**, a Texas family law discovery drafting app for licensed attorneys. The app takes structured case input and free-text case notes from an attorney and generates fully formatted, court-ready discovery request documents using an AI drafting engine.

**The core problem it solves:** Texas family law attorneys spend significant time manually drafting discovery requests — Interrogatories, Requests for Production, Requests for Admissions, and Requests for Disclosure. Elicit eliminates the drafting time while keeping the attorney in control of the final work product.

\---

### Tech Stack

* **Frontend:** Next.js with Tailwind CSS
* **Runtime:** Bun
* **Deployment:** Cloudflare Pages
* **AI Engine:** Anthropic Claude API (claude-sonnet-4-5 via /v1/messages)
* **No database** — session-only, zero data retention by design

\---

### Core User Flow

1. Attorney opens the app and sees a compliance notice (no PII in API calls, session-only, attorney review required)
2. Attorney fills out the form — case type, requesting party, discovery level, request type(s), response deadline
3. Attorney enters real identifying information in dedicated form fields: party names, opposing counsel, cause number, court, attorney info, firm details — this is collected by the app and never sent to the API
4. Attorney enters case facts in the notes field using role-based placeholders only (\[PETITIONER], \[RESPONDENT], \[CHILD]) — never real names
5. App sends case facts with placeholders to the Claude API using the pre-written system prompt — no PII touches the API
6. Claude returns fully formatted documents using the exact placeholder strings from the system prompt
7. App performs an automatic find-and-replace — swapping every placeholder with the real identifying information collected in step 3
8. Attorney sees a complete, ready-to-review document with real names, cause number, court, and attorney details already inserted
9. Attorney reviews, then copies or downloads — serves on opposing counsel, does not file with the court

\---

### Key Constraints

* **Two-stage PII handling** — Form collects real identifying information upfront (party names, opposing counsel, cause number, court, attorney info). Case notes field accepts placeholders only. API call contains zero PII. After generation, app does automatic find-and-replace to insert real info before displaying the document.
* **Exact placeholder strings** — The system prompt enforces a strict placeholder table. The app's find-and-replace must map to the same exact strings. Full table: `\[PETITIONER]`, `\[RESPONDENT]`, `\[CHILD]`, `\[CHILDREN]`, `\[OPPOSING COUNSEL]`, `\[ATTORNEY]`, `\[FIRM]`, `\[FIRM ADDRESS]`, `\[FIRM CITY STATE ZIP]`, `\[PHONE]`, `\[FAX]`, `\[BAR NO.]`, `\[EMAIL]`, `\[COURT]`, `\[COUNTY]`, `\[CAUSE NO.]`, `\[PARTY REPRESENTED]`, `\[OPPOSING PRONOUN]`, `\[DATE]`, `\[AMOUNT]`, `\[BUSINESS]`, `\[EXHIBIT]`, `\[RESPONSE DEADLINE]`
* **No data storage** — no database, no session logs, no analytics that touch case content
* **Attorney review gate** — mandatory review notice displayed with every output before copy/download is accessible
* **Interrogatory limit enforcement** — UI warns if interrogatory count would exceed 25 under Level 2
* **Discovery is served, not filed** — output and all UI language must reflect that discovery requests are served on opposing counsel under TRCP 21a, not filed with the court

\---

### Compliance Context

This app is designed to support compliance with:

* Texas Responsible AI Governance Act (TRAIGA) — human oversight, no unchecked AI output, audit-ready design
* Texas DRPC Rules 1.01 and 1.05 — competence and confidentiality
* Texas Ethics Opinion 705 — attorney verification of all AI output, no self-learning data exposure
* ABA Formal Opinion 512 — informed consent framework, confidentiality safeguards

The compliance posture is built into the UX, not bolted on. The placeholder system, session-only architecture, and attorney review gate are the compliance mechanisms.

\---

### Pre-Built Assets (already complete — reference these, do not recreate)

* `/data/interrogatories.json` — categorized interrogatory requests with TFC references
* `/data/requests\_for\_production.json` — categorized RFP requests
* `/data/requests\_for\_admissions.json` — categorized RFA requests
* `/data/requests\_for\_disclosure.json` — Rule 194 disclosure requests
* `/lib/prompts/elicit\_system\_prompt\_final.md` — the full AI system prompt (do not modify during build)

\---

### Branding

* Name: **Elicit**
* Tagline: *Texas discovery requests, drafted in seconds*
* Colors: Deep Sapphire Blue (#1A4269), Light Cyan (#A3DDF2), Slate Grey (#707070), White (#FFFFFF)
* Tone: Authoritative, clean, professional — this is a tool for licensed attorneys, not a consumer app

\---

### App Structure

This is a focused single-workflow app — one linear flow, no branching navigation. Three pages:

**Page 1 — Landing / Home**
Compliance notice and onboarding. Explains the placeholder system, session-only data handling, and attorney review requirement. Single call to action: Get Started.

**Page 2 — Input**
Two sections: (1) identifying information form fields — party names, opposing counsel, cause number, court, attorney info, firm details; (2) case details — case type, requesting party, discovery level, request types, response deadline, and free-text case notes field with placeholder guidance. Generate button at the bottom.

**Page 3 — Output**
Displays one complete formatted document per request type selected, with real identifying information already inserted via auto find-and-replace. Mandatory attorney review notice displayed above download controls. Download as Word document (.docx). Copy to clipboard as fallback.

\---

### Hackathon Scope

* All four request types: Interrogatories, RFP, RFA, Disclosure
* Two-stage PII handling with automatic find-and-replace
* Attorney review gate before download
* Word document (.docx) download per generated document
* Copy to clipboard fallback
* Compliance notices on landing page and inline with output

\---

Please help me build the scope document, PRD, technical spec, and build checklist for this project before writing any code.



\---

### Rate Limiting and Cost Controls

The app must include basic API usage protection:

* **Per-session request limit:** Maximum 10 API calls per session. After 10 requests, display: "You have reached the session limit. Please refresh to start a new session."
* **Cloudflare Worker rate limiter:** Limit to 30 requests per IP per hour using Cloudflare's built-in rate limiting on the API route. Return HTTP 429 with a user-facing message: "Too many requests. Please try again shortly."
* **Token ceiling:** Set `max\_tokens: 4000` on every API call. Discovery documents do not need more than this and it caps runaway generation cost.
* **Input length validation:** Reject case notes inputs exceeding 2000 characters before the API call is made. Display an inline validation message: "Case notes must be 2000 characters or fewer."

These controls protect against both accidental overuse during testing and intentional abuse in production. Implement during the technical spec phase before any UI work begins.

