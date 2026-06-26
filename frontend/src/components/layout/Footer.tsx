import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal text-sm font-bold text-white">
                G
              </span>
              <span className="font-display text-lg font-semibold text-ink">GigWork</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
              Your neighbourhood marketplace for small tasks. Post what you need done,
              pick a local worker, pay through UPI when the job's finished.
            </p>
          </div>
          <div className="md:col-span-3">
            <h4 className="font-mono text-xs font-medium uppercase tracking-wider text-cement">Get started</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-muted">
              <li><Link to="/login?mode=signup" className="hover:text-teal">Create account</Link></li>
              <li><Link to="/login" className="hover:text-teal">Post a task</Link></li>
              <li><Link to="/login?mode=signup" className="hover:text-teal">Start earning</Link></li>
            </ul>
          </div>
          <div className="md:col-span-4">
            <h4 className="font-mono text-xs font-medium uppercase tracking-wider text-cement">How payment works</h4>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              You agree on a price upfront. GigWork holds payment until the task is done.
              Workers receive payout minus a 12% platform fee.
            </p>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-cement sm:flex-row">
          <span>© {new Date().getFullYear()} GigWork</span>
          <span className="font-mono">Built for neighbourhoods across India</span>
        </div>
      </div>
    </footer>
  )
}