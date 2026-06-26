import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t-2 border-border bg-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-btn text-sm font-extrabold">
                G
              </span>
              <span className="font-display text-xl font-extrabold">GigWork</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Post gigs. Pick up side hustles. Stack your bag. Pay via UPI when it's done — built for hustlers who don't do 9-to-5 only.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="sticker sticker-lime text-ink">UPI ✓</span>
              <span className="sticker sticker-pink">verified workers</span>
              <span className="sticker sticker-cyan">same-day gigs</span>
            </div>
          </div>
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-lime">Jump in</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li><Link to="/login?mode=signup" className="hover:text-pink">Create account</Link></li>
              <li><Link to="/login" className="hover:text-pink">Post a gig</Link></li>
              <li><Link to="/login?mode=signup" className="hover:text-pink">Start hustling</Link></li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan">The bag</h4>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Agree on price upfront. We hold payment till the gig's done. You keep most of it — 12% platform fee, that's it.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <span>© {new Date().getFullYear()} GigWork</span>
          <span className="font-display font-semibold text-lime">hustle local · get paid</span>
        </div>
      </div>
    </footer>
  )
}