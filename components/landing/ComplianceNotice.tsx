'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function ComplianceNotice() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-xl w-full">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Image
            src="/elicit-logo.png"
            alt="Elicit"
            width={280}
            height={94}
            priority
            style={{ width: '280px', height: 'auto' }}
          />
          <p style={{ color: '#707070', fontSize: '16px', textAlign: 'center', marginTop: '8px' }}>
            Texas discovery requests, drafted in seconds
          </p>
        </div>

        {/* Three compliance cards */}
        <div className="space-y-3 mb-8">
          <div className="border rounded-lg p-4 bg-white" style={{ borderColor: '#A3DDF2' }}>
            <p className="text-sm" style={{ color: '#1A4269' }}>
              <strong>Two-field approach:</strong> You enter identifying information separately from
              your case notes. Case notes use role-based placeholders like [PETITIONER] — no client
              names ever reach the AI model.
            </p>
          </div>
          <div className="border rounded-lg p-4 bg-white" style={{ borderColor: '#A3DDF2' }}>
            <p className="text-sm" style={{ color: '#1A4269' }}>
              <strong>Attorney review required:</strong> All output is a draft. You must review
              every request, confirm accuracy, and accept responsibility before serving on opposing
              counsel.
            </p>
          </div>
          <div className="border rounded-lg p-4 bg-white" style={{ borderColor: '#A3DDF2' }}>
            <p className="text-sm" style={{ color: '#1A4269' }}>
              <strong>Session-only:</strong> No case data is stored, logged, or retained.
              Everything clears when you close or refresh the tab. Elicit does not know who you are.
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/input')}
          className="w-full text-white py-3 px-6 rounded-md font-medium transition-colors"
          style={{ backgroundColor: '#1A4269' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#163659')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1A4269')}
        >
          Get Started
        </button>
      </div>
    </main>
  )
}
