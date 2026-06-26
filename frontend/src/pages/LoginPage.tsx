import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

type Mode = 'signin' | 'signup'

function redirectAfterAuth(profile: Profile | null, navigate: ReturnType<typeof useNavigate>) {
  if (!profile?.full_name || !profile?.city) {
    navigate('/onboarding')
    return
  }
  if (profile.role === 'admin') navigate('/admin')
  else navigate('/tasks')
}

export function LoginPage() {
  const { signIn, signUp, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<Mode>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      if (mode === 'signup') {
        await signUp(email, password, fullName)
      } else {
        await signIn(email, password)
      }
      const profile = await refreshProfile()
      redirectAfterAuth(profile, navigate)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal text-sm font-bold text-white">
            G
          </span>
          <span className="font-display text-xl font-semibold text-ink">GigWork</span>
        </Link>
      </div>

      <Card className="border-border/80 shadow-md">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          One account to post tasks and pick up gigs
        </p>

        <div className="mt-6 flex rounded-lg bg-mist p-1">
          {(['signin', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError('') }}
              className={cn(
                'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
                mode === m ? 'bg-surface text-ink shadow-sm' : 'text-cement hover:text-ink-muted',
              )}
            >
              {m === 'signin' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Full name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
      </Card>
    </div>
  )
}