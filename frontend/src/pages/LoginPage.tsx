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
    <div className="min-h-[80vh] bg-mesh px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-btn text-sm font-extrabold text-white shadow-lg">
              G
            </span>
            <span className="font-display text-2xl font-extrabold text-ink">GigWork</span>
          </Link>
          <p className="mt-3 text-sm font-medium text-muted">hustle local · get paid</p>
        </div>

        <Card className="border-violet/20 shadow-xl shadow-violet/10">
          <h1 className="font-display text-3xl font-extrabold text-ink">
            {mode === 'signin' ? 'Welcome back' : 'Join the hustle'}
          </h1>
          <p className="mt-2 text-sm font-medium text-ink-muted">
            One account — post gigs & pick up gigs
          </p>

          <div className="mt-6 flex rounded-full bg-violet-light p-1">
            {(['signin', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError('') }}
                className={cn(
                  'flex-1 rounded-full py-2.5 text-sm font-bold transition-all',
                  mode === m
                    ? 'gradient-btn text-white shadow-md'
                    : 'text-muted hover:text-violet',
                )}
              >
                {m === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-sm font-bold text-ink">Your name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="What should we call you?" />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="6+ characters"
              />
            </div>
            {error && (
              <p className="rounded-xl border-2 border-pink/30 bg-pink-light px-3 py-2 text-sm font-medium text-pink">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? 'Hold on…' : mode === 'signin' ? 'Sign in' : "Let's go 🚀"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}