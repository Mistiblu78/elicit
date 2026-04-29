'use client'

import type { GeneratedDocument } from '@/context/SessionContext'

const TYPE_LABELS: Record<string, string> = {
  interrogatories: 'Interrogatories',
  rfp: 'Requests for Production',
  rfa: 'Requests for Admissions',
  disclosure: 'Requests for Disclosure',
}

interface DocumentTabsProps {
  documents: GeneratedDocument[]
  activeIndex: number
  onTabChange: (index: number) => void
  children?: React.ReactNode
}

export default function DocumentTabs({
  documents,
  activeIndex,
  onTabChange,
  children,
}: DocumentTabsProps) {
  return (
    <div>
      <div className="flex border-b border-light-blue overflow-x-auto" role="tablist">
        {documents.map((doc, i) => {
          const label = TYPE_LABELS[doc.type] ?? doc.type
          const isActive = i === activeIndex
          return (
            <button
              key={doc.type}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(i)}
              className={[
                'px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'text-navy border-b-2 border-navy -mb-px'
                  : 'text-gray-muted hover:text-navy',
              ].join(' ')}
            >
              {label}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" className="p-6">
        {children}
      </div>
    </div>
  )
}
