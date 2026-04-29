'use client'

import { useSession } from '@/context/SessionContext'

interface IdentifyingInfoFormProps {
  showErrors: boolean
}

export default function IdentifyingInfoForm({ showErrors }: IdentifyingInfoFormProps) {
  const { session, updateSession } = useSession()

  const baseInput =
    'w-full border border-light-blue rounded px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:border-navy'
  const errorInput =
    'w-full border border-red-500 rounded px-3 py-2 text-sm text-navy bg-white focus:outline-none focus:border-red-500'

  function cls(value: string) {
    return showErrors && value.trim() === '' ? errorInput : baseInput
  }

  const labelClass = 'block text-sm font-medium text-navy mb-1'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Petitioner name */}
      <div>
        <label className={labelClass}>Petitioner name</label>
        <input
          type="text"
          value={session.petitioner}
          onChange={e => updateSession({ petitioner: e.target.value })}
          className={cls(session.petitioner)}
          placeholder="Full legal name"
        />
      </div>

      {/* Respondent name */}
      <div>
        <label className={labelClass}>Respondent name</label>
        <input
          type="text"
          value={session.respondent}
          onChange={e => updateSession({ respondent: e.target.value })}
          className={cls(session.respondent)}
          placeholder="Full legal name"
        />
      </div>

      {/* Opposing counsel name */}
      <div>
        <label className={labelClass}>Opposing counsel name</label>
        <input
          type="text"
          value={session.opposingCounsel}
          onChange={e => updateSession({ opposingCounsel: e.target.value })}
          className={cls(session.opposingCounsel)}
          placeholder="Attorney of record for opposing party"
        />
      </div>

      {/* Cause number */}
      <div>
        <label className={labelClass}>Cause number</label>
        <input
          type="text"
          value={session.causeNumber}
          onChange={e => updateSession({ causeNumber: e.target.value })}
          className={cls(session.causeNumber)}
          placeholder="e.g. 2024-12345"
        />
      </div>

      {/* Court */}
      <div>
        <label className={labelClass}>Court</label>
        <input
          type="text"
          value={session.court}
          onChange={e => updateSession({ court: e.target.value })}
          className={cls(session.court)}
          placeholder="e.g. 256th District Court"
        />
      </div>

      {/* Judicial district */}
      <div>
        <label className={labelClass}>Judicial district</label>
        <input
          type="text"
          value={session.judicialDistrict}
          onChange={e => updateSession({ judicialDistrict: e.target.value })}
          className={baseInput}
          placeholder="e.g. 256th Judicial District"
        />
      </div>

      {/* County */}
      <div>
        <label className={labelClass}>County</label>
        <input
          type="text"
          value={session.county}
          onChange={e => updateSession({ county: e.target.value })}
          className={cls(session.county)}
          placeholder="e.g. Dallas"
        />
      </div>

      {/* Requesting party */}
      <div>
        <label className={labelClass}>Requesting party</label>
        <select
          value={session.requestingParty}
          onChange={e =>
            updateSession({ requestingParty: e.target.value as 'Petitioner' | 'Respondent' })
          }
          className={baseInput}
        >
          <option value="Petitioner">Petitioner</option>
          <option value="Respondent">Respondent</option>
        </select>
      </div>

      {/* Opposing pronoun */}
      <div>
        <label className={labelClass}>Opposing pronoun</label>
        <select
          value={session.opposingPronoun}
          onChange={e =>
            updateSession({ opposingPronoun: e.target.value as 'his' | 'her' | 'their' })
          }
          className={baseInput}
        >
          <option value="his">his</option>
          <option value="her">her</option>
          <option value="their">their</option>
        </select>
      </div>

      {/* Attorney name */}
      <div>
        <label className={labelClass}>Attorney name</label>
        <input
          type="text"
          value={session.attorneyName}
          onChange={e => updateSession({ attorneyName: e.target.value })}
          className={cls(session.attorneyName)}
          placeholder="Your full name"
        />
      </div>

      {/* Firm name */}
      <div>
        <label className={labelClass}>Firm name</label>
        <input
          type="text"
          value={session.firmName}
          onChange={e => updateSession({ firmName: e.target.value })}
          className={cls(session.firmName)}
          placeholder="Law firm name"
        />
      </div>

      {/* Firm address */}
      <div>
        <label className={labelClass}>Firm address</label>
        <input
          type="text"
          value={session.firmAddress}
          onChange={e => updateSession({ firmAddress: e.target.value })}
          className={cls(session.firmAddress)}
          placeholder="Street address"
        />
      </div>

      {/* Firm city/state/zip */}
      <div>
        <label className={labelClass}>Firm city/state/zip</label>
        <input
          type="text"
          value={session.firmCityStateZip}
          onChange={e => updateSession({ firmCityStateZip: e.target.value })}
          className={cls(session.firmCityStateZip)}
          placeholder="City, TX 75201"
        />
      </div>

      {/* Phone */}
      <div>
        <label className={labelClass}>Phone</label>
        <input
          type="tel"
          value={session.phone}
          onChange={e => updateSession({ phone: e.target.value })}
          className={cls(session.phone)}
          placeholder="(214) 555-0100"
        />
      </div>

      {/* Fax */}
      <div>
        <label className={labelClass}>Fax</label>
        <input
          type="tel"
          value={session.fax}
          onChange={e => updateSession({ fax: e.target.value })}
          className={cls(session.fax)}
          placeholder="(214) 555-0101"
        />
      </div>

      {/* Bar number */}
      <div>
        <label className={labelClass}>Bar number</label>
        <input
          type="text"
          value={session.barNumber}
          onChange={e => updateSession({ barNumber: e.target.value })}
          className={cls(session.barNumber)}
          placeholder="State bar number"
        />
      </div>

      {/* Email */}
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          value={session.email}
          onChange={e => updateSession({ email: e.target.value })}
          className={cls(session.email)}
          placeholder="attorney@firm.com"
        />
      </div>

    </div>
  )
}
