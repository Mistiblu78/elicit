# Elicit

**Tagline:** Texas discovery requests, drafted in seconds.

## Idea
A focused single-workflow web app for licensed Texas family law attorneys. The attorney provides structured case input; the app generates fully formatted, court-ready discovery request documents via the Claude API and delivers them as downloadable Word files. One linear flow, three pages, no branching navigation.

## Who It's For
**User:** Licensed Texas family law attorneys  
**Problem:** Discovery request drafting is time-consuming, repetitive, and high-stakes. The knowledge is in the attorney's head — the work is in the formatting, structure, and completeness.  
**Unmet need:** A tool built specifically for Texas family law — not general civil litigation — with jurisdiction-specific rules, case types, and discovery structures baked in, and an ethics-compliant privacy architecture from day one.  
**Key distinction:** Documents are served on opposing counsel under TRCP 21a — not filed with the court. All UI language reflects this.

## Inspiration & References
- [Briefpoint](https://briefpoint.ai/) — Closest parallel (discovery automation), general civil only, no PII architecture. Elicit's moat: narrow, deep, compliant.
- [Eve Legal](https://www.eve.legal/) — Trainable plaintiff-focused discovery AI. Confirms the market; Elicit's form → output model is lower friction.
- [EsquireTek Omega](https://www.esquiretek.com/) — Managed service model. Elicit is the opposite: attorney in full control, AI is the drafting engine.

**Branding:**
- Colors: `#1A4269` (navy), `#A3DDF2` (light blue), `#707070` (gray), `#FFFFFF`
- Tone: authoritative, clean, professional
- Logo, color scheme, compliance copy: already complete

**Compliance framework:** TRAIGA · Texas DRPC Rules 1.01 and 1.05 · Texas Ethics Opinion 705 · ABA Formal Opinion 512. Compliance is architectural — built into the placeholder system, session-only design, and attorney review gate.

## Goals
- Eliminate discovery request drafting time for Texas family law attorneys
- Keep the attorney in full control of the final work product — AI drafts, attorney reviews and serves
- Demonstrate that AI can be deployed in legal practice ethically and safely — PII never touches the model
- Ship part 1 of a larger product vision cleanly enough to extend later

## What "Done" Looks Like

### App Structure — Three Pages

**Page 1 — Landing / Home**
Compliance notice and onboarding. Explains the placeholder system, session-only data handling, and attorney review requirement. Single call to action: Get Started.

**Page 2 — Input**
Two sections:
1. Identifying information form fields: party names, opposing counsel, cause number, court, attorney name, firm, firm address, firm city/state/zip, phone, fax, bar number, email
2. Case details: case type, requesting party, discovery level (Level 1/2/3 under TRCP 190), request types (any combination of Interrogatories, RFP, RFA, Disclosure), response deadline, free-text case notes field with placeholder guidance

Generate button at the bottom. Case notes capped at 2000 characters, validated client-side.

**Page 3 — Output**
One complete formatted document per request type selected. Real identifying information already inserted via automatic find-and-replace before display. Mandatory attorney review notice displayed above download controls. Download as Word document (.docx) per document. Copy to clipboard as fallback.

### User Flow
1. Attorney lands on home page, reviews compliance notice
2. Attorney clicks Get Started, reaches input page
3. Attorney enters real identifying information in dedicated form fields — collected by app, never sent to API
4. Attorney enters case facts in notes field using placeholders only — never real names
5. App sends placeholder-only case facts + case context to Claude API using pre-written system prompt — no PII in the payload
6. Claude returns fully formatted documents using exact placeholder strings
7. App performs automatic find-and-replace — swapping placeholders for real info from step 3
8. Attorney lands on output page, sees complete ready-to-review documents
9. Attorney reviews, downloads as Word document, serves on opposing counsel

### What Each Document Contains
Caption · Cover paragraph · Definitions · Numbered requests · Signature block · Certificate of service

### Placeholder Strings (find-and-replace pairs)
`[PETITIONER]` `[RESPONDENT]` `[CHILD]` `[CHILDREN]` `[OPPOSING COUNSEL]` `[ATTORNEY]` `[FIRM]` `[FIRM ADDRESS]` `[FIRM CITY STATE ZIP]` `[PHONE]` `[FAX]` `[BAR NO.]` `[EMAIL]` `[COURT]` `[COUNTY]` `[CAUSE NO.]` `[PARTY REPRESENTED]` `[OPPOSING PRONOUN]` `[DATE]` `[AMOUNT]` `[BUSINESS]` `[EXHIBIT]` `[RESPONSE DEADLINE]`

### Constraints & Guardrails
- PII never reaches the API — placeholders only in the prompt
- Find-and-replace is automatic — attorney never manually fills placeholders
- No database, no session logs, no stored data of any kind
- Attorney review gate — mandatory notice before download is accessible
- Interrogatory limit warning — flag if count would exceed 25 under TRCP Level 2
- All UI language reflects that discovery is served on opposing counsel under TRCP 21a, not filed with the court

### Rate Limiting & Cost Controls
- 10 API calls per session max
- Cloudflare rate limiter: 30 requests per IP per hour, returns HTTP 429
- `max_tokens: 4000` on every API call
- Case notes input capped at 2000 characters, validated client-side

## What's Explicitly Cut
- **Dashboard / case progress tracking** — larger product vision, not this version
- **Discovery Guide / educational content** — useful, not MVP
- **Document Upload & Management** — separate workflow, future version
- **Discovery response drafting** — the other half of the workflow; planned future version
- **Communication portal** — out of scope entirely
- **Authentication / accounts / saved history** — session-only is a feature, not a limitation
- **Payment / billing** — not part of the hackathon build
- **Any jurisdiction outside Texas family law** — specificity is the product

## Loose Implementation Notes

**Tech stack:** Next.js · Tailwind CSS · Bun · Cloudflare Pages · Anthropic Claude API (`claude-sonnet-4-5`)

**Pre-built assets (already complete):**
- `/data/interrogatories.json`
- `/data/requests_for_production.json`
- `/data/requests_for_admissions.json`
- `/data/requests_for_disclosure.json`
- `/lib/prompts/elicit_system_prompt_final.md`
- Branding assets (logo, color scheme, compliance/disclaimer copy)

**Output:** `.docx` per request type — one file per selected document type. Attorney edits in Word before service.

**Deployment:** Cloudflare Pages with Cloudflare rate limiting middleware.

**Core IP:** The structured JSON data sets and system prompt encode 25 years of Texas family law practice. The app is the delivery mechanism; the knowledge is the product.
