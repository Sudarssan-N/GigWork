import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight, Sparkles, Truck, ChefHat, Home, ShoppingBag,
  Shield, Clock, IndianRupee, Star, PawPrint, Flower, PartyPopper,
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Footer } from '@/components/layout/Footer'
import { NeighbourhoodBoard } from '@/components/NeighbourhoodBoard'
import type { Category } from '@/types'

const iconMap: Record<string, React.ElementType> = {
  sparkles: Sparkles,
  truck: Truck,
  'chef-hat': ChefHat,
  home: Home,
  'shopping-bag': ShoppingBag,
  'pet-care': PawPrint,
  gardening: Flower,
  'event-help': PartyPopper,
}

const STATS = [
  { value: '10,842', label: 'tasks completed' },
  { value: '5,200', label: 'verified workers' },
  { value: '52', label: 'cities' },
  { value: '4.8★', label: 'average rating' },
]

const TESTIMONIALS = [
  { name: 'Priya S.', city: 'Mumbai', text: 'Found someone for deep cleaning in two hours. Posted, picked a quote, paid by UPI.', role: 'Posted a task' },
  { name: 'Rahul K.', city: 'Bangalore', text: 'Weekend moving gigs pay ₹12–15k a month. I choose what fits my schedule.', role: 'Works gigs' },
  { name: 'Anita M.', city: 'Delhi', text: 'Kitchen help before a dinner party — booked, tracked, done. No chasing anyone.', role: 'Posted a task' },
]

export function LandingPage() {
  const { session, profile } = useAuth()

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
  })

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-mist">
        <div className="local-radius absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-teal">
              Neighbourhood marketplace · India
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
              Small jobs,
              <br />
              <span className="text-teal">done nearby.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted">
              Cleaning, moving, cooking, errands — post what you need or pick up gigs
              in your area. One account does both. Pay by UPI when work is done.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {session ? (
                profile?.role === 'admin' ? (
                  <Link to="/admin"><Button size="lg">Open admin</Button></Link>
                ) : (
                  <Link to="/tasks"><Button size="lg">Explore tasks</Button></Link>
                )
              ) : (
                <>
                  <Link to="/login?mode=signup">
                    <Button size="lg">Post a task</Button>
                  </Link>
                  <Link to="/login?mode=signup">
                    <Button size="lg" variant="saffron">Start earning</Button>
                  </Link>
                </>
              )}
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-verified" /> ID-verified workers
              </li>
              <li className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-teal" /> UPI checkout
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-teal" /> Same-day bookings
              </li>
            </ul>
          </div>
          <NeighbourhoodBoard categories={categories} />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-surface py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center md:text-left">
              <p className="font-mono text-2xl font-medium text-ink">{s.value}</p>
              <p className="mt-1 text-sm text-cement">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-10 max-w-lg">
          <h2 className="text-3xl font-semibold text-ink">What people hire for</h2>
          <p className="mt-3 text-ink-muted">
            Real categories from your city — cleaning, moving, cooking, and more.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon || ''] || Sparkles
            return (
              <Card
                key={cat.id}
                className="group cursor-pointer border-border/80 transition-all hover:border-teal/30 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-teal-light p-2.5 transition-colors group-hover:bg-teal/10">
                    <Icon className="h-5 w-5 text-teal" />
                  </div>
                  <span className="font-medium text-ink">{cat.name}</span>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Dual path */}
      <section className="bg-ink py-20 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl font-semibold">Two sides, one platform</h2>
          <p className="mt-3 max-w-xl text-white/70">
            Need help or want extra income — same account, same neighbourhood radius.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
              <p className="font-mono text-xs uppercase tracking-wider text-teal-light">Post</p>
              <h3 className="mt-3 text-xl font-semibold">Need something done?</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Describe the job, set your budget, and receive quotes from workers nearby.
                Pay only after the work is complete.
              </p>
              <Link to="/login?mode=signup" className="mt-6 inline-block">
                <Button>Post a task <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
            <div className="rounded-xl border border-saffron/30 bg-saffron/10 p-8">
              <p className="font-mono text-xs uppercase tracking-wider text-saffron-light">Earn</p>
              <h3 className="mt-3 text-xl font-semibold">Pick up local gigs?</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Complete worker onboarding, get verified, and apply to open tasks on your schedule.
                Payout goes straight to you.
              </p>
              <Link to="/login?mode=signup" className="mt-6 inline-block">
                <Button variant="saffron">Start earning <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — real sequence */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-semibold text-ink">From post to payout</h2>
          <p className="mt-3 text-ink-muted">The full flow, in order.</p>
          <div className="mt-12 grid gap-0 md:grid-cols-3">
            {[
              { phase: 'Post', title: 'Describe the job', desc: 'Title, location, budget, and when you need it done.' },
              { phase: 'Match', title: 'Workers apply', desc: 'Local workers send quotes. You pick who fits.' },
              { phase: 'Pay', title: 'UPI on completion', desc: 'Payment releases after the task is marked done.' },
            ].map((item, i) => (
              <div
                key={item.phase}
                className={`relative border border-border bg-surface p-8 ${i === 0 ? 'rounded-l-xl md:rounded-r-none' : ''} ${i === 2 ? 'rounded-r-xl md:rounded-l-none' : ''} ${i === 1 ? 'md:-mx-px md:border-x-0' : ''}`}
              >
                <span className="font-mono text-xs font-medium uppercase tracking-wider text-teal">
                  {item.phase}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-paper py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-semibold text-ink">From the neighbourhood</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="flex flex-col">
                <div className="mb-4 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-saffron text-saffron" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-ink-muted">"{t.text}"</p>
                <div className="mt-5 border-t border-border pt-4">
                  <p className="font-medium text-ink">{t.name}</p>
                  <p className="font-mono text-xs text-cement">{t.role} · {t.city}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {!session && (
        <section className="py-20 text-center">
          <h2 className="font-display text-3xl font-semibold text-ink">Ready to start?</h2>
          <p className="mt-3 text-ink-muted">Create one account to post tasks and find work.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/login?mode=signup"><Button size="lg">Create account</Button></Link>
            <Link to="/login"><Button size="lg" variant="outline">Sign in</Button></Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}