import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildPrompt } from '@/lib/buildPrompt'
import { SYSTEM_PROMPT } from '@/lib/prompts/systemPromptContent'

// Note: 'edge' runtime is used in Cloudflare deployment via OpenNext.
// For local dev (Node.js/Bun), the default Node runtime is used to avoid
// the edge emulator's 30s execution timeout on long Anthropic API calls.
// export const runtime = 'edge'

interface GeneratePayload {
  caseType: string
  modificationType: string | null
  discoveryLevel: string
  requestTypes: string[]
  responseDeadline: string
  caseNotes: string
  apiCallCount: number
}

export async function POST(request: Request) {
  try {
    const payload: GeneratePayload = await request.json()

    // Session limit check — secondary guard (primary is client-side)
    if (payload.apiCallCount >= 10) {
      return NextResponse.json({ error: 'session_limit' }, { status: 200 })
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 120000 })

    // One API call per request type — keeps each call under 4,000 tokens and prevents timeouts
    const perTypeResults = await Promise.all(
      payload.requestTypes.map(async (requestType) => {
        const userMessage = buildPrompt({
          caseType: payload.caseType,
          modificationType: payload.modificationType,
          discoveryLevel: payload.discoveryLevel,
          requestTypes: [requestType],
          responseDeadline: payload.responseDeadline,
          caseNotes: payload.caseNotes,
        })

        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        })

        const content = response.content[0]
        if (content.type !== 'text') throw new Error('non_text_response')

        console.log(`[${requestType}] stop_reason:`, response.stop_reason)
        console.log(`[${requestType}] output_tokens:`, response.usage.output_tokens)

        // Strip markdown code fences if Claude wrapped the JSON
        let rawText = content.text.trim()
        if (rawText.startsWith('```')) {
          rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
        }
        // Strip any leading warning lines (e.g. "⚠ Possible PII detected...") before the JSON array
        const jsonStart = rawText.indexOf('[')
        if (jsonStart > 0) rawText = rawText.slice(jsonStart)
        // Strip any trailing garbage after the closing bracket (e.g. stray backticks)
        const jsonEnd = rawText.lastIndexOf(']')
        if (jsonEnd >= 0 && jsonEnd < rawText.length - 1) rawText = rawText.slice(0, jsonEnd + 1)

        return JSON.parse(rawText) as unknown[]
      })
    )

    const documents = perTypeResults.flat()
    return NextResponse.json(documents)

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json({ error: 'api_error' }, { status: 500 })
  }
}
