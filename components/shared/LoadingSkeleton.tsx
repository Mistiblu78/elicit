'use client'

const TYPE_LABELS: Record<string, string> = {
  Interrogatories: 'Interrogatories',
  RFP: 'Requests for Production',
  RFA: 'Requests for Admissions',
  Disclosure: 'Requests for Disclosure',
}

interface LoadingSkeletonProps {
  requestTypes: string[]
}

const PARTICLES = [
  { left: '20%', delay: '0s',   dur: '2.4s', size: 6  },
  { left: '35%', delay: '0.4s', dur: '3.1s', size: 4  },
  { left: '50%', delay: '0.8s', dur: '2.7s', size: 8  },
  { left: '62%', delay: '0.2s', dur: '3.5s', size: 5  },
  { left: '75%', delay: '1.1s', dur: '2.9s', size: 4  },
  { left: '28%', delay: '1.5s', dur: '3.2s', size: 7  },
  { left: '55%', delay: '0.6s', dur: '2.5s', size: 5  },
  { left: '42%', delay: '1.8s', dur: '3.8s', size: 6  },
]

export default function LoadingSkeleton({ requestTypes }: LoadingSkeletonProps) {
  return (
    <div>
      {/* Particle animation */}
      <div className="flex flex-col items-center py-10">
        <div className="relative w-48 h-24 mb-4 overflow-hidden">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute bottom-0 rounded-full"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                backgroundColor: '#A3DDF2',
                animation: `elicit-float ${p.dur} ${p.delay} ease-in infinite`,
                opacity: 0,
              }}
            />
          ))}
        </div>
        <p className="text-sm text-gray-muted">This usually takes 8&ndash;15 seconds.</p>
      </div>

      {/* Skeleton tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {requestTypes.map((type, i) => (
            <div
              key={type}
              className={[
                'px-5 py-3 text-sm font-medium whitespace-nowrap',
                i === 0 ? 'text-navy border-b-2 border-navy -mb-px' : 'text-gray-200',
              ].join(' ')}
            >
              {TYPE_LABELS[type] ?? type}
            </div>
          ))}
        </div>
        <div className="p-6 space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mt-4" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-4/5" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3 mt-4" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>

      {/* Skeleton download controls */}
      <div className="mt-4 bg-white rounded-lg border border-gray-200 px-5 py-4 animate-pulse">
        <div className="flex gap-3">
          <div className="h-9 bg-gray-200 rounded-md w-40" />
          <div className="h-9 bg-gray-200 rounded-md w-36" />
          <div className="h-9 bg-gray-200 rounded-md w-28 ml-auto" />
        </div>
      </div>

      <style>{`
        @keyframes elicit-float {
          0%   { transform: translateY(0);    opacity: 0; }
          15%  { opacity: 0.8; }
          85%  { opacity: 0.6; }
          100% { transform: translateY(-96px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
