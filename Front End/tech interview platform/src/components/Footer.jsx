import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-slate-950 px-4 py-16 text-slate-300 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-slate-800 pb-10 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 font-black text-white">
                TI
              </div>
              <span className="text-lg font-bold text-white">Tech Interview</span>
            </div>
            <p className="text-sm leading-6 text-slate-400">Practice smarter, improve faster, and get ready for the next stage of your engineering career.</p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">Navigation</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/" className="transition hover:text-indigo-300">Home</Link></li>
              <li><Link to="/tracks" className="transition hover:text-indigo-300">Tracks</Link></li>
              <li><Link to="/about" className="transition hover:text-indigo-300">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">Popular tracks</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/tracks" className="transition hover:text-indigo-300">React</Link></li>
              <li><Link to="/tracks" className="transition hover:text-indigo-300">Node.js</Link></li>
              <li><Link to="/tracks" className="transition hover:text-indigo-300">.NET</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-100">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/about" className="transition hover:text-indigo-300">Blog</Link></li>
              <li><Link to="/about" className="transition hover:text-indigo-300">Documentation</Link></li>
              <li><Link to="/about" className="transition hover:text-indigo-300">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-sm text-slate-400 md:flex-row">
          <p>© 2026 Tech Interview Platform. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/about" className="transition hover:text-indigo-300">Privacy</Link>
            <Link to="/about" className="transition hover:text-indigo-300">Terms</Link>
            <Link to="/about" className="transition hover:text-indigo-300">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
