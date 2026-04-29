# Elicit — Technical Spec

## Stack

| Layer | Choice | Rationale |
|---|---|---|
| Runtime | Bun | Preferred by learner; fast installs, compatible with Next.js |
| Framework | Next.js 15 (App Router) | SSR + API routes in one framework; AI agents know it well |
| Styling | Tailwind CSS | Utility-first; fast for building structured, data-heavy UIs |
| Deployment | Cloudflare Pages via `@opennextjs/cloudflare` | Native rate limiting; `@cloudflare/next-on-pages` is deprecated |
| AI | Anthropic SDK → `claude-sonnet-4-6` | Updated from 4-5; actively supported |
| .docx generation | `docx` npm library (client-side) | Actively maintained; runs in browser; programmatic structure control |
| Zip packaging | `jszip` (client-side) | Lightweight; packages multiple .docx files in browser |
| State | React Context (built-in) | No extra library; scoped to browser tab; clears on refresh |

**Documentation links:**
- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Cloudflare OpenNext adapter](https://opennext.js.org/cloudflare)
- [Anthropic SDK (Node)](https://docs.anthropic.com/en/api/getting-started)
- [docx library](https://docx.js.org/)
- [jszip](https://stuk.github.io/jszip/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## Runtime & Deployment

- **Platform:** Cloudflare Pages with Cloudflare Workers (via `@opennextjs/cloudflare`)
- **Config:** `wrangler.toml` — Cloudflare Workers config; Claude Code configures this during setup
- **Adapter setup:** `@opennextjs/cloudflare` replaces the deprecated `@cloudflare/next-on-pages`; Claude Code handles installation and `next.config.ts` configuration
- **Rate limiting:** Cloudflare middleware — 30 requests/IP/hour, returns HTTP 429 before the request reaches the API route
- **Environment variable:** `ANTHROPIC_API_KEY` — set in `.env.local` locally, in Cloudflare Pages dashboard for production
- **Session-only:** No database, no logs, no persistent storage of any kind

---

## Architecture Overview

```
BROWSER                              SERVER (Cloudflare Workers)
──────────────────────────────────   ──────────────────────────────────────
Page 1 (Landing)
  ↓ Get Started
Page 2 (Input)
  SessionContext ← form fields
  (PII never leaves browser)
  ↓ Generate click
  POST /api/generate ─────────────→ route.ts
  { caseType, modificationType,       ↓ loads lib/prompts/elicit_system_prompt.md
    discoveryLevel, requestTypes,     ↓ buildPrompt.ts
    responseDeadline, caseNotes }     ↓ Anthropic SDK → claude-sonnet-4-6
                                      ↓ returns JSON[]
  ←────────────────────────────────  JSON response (one object per doc type)
  SessionContext ← documents[]
  replacePlaceholders.ts
  (merges PII from SessionContext)
  ↓
Page 3 (Output)
  DocumentViewer (display)
  buildDocx.ts → .docx (download)
  buildZip.ts → .zip (download all)
```

**Two data streams — PII never reaches the server:**

```
Stream 1 — Identifying Info (PII, client-side only)
  IdentifyingInfoForm → SessionContext → replacePlaceholders.ts → .docx

Stream 2 — Case Facts (placeholder-only, travels to server)
  CaseNotesField → SessionContext → buildPrompt.ts → POST /api/generate
  → claude-sonnet-4-6 → JSON → replacePlaceholders.ts ← Stream 1 merges here
```

---

## Page 1 — Landing

Implements `prd.md > Epic: Landing Page and Onboarding`

### ComplianceNotice Component

- Three-point notice displayed on every session (not gated to first visit):
  1. Two-field approach — identifying info vs. placeholder-only case notes
  2. Attorney review requirement before serving
  3. Session-only data handling — no storage, no logs
- Primary compliance block visible above the fold
- Single CTA: **Get Started** → navigates to `/input`
- No case information collected on this page

---

## Page 2 — Input Form

Implements `prd.md > Epic: Case Input`

### IdentifyingInfoForm Component

Collects all identifying information. These fields populate SessionContext and **are never sent to the API.**

Fields: Petitioner name, Respondent name, Opposing counsel name, Cause number, Court, County, Requesting party (Petitioner/Respondent), Opposing pronoun (his/her/their), Attorney name, Firm name, Firm address, Firm city/state/zip, Phone, Fax, Bar number, Email.

- Required fields highlighted red on the field itself when empty and Generate is attempted
- Generate does not submit while any required field is empty

### CaseDetailsForm Component

Implements the structured case context sent to the API.

- **Case type dropdown:** Divorce — No Children / Divorce — With Children / Original SAPCR / Modification
- **Modification sub-type:** Revealed only when Modification is selected — required before Generate is available. Options: Conservatorship/Possession / Child Support / Both
- **Discovery level:** Level 1 / Level 2 / Level 3
- **Request types:** Checkboxes — Interrogatories / Requests for Production / Requests for Admissions / Requests for Disclosure. At least one required.
- **Response deadline:** 30 days / 50 days — maps to `[RESPONSE DEADLINE]` placeholder in all documents

**Interrogatory soft warning** (non-blocking, no alarm styling):
- Appears when Interrogatories is checked AND case type is Divorce — With Children, Original SAPCR, or Modification (any sub-type)
- Text: "Complex family law cases can generate more than 25 interrogatories. Claude will flag any excess in the document — review before serving."
- Disappears dynamically when case type changes to Divorce — No Children

### CaseNotesField Component

- Pre-filled example text demonstrating correct placeholder usage (realistic TX family law scenario using `[PETITIONER]`, `[RESPONDENT]`, `[CHILD]`, etc.) — attorney clears and enters own facts
- Inline notice explaining placeholder system; lists all 22 available placeholders
- Running character counter visible below field
- At 2000 characters: inline warning appears
- Over 2000: validation message "Case notes must be 2000 characters or fewer." — Generate blocked

### GenerateButton Component

- Validates all required fields and at least one request type selected before enabling
- On click: button text changes to "Drafting your requests..." and becomes inactive
- No page transition at click — button state is the confirmation
- Page 3 loads only after API responds successfully

---

## Session State

### SessionContext

`context/SessionContext.tsx` — wraps the entire app via `app/layout.tsx`. Holds all state for the session. Clears on page refresh (session-only by design).

### State Shape

```typescript
interface SessionState {
  // Identifying info — PII, never sent to API
  petitioner: string
  respondent: string
  opposingCounsel: string
  causeNumber: string
  court: string
  county: string
  requestingParty: 'Petitioner' | 'Respondent'
  opposingPronoun: 'his' | 'her' | 'their'
  attorneyName: string
  firmName: string
  firmAddress: string
  firmCityStateZip: string
  phone: string
  fax: string
  barNumber: string
  email: string

  // Case details — sent to API
  caseType: 'Divorce — No Children' | 'Divorce — With Children' | 'Original SAPCR' | 'Modification'
  modificationType: 'Conservatorship/Possession' | 'Child Support' | 'Both' | null
  discoveryLevel: 'Level 1' | 'Level 2' | 'Level 3'
  requestTypes: Array<'Interrogatories' | 'RFP' | 'RFA' | 'Disclosure'>
  responseDeadline: '30 days' | '50 days'
  caseNotes: string

  // Generated documents
  documents: GeneratedDocument[] | null

  // Session management
  apiCallCount: number
  isLoading: boolean
  error: 'rate_limit' | 'session_limit' | 'api_error' | null
}

interface GeneratedDocument {
  type: string
  caption: string
  title: string
  to_line: string
  cover: string
  definitions: Array<{ term: string; definition: string }>
  requests: Array<{ section: string; items: Array<{ number: number; text: string }> }>
  signature_block: string
  certificate: string
  review_notice: string
}
```

---

## API Route

Implements `prd.md > Epic: Document Generation`

### POST /api/generate

`app/api/generate/route.ts` — runs server-side on Cloudflare Workers.

**Request payload:**
```json
{
  "caseType": "Divorce — With Children",
  "modificationType": null,
  "discoveryLevel": "Level 2",
  "requestTypes": ["Interrogatories", "RFP"],
  "responseDeadline": "30 days",
  "caseNotes": "[PETITIONER] and [RESPONDENT] dispute custody..."
}
```

**Response:** Array of `GeneratedDocument` objects — one per selected request type.

**Session limit enforcement:** The route receives `apiCallCount` from the client and returns `{ error: "session_limit" }` if count ≥ 10 before calling Claude. (Count is managed client-side in SessionContext; this is a secondary check.)

**Rate limit:** Cloudflare middleware returns HTTP 429 before the request reaches this route.

**Error responses:**
```json
{ "error": "rate_limit" }      // 429 from Cloudflare
{ "error": "session_limit" }   // 10-call limit reached
{ "error": "api_error" }       // Anthropic timeout or network failure
```

### Prompt Construction

`lib/buildPrompt.ts` — pure function, constructs the user message from form payload only. The JSON data files in `data/` are reference assets and are not read at runtime.

**User message format (confirmed):**
```
Case type: Divorce — With Children
Modification type: N/A
Discovery level: Level 2
Request types: Interrogatories, RFP
Response deadline: 30 days
Case notes: [PETITIONER] and [RESPONDENT] dispute custody...
```

`modificationType` is always included — set to `N/A` when not applicable. No inference from case notes.

### Claude Integration

```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const response = await client.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 4000,
  system: systemPrompt,           // loaded from lib/prompts/elicit_system_prompt.md
  messages: [{ role: 'user', content: userMessage }]
})
```

**System prompt loading note:** `lib/prompts/elicit_system_prompt.md` must be importable in the Cloudflare Workers environment. Claude Code should handle this during setup — either configure a raw file loader in `next.config.ts` or export the prompt content as a TypeScript string constant. The `.md` file is the source of truth; the loading mechanism is a build-time decision.

### Error Handling

- **429 from Cloudflare:** Never reaches the route; client receives HTTP 429, maps to `rate_limit` error state
- **Session limit:** Route returns `{ error: "session_limit" }` immediately; no Anthropic call made
- **Anthropic timeout / network error:** Caught, returns `{ error: "api_error" }` with appropriate HTTP 500
- All errors are returned as structured JSON — no unhandled exceptions reach the client

---

## PII Architecture

### Find-and-Replace System

`lib/replacePlaceholders.ts` — pure function, runs client-side after API responds.

```typescript
function replacePlaceholders(text: string, formData: SessionState): string {
  const replaceMap: Record<string, string> = {
    '[PETITIONER]': formData.petitioner,
    '[RESPONDENT]': formData.respondent,
    '[CHILD]': formData.child ?? '',
    '[CHILDREN]': formData.children ?? '',
    '[OPPOSING COUNSEL]': formData.opposingCounsel,
    '[ATTORNEY]': formData.attorneyName,
    '[FIRM]': formData.firmName,
    '[FIRM ADDRESS]': formData.firmAddress,
    '[FIRM CITY STATE ZIP]': formData.firmCityStateZip,
    '[PHONE]': formData.phone,
    '[FAX]': formData.fax,
    '[BAR NO.]': formData.barNumber,
    '[EMAIL]': formData.email,
    '[COURT]': formData.court,
    '[COUNTY]': formData.county,
    '[CAUSE NO.]': formData.causeNumber,
    '[PARTY REPRESENTED]': formData.requestingParty,
    '[OPPOSING PRONOUN]': formData.opposingPronoun,
    '[DATE]': new Date().toLocaleDateString('en-US'),
    '[RESPONSE DEADLINE]': formData.responseDeadline,
  }
  return Object.entries(replaceMap).reduce(
    (result, [placeholder, value]) => result.replaceAll(placeholder, value),
    text
  )
}
```

Applied to every string field in the `GeneratedDocument` JSON before display or .docx assembly. PII never travels to the server.

### Placeholder Map

All 22 placeholders from `scope.md` are handled: `[PETITIONER]` `[RESPONDENT]` `[CHILD]` `[CHILDREN]` `[OPPOSING COUNSEL]` `[ATTORNEY]` `[FIRM]` `[FIRM ADDRESS]` `[FIRM CITY STATE ZIP]` `[PHONE]` `[FAX]` `[BAR NO.]` `[EMAIL]` `[COURT]` `[COUNTY]` `[CAUSE NO.]` `[PARTY REPRESENTED]` `[OPPOSING PRONOUN]` `[DATE]` `[AMOUNT]` `[BUSINESS]` `[EXHIBIT]` `[RESPONSE DEADLINE]`

---

## Document Generation

Implements `prd.md > Epic: Download and Export`

### Claude JSON Output Schema

The system prompt instructs Claude to return a JSON array — one object per selected request type:

```json
[
  {
    "type": "interrogatories",
    "caption": "...",
    "title": "...",
    "to_line": "...",
    "cover": "...",
    "definitions": [{ "term": "...", "definition": "..." }],
    "requests": [{ "section": "...", "items": [{ "number": 1, "text": "..." }] }],
    "signature_block": "...",
    "certificate": "...",
    "review_notice": "..."
  }
]
```

`definitions` is populated for Interrogatories and RFP only. `review_notice` carries Claude's over-limit notice when interrogatory count exceeds 25 under Level 2.

### .docx Assembly

`lib/buildDocx.ts` — client-side, uses `docx` npm library.

Takes a `GeneratedDocument` object (post-replace) and builds a Word document with:
- Caption block (centered, Texas court format)
- Document title
- To line
- Cover paragraph
- Definitions section (Interrogatories and RFP only)
- Numbered requests under bold section headings
- `{SignatureBlock}` placeholder — attorney completes in Word before serving
- Certificate of service

Returns a `Blob` for browser download. Document is fully editable — attorney removes requests, adjusts language, fills signature block in Word.

### Download Controls

`components/output/DownloadControls.tsx`

- **"Download [Type]"** — dynamic label based on active tab; downloads .docx for that tab's document; triggers `buildDocx.ts`
- **"Download all (.zip)"** — secondary button; packages all generated .docx files via `buildZip.ts`; visually subordinate to per-document button
- **"Copy to clipboard"** — ghost button, right side, low visual weight; copies full text of active tab's document; always available, not gated by review checkbox

Both download buttons are disabled (40% opacity, `pointer-events: none`) until the review checkbox is checked. Copy to clipboard is always available.

### Download All (.zip)

`lib/buildZip.ts` — uses `jszip`, runs client-side.

Packages all generated .docx files. File naming: `Interrogatories.docx`, `Requests_for_Production.docx`, `Requests_for_Admissions.docx`, `Requests_for_Disclosure.docx`. Final naming convention confirmed at build.

---

## Page 3 — Output

Implements `prd.md > Epic: Document Review and Output`

### DocumentTabs Component

- One tab per selected request type — only selected types appear
- Tab labels: Interrogatories / Requests for Production / Requests for Admissions / Requests for Disclosure
- Active tab indicator: Elicit navy `#1A4269`

### DocumentViewer Component

- Paper-like card displaying the full formatted document for the active tab
- Real identifying information already inserted via `replacePlaceholders.ts` — no placeholder strings visible
- Bottom fade effect (CSS gradient) indicates scrollable content
- Document structure: caption block → title → to line → cover paragraph → definitions (if applicable) → numbered requests under bold section headings → signature block → certificate of service

### Review Checkpoint

`components/output/ReviewCheckbox.tsx`

- Displayed once above the tabs — not repeated per tab
- Checkbox (unchecked on load): "I have reviewed these documents and accept responsibility for their accuracy before serving."
- Checking the checkbox enables both download buttons immediately
- Copy to clipboard not gated

### Interrogatories Badge

`components/output/InterrogatoriesBadge.tsx`

- Displayed on the Interrogatories tab only
- Count determined by parsing `requests[].items` in the generated JSON — not predicted before generation
- **≤ 25:** Neutral badge showing count
- **> 25:** Red badge showing count and "review limit" label (e.g., "27 — review limit")
- Badge color final values determined during build (`prd.md` open question 3)
- Claude's over-limit notice from `review_notice` field appears at top of Interrogatories document when limit exceeded

### Loading State

`components/shared/LoadingSkeleton.tsx`

- Tabs pre-rendered with correct labels before content arrives
- Skeleton cards pulse with document structure: title area, paragraph line blocks, section label placeholders, download button outlines
- Elicit logo animation: cyan particles drift upward at varying speeds and opacity, loop until response arrives, then fade out
- Wait time estimate below animation: "This usually takes 8–15 seconds."
- On response: skeleton fades out, real document content fades in — smooth transition, no flash

### Inline Error States

`components/shared/ErrorState.tsx`

All errors appear inline on the loading screen. Skeleton stops; error replaces skeleton content. Form data in SessionContext is never cleared by an error.

| Error | Message | Action |
|---|---|---|
| Rate limit (429) | "Too many requests. Please wait a moment and try again." | Try Again button |
| Session limit (10 calls) | "You've reached the session limit. To start a new case, refresh the page." | No retry |
| API / network error | "Something went wrong while drafting your requests. Please try again." | Try Again button |
| Same API error twice in a row | Second line added: "If the problem continues, check your connection or try again shortly." | Try Again button |

Try Again re-triggers the identical API call with no re-entry required.

### Back to Edit

- "Back to edit" button — top left of Page 3
- Returns to `/input` with all form fields, case notes, and selections intact from SessionContext
- Attorney can change any field and Generate again; new output replaces current output on Page 3
- Each regeneration counts against the 10-call session limit

### Start New Session

- "Start new session" text link in header on Pages 2 and 3 — unobtrusive, not a prominent button
- Clicking shows confirmation: "This will clear your current session. Continue?"
- Refreshing the page clears session with no confirmation prompt
- No UI that implies persistence

---

## File Structure

```
elicit/
├── app/
│   ├── layout.tsx                     # Root layout — mounts SessionContext provider
│   ├── globals.css                    # Global styles, Tailwind base, brand colors
│   ├── page.tsx                       # Page 1 — Landing / compliance notice
│   ├── input/
│   │   └── page.tsx                   # Page 2 — Input form
│   ├── output/
│   │   └── page.tsx                   # Page 3 — Document output
│   └── api/
│       └── generate/
│           └── route.ts               # POST — server-side Claude API call
├── components/
│   ├── landing/
│   │   └── ComplianceNotice.tsx       # Three-point notice, Get Started CTA
│   ├── input/
│   │   ├── IdentifyingInfoForm.tsx    # Party names, court, attorney fields
│   │   ├── CaseDetailsForm.tsx        # Case type, level, request types, deadline
│   │   ├── CaseNotesField.tsx         # Notes field, char counter, placeholder hint
│   │   └── GenerateButton.tsx         # Validation gate, loading state trigger
│   ├── output/
│   │   ├── DocumentTabs.tsx           # One tab per selected request type
│   │   ├── DocumentViewer.tsx         # Paper-like formatted document display
│   │   ├── ReviewCheckbox.tsx         # Attorney review gate, enables downloads
│   │   ├── DownloadControls.tsx       # Per-doc .docx + Download all .zip + Copy
│   │   └── InterrogatoriesBadge.tsx   # Request count badge, over-limit detection
│   └── shared/
│       ├── LoadingSkeleton.tsx        # Skeleton cards + logo particle animation
│       └── ErrorState.tsx             # Three inline error states with retry logic
├── context/
│   └── SessionContext.tsx             # All session state: form, docs, API counter
├── lib/
│   ├── prompts/
│   │   └── elicit_system_prompt.md    # System prompt — loaded server-side by API route
│   ├── buildPrompt.ts                 # Constructs structured user message from payload
│   ├── replacePlaceholders.ts         # Find-and-replace after Claude responds
│   ├── buildDocx.ts                   # Assembles .docx from GeneratedDocument JSON
│   └── buildZip.ts                    # Packages .docx files into .zip with jszip
├── data/
│   ├── interrogatories.json           # Reference asset — not a runtime dependency
│   ├── requests_for_production.json   # Reference asset — not a runtime dependency
│   ├── requests_for_admissions.json   # Reference asset — not a runtime dependency
│   └── requests_for_disclosure.json   # Reference asset — not a runtime dependency
├── public/
│   └── [logo, branding assets]
├── docs/                              # Hackathon artifacts
├── process-notes.md
├── .env.local                         # ANTHROPIC_API_KEY — never committed
├── next.config.ts                     # Configured for @opennextjs/cloudflare
├── tailwind.config.ts                 # Custom brand colors
├── wrangler.toml                      # Cloudflare Workers config
└── package.json
```

---

## Key Technical Decisions

**1. React Context over Zustand for session state**
Decided: React Context. No extra library; built into React; scoped to browser tab; clears on refresh — which is exactly the session-only behavior Elicit requires. Zustand would work but adds setup complexity with no material benefit for this app.

**2. One API call per Generate click (all selected document types)**
Decided: Single POST returns a JSON array with one object per selected request type. This keeps the 10-call session counter clean — one Generate = one API call, regardless of how many document types are selected. Splitting per document type would mean one Generate could cost 4 calls.

**3. .docx generation client-side, not server-side**
Decided: Claude API call happens server-side (API key hidden); .docx assembly happens client-side after the response arrives. This avoids Node.js `fs`/`Buffer` compatibility issues in the Cloudflare Workers Edge runtime. The `docx` library runs in the browser via its browser export.

**4. Claude returns structured JSON, not formatted text**
Decided: System prompt instructs Claude to return a JSON array matching the `GeneratedDocument` schema. This eliminates fragile text parsing and gives the `docx` library precise structural inputs for correct formatting (centered captions, bold section headings, numbered lists).

---

## Dependencies & External Services

| Dependency | Version | Purpose | Docs |
|---|---|---|---|
| `next` | 15.x | Framework | [nextjs.org/docs](https://nextjs.org/docs/app) |
| `react`, `react-dom` | 19.x | UI runtime | [react.dev](https://react.dev) |
| `tailwindcss` | 4.x | Styling | [tailwindcss.com](https://tailwindcss.com/docs) |
| `@anthropic-ai/sdk` | latest | Claude API client | [docs.anthropic.com](https://docs.anthropic.com/en/api/getting-started) |
| `docx` | 9.x | .docx generation | [docx.js.org](https://docx.js.org/) |
| `jszip` | 3.x | Zip packaging | [stuk.github.io/jszip](https://stuk.github.io/jszip/) |
| `@opennextjs/cloudflare` | latest | Cloudflare adapter | [opennext.js.org/cloudflare](https://opennext.js.org/cloudflare) |
| `wrangler` | latest | Cloudflare CLI | [developers.cloudflare.com/workers/wrangler](https://developers.cloudflare.com/workers/wrangler/) |
| `typescript` | 5.x | Type safety | — |

**External services:**
- **Anthropic Claude API** — `claude-sonnet-4-6`, `max_tokens: 4000`. API key in `ANTHROPIC_API_KEY`. Pricing: $3/$15 per million tokens. [Platform](https://platform.claude.com)
- **Cloudflare Pages** — Deployment + rate limiting (30 req/IP/hour). Free tier. [Dashboard](https://dash.cloudflare.com)

---

## Brand Tokens

Configured in `tailwind.config.ts`:

```
Navy:       #1A4269  (primary, active tab indicator)
Light blue: #A3DDF2  (particle animation, accents)
Gray:       #707070  (secondary text)
White:      #FFFFFF  (backgrounds)
```

---

## Open Issues

1. **System prompt loading on Cloudflare Workers** — `lib/prompts/elicit_system_prompt.md` must be importable in the Edge runtime. Claude Code should configure this during setup: either a raw file loader in `next.config.ts`, or export the prompt as a TypeScript string constant. The `.md` file is the source of truth; the loading mechanism is a build-time decision. *(Resolve during setup.)*

2. **Pre-filled case notes example text** — A realistic 2–4 sentence TX family law scenario using correct placeholder strings must be authored before the `CaseNotesField` component is built. *(Resolve before build.)*

3. **System prompt update for modificationType** — `elicit_system_prompt.md` needs three conditional instructions added: one for Child Support only, one for Conservatorship/Possession only, one for Both. The `modificationType` field in the structured payload maps directly to these. *(Resolve before build.)*

4. **System prompt output format update** — The system prompt must be updated to instruct Claude to return a JSON array matching the `GeneratedDocument` schema. This update and the modificationType update (issue 3) should happen in the same pass. *(Resolve before build.)*

5. **Request count badge colors** — Final color values for the neutral and over-limit badge states. *(Can wait until build.)*

6. **Zip file naming convention** — `Elicit_Interrogatories.docx` or `Interrogatories.docx`. *(Can wait until build.)*
