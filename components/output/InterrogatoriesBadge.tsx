'use client'

import type { GeneratedDocument } from '@/context/SessionContext'

interface InterrogatoriesBadgeProps {
  doc: GeneratedDocument
}

export default function InterrogatoriesBadge({ doc }: InterrogatoriesBadgeProps) {
  const count = doc.requests?.reduce((sum, section) => sum + section.items.length, 0) ?? 0
  const overLimit = count > 25

  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        overLimit ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600',
      ].join(' ')}
    >
      {overLimit ? `${count} — review limit` : `${count} interrogatories`}
    </span>
  )
}
