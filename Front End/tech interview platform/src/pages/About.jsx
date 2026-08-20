import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">About</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl">Built for interview readiness.</h1>
          <p className="mt-6 max-w-3xl text-lg text-slate-600">
            Tech Interview Platform helps learners sharpen their technical communication, practice real-world problem solving,
            and work through guided tracks designed for modern engineering interviews.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-xl font-bold text-slate-900">Track-based learning</h2>
              <p className="mt-2 text-sm text-slate-600">Follow focused paths across frontend, backend, and mobile technologies.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-xl font-bold text-slate-900">Practice sessions</h2>
              <p className="mt-2 text-sm text-slate-600">Work through question sets that mirror technical interview scenarios.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-xl font-bold text-slate-900">Progress over time</h2>
              <p className="mt-2 text-sm text-slate-600">Use your dashboard to track how your preparation evolves.</p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/tracks" className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600">
              Explore Tracks
            </Link>
            <Link to="/login" className="inline-flex rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600">
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
