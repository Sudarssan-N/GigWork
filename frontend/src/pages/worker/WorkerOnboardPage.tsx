import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Upload, Shield } from 'lucide-react'
import { api } from '@/lib/api'
import { uploadWorkerDocument } from '@/lib/storage'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

const SKILL_OPTIONS = [
  'Cleaning', 'Cooking', 'Moving', 'Gardening', 'Pet Care',
  'Errands', 'House Management', 'Event Help', 'Laundry', 'Organizing',
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const STEPS = ['Profile', 'Skills', 'ID Verify', 'Availability']

export function WorkerOnboardPage() {
  const { session, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [fullName, setFullName] = useState('')
  const [city, setCity] = useState('')
  const [bio, setBio] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [idFile, setIdFile] = useState<File | null>(null)
  const [availability, setAvailability] = useState<Record<string, boolean>>(
    Object.fromEntries(DAYS.map((d) => [d, true])),
  )

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    )
  }

  const toggleDay = (day: string) => {
    setAvailability((prev) => ({ ...prev, [day]: !prev[day] }))
  }

  const canProceed = () => {
    if (step === 0) return fullName && city && bio && hourlyRate
    if (step === 1) return selectedSkills.length >= 1
    if (step === 2) return !!idFile
    return true
  }

  const handleSubmit = async () => {
    if (!session?.user.id) return
    setLoading(true)
    setError('')
    try {
      await api.patch('/auth/me', { full_name: fullName, city })

      const docPath = await uploadWorkerDocument(session.user.id, idFile!)

      await api.post('/workers/onboard', {
        bio,
        skills: selectedSkills,
        hourly_rate: parseInt(hourlyRate),
        availability,
      })

      await api.patch('/workers/me', { id_doc_url: docPath })
      await refreshProfile()
      navigate('/tasks')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onboarding failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Become a GigWork Partner</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete your profile to start earning
        </p>
      </div>

      <div className="mb-8 flex justify-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                i < step ? 'bg-brand-600 text-white' :
                i === step ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-500' :
                'bg-gray-100 text-gray-400',
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('hidden text-sm sm:inline', i === step ? 'font-medium' : 'text-gray-400')}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="mx-1 h-px w-6 bg-gray-200" />}
          </div>
        ))}
      </div>

      <Card>
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Tell us about yourself</h2>
            <div>
              <label className="mb-1 block text-sm font-medium">Full name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">City</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Bio</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief intro about your experience..."
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Hourly rate (₹)</label>
              <Input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="300" required />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">Select your skills</h2>
            <p className="mb-4 text-sm text-gray-500">Choose at least one skill</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    selectedSkills.includes(skill)
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="mb-2 text-lg font-semibold">Verify your identity</h2>
            <p className="mb-4 text-sm text-gray-500">
              Upload a government ID (Aadhaar, PAN, or Driving License). Our team will verify within 24 hours.
            </p>
            <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gray-300 p-8 transition-colors hover:border-brand-500 hover:bg-brand-50/50">
              <Shield className="mb-3 h-10 w-10 text-brand-600" />
              <span className="font-medium">{idFile ? idFile.name : 'Click to upload ID'}</span>
              <span className="mt-1 text-xs text-gray-400">JPG, PNG or PDF — max 5MB</span>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setIdFile(e.target.files?.[0] || null)}
              />
            </label>
            {idFile && (
              <p className="mt-3 flex items-center gap-2 text-sm text-brand-600">
                <Upload className="h-4 w-4" /> {idFile.name} ready to upload
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">Your availability</h2>
            <p className="mb-4 text-sm text-gray-500">Which days are you generally available?</p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    'rounded-lg py-3 text-sm font-medium transition-colors',
                    availability[day]
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-400',
                  )}
                >
                  {day}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-brand-50 p-4 text-sm text-brand-800">
              <p className="font-medium">What happens next?</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-brand-700">
                <li>Your profile goes for admin verification</li>
                <li>Once approved, you can apply to tasks</li>
                <li>You'll receive in-app notifications on approval</li>
              </ul>
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}