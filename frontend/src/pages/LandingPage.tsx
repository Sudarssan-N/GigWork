import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight, Sparkles, Truck, ChefHat, Home, ShoppingBag,
  Zap, Star, PawPrint, Flower, PartyPopper, Flame,
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

const CATEGORY_COLORS = [
  'from-pink-light to-violet-light border-pink/30',
  'from-cyan-light to-violet-light border-cyan/30',
  'from-violet-light to-pink-light border-violet/30',
  'from-lime/30 to-cyan-light border-lime/40',
]

const STATS = [
  { value: '10K+', label: 'gigs done', color: 'text-pink' },
  { value: '₹15k', label: 'avg monthly hustle', color: 'text-lime' },
  { value: '52', label: 'cities', color: 'text-cyan' },
  { value: '4.8★', label: 'vibes', color: 'text-orange' },
]

const TESTIMONIALS = [
  { name: 'Priya', city: 'Mumbai', text: 'posted a cleaning gig at 2pm, someone showed up by 4. literally that easy.', tag: 'posted' },
  { name: 'Rahul', city: 'Bangalore', text: 'weekend moving gigs = ₹12-15k extra. no boss, just me and my schedule.', tag: 'hustling' },
  { name: 'Anita', city: 'Delhi', text: 'needed kitchen help before a party. booked, paid UPI, done. zero stress.', tag: 'posted' },
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
      <section className="relative overflow-hidden bg-mesh">
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="sticker sticker-lime">🔥 side hustle era</span>
              <span className="sticker sticker-pink">India</span>
            </div>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Hustle
              <br />
              <span className="gradient-text">local.</span>
              <br />
              Get paid.
            </h1>
            <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-ink-muted">
              Post gigs when you need help. Pick up random tasks when you want extra cash.
              One account, zero corporate nonsense. UPI when it's done.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {session ? (
                profile?.role === 'admin' ? (
                  <Link to="/admin"><Button size="lg">Admin</Button></Link>
                ) : (
                  <Link to="/tasks"><Button size="lg">Find gigs <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
                )
              ) : (
                <>
                  <Link to="/login?mode=signup">
                    <Button size="lg">Post a gig</Button>
                  </Link>
                  <Link to="/login?mode=signup">
                    <Button size="lg" variant="lime">Start hustling <Zap className="ml-2 h-5 w-5" /></Button>
                  </Link>
                </>
              )}
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="sticker sticker-violet">✓ verified</span>
              <span className="sticker sticker-cyan">UPI pay</span>
              <span className="sticker sticker-pink">same-day</span>
            </div>
          </div>
          <NeighbourhoodBoard categories={categories} />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y-2 border-border bg-surface py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl bg-mist/60 p-4 text-center md:text-left">
              <p className={`font-display text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-sm font-medium text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <span className="sticker sticker-pink">what's poppin'</span>
          <h2 className="mt-4 font-display text-4xl font-extrabold text-ink">
            Pick your vibe
          </h2>
          <p className="mt-2 font-medium text-ink-muted">
            Cleaning, moving, cooking, errands — whatever you need or wanna do.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon || ''] || Sparkles
            const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length]
            return (
              <Card
                key={cat.id}
                className={`group cursor-pointer border-2 bg-gradient-to-br transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-violet/15 ${color}`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-surface p-2.5 shadow-sm transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6 text-violet" />
                  </div>
                  <span className="font-bold text-ink">{cat.name}</span>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Dual hustle */}
      <section className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-4xl font-extrabold">
            Two ways to <span className="text-lime">win</span>
          </h2>
          <p className="mt-3 max-w-lg font-medium text-white/60">
            Need help or need cash? Same app. No switching accounts like it's 2010.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border-2 border-violet/40 bg-gradient-to-br from-violet/20 to-pink/10 p-8">
              <span className="sticker sticker-pink">need help</span>
              <h3 className="mt-4 font-display text-2xl font-bold">Post it, forget it</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Drop your gig, set your budget, let local hustlers come to you.
                Pay UPI only when it's actually done.
              </p>
              <Link to="/login?mode=signup" className="mt-6 inline-block">
                <Button variant="pink">Post a gig <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
            <div className="rounded-3xl border-2 border-lime/40 bg-gradient-to-br from-lime/15 to-cyan/10 p-8">
              <span className="sticker sticker-lime text-ink">need cash</span>
              <h3 className="mt-4 font-display text-2xl font-bold">Stack your bag</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                Get verified, browse open gigs near you, apply on your own time.
                Weekend warrior? Evening grinder? You do you.
              </p>
              <Link to="/login?mode=signup" className="mt-6 inline-block">
                <Button variant="lime">Start hustling <Flame className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-4xl font-extrabold text-ink">How it goes</h2>
          <p className="mt-2 font-medium text-ink-muted">Three steps. No MBA required.</p>
          <div className="mt-10 flex flex-col gap-4 md:flex-row">
            {[
              { emoji: '📝', title: 'Post your gig', desc: 'What, where, how much, when. Done in 2 mins.', bg: 'bg-pink-light border-pink/30' },
              { emoji: '🤝', title: 'Someone applies', desc: 'Local hustlers send quotes. You pick your person.', bg: 'bg-violet-light border-violet/30' },
              { emoji: '💸', title: 'UPI & done', desc: "Pay when the job's finished. Rate them. Repeat.", bg: 'bg-lime/40 border-lime/50' },
            ].map((item) => (
              <Card key={item.title} className={`flex-1 border-2 ${item.bg}`}>
                <span className="text-3xl">{item.emoji}</span>
                <h3 className="mt-3 font-display text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-sm font-medium text-ink-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t-2 border-border bg-mesh py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-4xl font-extrabold text-ink">Real talk</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Card
                key={t.name}
                className={`border-2 ${i === 1 ? 'border-lime/50 bg-lime/10' : 'border-pink/30 bg-pink-light/30'}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`sticker ${t.tag === 'hustling' ? 'sticker-lime text-ink' : 'sticker-pink'}`}>
                    {t.tag}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-orange text-orange" />
                    ))}
                  </div>
                </div>
                <p className="text-sm font-medium leading-relaxed text-ink">"{t.text}"</p>
                <p className="mt-4 font-bold text-ink">{t.name}</p>
                <p className="text-xs font-medium text-muted">{t.city}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {!session && (
        <section className="py-16 text-center">
          <h2 className="font-display text-4xl font-extrabold gradient-text">You in?</h2>
          <p className="mt-3 font-medium text-ink-muted">Free account. Post gigs. Pick up gigs. Stack the bag.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/login?mode=signup"><Button size="lg" className="animate-pulse-glow">Let's go</Button></Link>
            <Link to="/login"><Button size="lg" variant="outline">Sign in</Button></Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}