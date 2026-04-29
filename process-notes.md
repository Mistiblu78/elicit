# Process Notes

## /scope

**How the idea evolved:** Lisha arrived with a fully-formed concept — not a sketch. Core architecture (placeholder substitution, session-only, ethics compliance framework) was decided before the conversation started. The conversation primarily surfaced specifics (4 document types, Word output, per-type files) and confirmed scope boundaries.

**Pushback received:** The "what's cut" question surfaced the larger 4-part product vision (dashboard, discovery guide, document management, communication portal, responses). When I over-interpreted this as scope creep, Lisha corrected me directly — she was answering the question by providing context, not adding features. She was clear and confident throughout.

**References that resonated:** Briefpoint resonated most as the clearest parallel. Elicit's differentiators (TX-specific, family law-specific, PII architecture, ethics compliance) landed clearly against it. Eve Legal reinforced the market exists. EsquireTek confirmed the "attorney in control" vs. "black box service" distinction.

**Deepening rounds:** Zero. Lisha came in with complete answers. No deepening was needed — she had already done the thinking.

**Active shaping:** Lisha drove the direction entirely. She corrected my misread of her scope answer immediately and without hesitation. She added compliance notices (on load, inline, pre-download) and placeholder enforcement as unprompted details in her final message, showing she had already thought through the UX constraints. She did not accept suggestions passively — every key decision in the scope doc originated from her.

## /prd

**What Lisha added vs. the scope doc:**
The scope doc sketched the three pages and the placeholder system. The PRD added: the Modification sub-type distinction (Conservatorship/Possession vs. Child Support vs. Both), the exact case type list (4 types, not 3), the tab-based output layout with a dynamic download label, the single review checkbox gate, the interrogatory count badge with over-limit detection, the animated loading state with skeleton cards and logo particle animation, the inline error state design (3 types, all non-destructive), the "Back to edit" navigation with session state retention, the {SignatureBlock} placeholder in the .docx, and the "Start new session" text link with confirmation.

**What "what if" questions surprised her:**
The soft warning trigger logic surfaced a gap — "multiple issue categories" wasn't mapped to anything on the form. Lisha resolved it cleanly: trigger on case type (Divorce With Children / SAPCR / Modification) when Interrogatories is selected. The Modification sub-type → API payload mapping question (form-to-prompt, not inference) prompted a clear design principle she named explicitly: "The attorney made an explicit selection. The app passes it as an explicit instruction." That principle extends to the entire structured input object.

**What she pushed back on or felt strongly about:**
Removed the PII detection warning from the output page immediately and without hesitation — her reasoning was precise: discovery is served on opposing counsel, attorneys understand their case notes, the placeholder system is the protection layer. No additional warning needed. This was a firm, well-reasoned scope cut.

Also held firm on no automatic interrogatory trimming — the app flags, the attorney decides. Strategic decisions stay with the attorney.

**How scope guard conversations went:**
Scope stayed tight throughout. No feature creep. Lisha added the soft warning on Page 2 when prompted to decide ("in or out?") — the only addition during the PRD conversation. Everything else was precision, not expansion.

**Deepening rounds:**
One round, four questions. Surfaced: soft warning trigger logic (resolved cleanly), case notes scaffolding (pre-filled example decided), Devpost wow moment (articulated precisely — three sentences in, experienced attorney-quality document out, issue-driven not template-based), Modification sub-type → content mapping (form-to-prompt mapping principle established). The deepening round strengthened acceptance criteria significantly, particularly for the generation epic.

**Active shaping:**
Lisha drove every key decision. The Modification case type expansion (adding sub-selection) came entirely from her. The tab layout rationale ("each document is a separate legal instrument — attorneys think of them that way") was her framing. The session model ("temporary by design") was articulated precisely. She named the design principle behind error handling ("never drop the attorney back to Page 2 automatically") and behind the structured input object ("form-to-prompt mapping, not inference"). No passive acceptance of suggestions — every decision has a reason.

