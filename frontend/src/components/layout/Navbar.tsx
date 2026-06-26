import { Link, useNavigate } from 'react-router-dom'
import { LogOut, User, Map, Plus, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

export function Navbar() {
  const { session, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navLink = 'rounded-full px-3 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-violet-light hover:text-violet'

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border/60 bg-surface/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-btn text-sm font-extrabold text-white shadow-md shadow-violet/30">
            G
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-ink group-hover:text-violet">
            GigWork
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {session && profile ? (
            <>
              <Link to="/tasks" className={`hidden items-center gap-1 sm:flex ${navLink}`}>
                <Map className="h-4 w-4" /> Gigs
              </Link>
              <Link to="/tasks/mine" className={`hidden sm:block ${navLink}`}>
                My stuff
              </Link>
              <Link to="/tasks/new">
                <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" /> Post</Button>
              </Link>
              {profile.has_worker_profile ? (
                <Link to="/worker/applications" className={`hidden md:block ${navLink}`}>
                  Applied
                </Link>
              ) : (
                <Link to="/worker/onboard" className="hidden md:block">
                  <Button size="sm" variant="lime"><Zap className="mr-1 h-3.5 w-3.5" /> Hustle</Button>
                </Link>
              )}
              {profile.role === 'admin' && (
                <Link to="/admin" className={navLink}>Admin</Link>
              )}
              <Link to="/bookings" className={`hidden md:block ${navLink}`}>Bookings</Link>
              <span className="hidden items-center gap-1.5 rounded-full bg-violet-light px-3 py-1 text-sm font-medium text-violet lg:flex">
                <User className="h-3.5 w-3.5" />
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
                <Button size="sm" className="animate-pulse-glow">Let's go</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}