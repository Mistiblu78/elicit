'use client'
import { useRouter } from 'next/navigation'

export default function ComplianceNotice() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold text-navy mb-2 text-center">Elicit</h1>
        <p className="text-center text-gray-muted mb-8 text-sm">
          Texas family law discovery requests, drafted in seconds.
        </p>

        <div className="border border-navy/20 rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-base font-semibold text-navy mb-4">
            Before you begin — how Elicit handles your data
          </h2>

          <ol className="space-y-3 text-sm text-gray-800">
            <li className="flex gap-3">
              <span className="text-navy font-bold min-w-[1.25rem]">1.</span>
              <span>
                <strong>Two-field approach:</strong> You enter identifying information (names, cause
                number, attorney details) separately from your case notes. Case notes use
                role-based placeholders like [PETITIONER] — no client names ever reach the AI
                model.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-navy font-bold min-w-[1.25rem]">2.</span>
              <span>
                <strong>Attorney review required:</strong> All output is a draft. You must review
                every request, confirm accuracy, and accept responsibility before serving on
                opposing counsel.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-navy font-bold min-w-[1.25rem]">3.</span>
              <span>
                <strong>Session-only:</strong> No case data is stored, logged, or retained.
                Everything clears when you close or refresh the tab. Elicit does not know who you
                are.
              </span>
            </li>
          </ol>

          <button
            onClick={() => router.push('/input')}
            className="mt-6 w-full bg-navy text-white py-3 px-6 rounded-md font-medium hover:bg-navy/90 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </main>
  )
}
