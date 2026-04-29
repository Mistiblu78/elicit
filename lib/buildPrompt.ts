interface BuildPromptInput {
  caseType: string
  modificationType: string | null
  discoveryLevel: string
  requestTypes: string[]
  responseDeadline: string
  caseNotes: string
}

export function buildPrompt(input: BuildPromptInput): string {
  return `Case type: ${input.caseType}
Modification type: ${input.modificationType ?? 'N/A'}
Discovery level: ${input.discoveryLevel}
Request types: ${input.requestTypes.join(', ')}
Response deadline: ${input.responseDeadline}
Case notes: ${input.caseNotes}

Be concise. Generate no more than 15 targeted interrogatories unless the case facts clearly require more. Do not pad with generic requests. Quality over quantity.`
}
