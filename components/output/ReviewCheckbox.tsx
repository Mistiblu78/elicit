'use client'

interface ReviewCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function ReviewCheckbox({ checked, onChange }: ReviewCheckboxProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-navy shrink-0"
      />
      <span className="text-sm text-gray-700 leading-snug">
        I have reviewed these documents and accept responsibility for their accuracy before serving.
      </span>
    </label>
  )
}