## /onboard

**Technical experience:** Beginner-to-intermediate. Built a full company website with Kiro.dev. No traditional coding background but picks up technical concepts easily. Has Bun/Railway stack preference, GitHub/Stripe/Cloudflare accounts ready.

**Learning goals:** Wants SDD to become habit; wants to recognize key decision points during vibe coding; wants confidence to ship something useful. Previously found vibe coding slow because she was figuring out requirements mid-build — directly the problem SDD solves.

**Creative sensibility:** Practical, clean, productivity-focused. No strong aesthetic signals beyond "tools that work." Defaults to clean and functional.

**Prior SDD experience:** Yes — has informally planned before building. Already has the instinct; this process gives it structure.

**Notable context:** Lisha is a domain expert (paralegal, Texas family law) building for her own professional context. Her project idea (speeding up discovery in family law cases) is grounded in real daily pain. She's not here to experiment — she has a specific problem she wants to solve.

**Energy/engagement:** Focused and direct. Gives precise, efficient answers. Comfortable with technical concepts. Likely to move fast once she understands the process.

## /spec

**Technical decisions made:**
- State management: React Context (built-in, no extra library, clears on refresh — matches session-only requirement). Zustand considered and declined — no material benefit for this app's complexity.
- Deployment: Cloudflare Pages confirmed for native rate limiting. `@cloudflare/next-on-pages` deprecated; switched to `@opennextjs/cloudflare`. Claude Code handles adapter configuration during setup.
- Claude model: updated from `claude-sonnet-4-5` to `claude-sonnet-4-6` (current supported version).
- .docx generation: `docx` npm library, client-side. Claude call happens server-side (API key hidden); .docx assembly happens in the browser after response arrives. Avoids Cloudflare Workers Edge runtime compatibility issues with Node.js APIs.
- Claude output format: structured JSON array (one `GeneratedDocument` object per selected request type). Eliminates fragile text parsing; gives docx library precise structural inputs.
- One API call per Generate click (all selected document types). Keeps 10-call session counter clean.
- System prompt: renamed to `elicit_system_prompt.md`, lives at `lib/prompts/` (server-side utility), not `data/` (reference assets). JSON data files (`interrogatories.json` etc.) are reference assets only — not passed to Claude API at runtime.
- User message format: explicit labeled fields, `modificationType: N/A` when not applicable. No inference from case notes — Lisha's established principle: "form-to-prompt mapping, not inference."
- zip packaging: `jszip`, client-side.

**What Lisha was confident about vs. uncertain:**
Confident about everything architectural — she came in with the stack already chosen and the data flow already designed. The only thing she confirmed she didn't have was Next.js experience. She was completely unfazed by this — comfortable delegating implementation to the AI agent. She corrected two things: (1) the system prompt file location (data/ → lib/prompts/), (2) a tree indentation error placing app/api/ inside app/output/. Both corrections were immediate and precise.

**Stack choices and why:**
Next.js + Cloudflare Pages was her existing choice. The only adjustment was the Cloudflare adapter (deprecated → OpenNext) — she accepted the update without hesitation and added that Claude Code should configure this during setup. The JSON output format decision was collaborative — she immediately confirmed the schema and provided the exact field names, implying she had already thought about this.

**Deepening rounds:** Zero. Lisha's PRD was detailed enough that the mandatory questions covered the full architecture. She moved directly from confirming state management (React Context) → API route → find-and-replace → .docx generation → file structure → spec generation without pausing for a deepening round.

**Active shaping:** Lisha drove every correction and addition. She provided the exact JSON schema for the Claude output format (with field names she specified). She caught the file structure error. She clarified the system prompt location. She specified the user message format verbatim. She updated the model version herself. Every architectural decision that touched her existing IP (system prompt, data files, placeholder map) was hers — not suggested by the agent.
