import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Map, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const { session, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navLink = 'text-sm text-ink-muted transition-colors hover:text-teal'

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal text-sm font-bold text-white">
            G
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink group-hover:text-teal">
            GigWork
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          {session && profile ? (
            <>
              <Link to="/tasks" className={`hidden items-center gap-1 sm:flex ${navLink}`}>
                <Map className="h-4 w-4" /> Explore
              </Link>
              <Link to="/tasks/mine" className={`hidden sm:block ${navLink}`}>
                My tasks
              </Link>
              <Link to="/tasks/new">
                <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Post</Button>
              </Link>
              {profile.has_worker_profile ? (
                <Link to="/worker/applications" className={`hidden md:block ${navLink}`}>
                  Applications
                </Link>
              ) : (
                <Link to="/worker/onboard" className="hidden md:block">
                  <Button size="sm" variant="outline">Start earning</Button>
                </Link>
              )}
              {profile.role === 'admin' && (
                <Link to="/admin" className={navLink}>Admin</Link>
              )}
              <Link to="/bookings" className={`hidden md:block ${navLink}`}>Bookings</Link>
              <span className="hidden items-center gap-1.5 border-l border-border pl-3 text-sm text-cement lg:flex">
                <User className="h-4 w-4" />
                {profile.full_name || profile.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLink}>Sign in</Link>
              <Link to="/login?mode=signup">
                <Button size="sm">Create account</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}