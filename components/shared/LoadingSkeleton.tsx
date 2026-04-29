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
  { left: '28%', delay: '0s',   dur: '2.4s', size: 5  },
  { left: '40%', delay: '0.5s', dur: '3.1s', size: 4  },
  { left: '50%', delay: '0.9s', dur: '2.7s', size: 7  },
  { left: '60%', delay: '0.2s', dur: '3.5s', size: 4  },
  { left: '72%', delay: '1.2s', dur: '2.9s', size: 5  },
  { left: '35%', delay: '1.6s', dur: '3.2s', size: 6  },
  { left: '55%', delay: '0.7s', dur: '2.5s', size: 4  },
  { left: '46%', delay: '1.9s', dur: '3.8s', size: 5  },
]

function QuillIcon() {
  return (
    <svg width="36" height="52" viewBox="0 0 36 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left vane */}
      <path d="M18 3C9 7 2 20 5 38L18 28Z" fill="#1A4269" fillOpacity="0.75"/>
      {/* Right vane */}
      <path d="M18 3C27 7 34 20 31 38L18 28Z" fill="#1A4269"/>
      {/* Center rib / shaft */}
      <line x1="18" y1="5" x2="18" y2="49" stroke="#1A4269" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Nib tip */}
      <path d="M15 43L18 49L21 43" stroke="#A3DDF2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function LoadingSkeleton({ requestTypes }: LoadingSkeletonProps) {
  return (
    <div>
      {/* Quill + particle animation */}
      <div className="flex flex-col items-center py-10">
        <div className="relative w-40 h-36 mb-3">
          {/* Quill bobs in center */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0"
            style={{ animation: 'elicit-quill 2.4s ease-in-out infinite' }}
          >
            <QuillIcon />
          </div>
          {/* Particles rise from the quill tip upward — bottom of container is quill tip area */}
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: p.left,
                bottom: '8px',
                width: p.size,
                height: p.size,
                backgroundColor: '#A3DDF2',
                animation: `elicit-float ${p.dur} ${p.delay} ease-in infinite`,
                opacity: 0,
              }}
            />
          ))}
        </div>
        <p className="text-sm" style={{ color: '#707070' }}>Drafting your requests&hellip;</p>
      </div>

      {/* Skeleton tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-light-blue">
        <div className="flex border-b border-light-blue overflow-x-auto">
          {requestTypes.map((type, i) => (
            <div
              key={type}
              className={[
                'px-5 py-3 text-sm font-medium whitespace-nowrap',
                i === 0 ? 'text-navy border-b-2 border-navy -mb-px' : 'text-light-blue',
              ].join(' ')}
            >
              {TYPE_LABELS[type] ?? type}
            </div>
          ))}
        </div>
        <div className="p-6 space-y-3 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-5/6" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-1/3 mt-4" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-4/5" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/3 mt-4" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-5/6" />
        </div>
      </div>

      {/* Skeleton download controls */}
      <div className="mt-4 bg-white rounded-lg border border-light-blue px-5 py-4 animate-pulse">
        <div className="flex gap-3">
          <div className="h-9 bg-gray-100 rounded-md w-40" />
          <div className="h-9 bg-gray-100 rounded-md w-36" />
          <div className="h-9 bg-gray-100 rounded-md w-28 ml-auto" />
        </div>
      </div>

      <style>{`
        @keyframes elicit-quill {
          0%   { transform: translateY(0px) rotate(0deg); }
          25%  { transform: translateY(-7px) rotate(2deg); }
          55%  { transform: translateY(-5px) rotate(-1deg); }
          80%  { transform: translateY(-8px) rotate(1.5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes elicit-float {
          0%   { transform: translateY(0);     opacity: 0; }
          12%  { opacity: 0.85; }
          88%  { opacity: 0.5; }
          100% { transform: translateY(-120px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
