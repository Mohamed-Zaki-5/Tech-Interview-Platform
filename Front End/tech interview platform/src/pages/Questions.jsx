import { Link, useLocation } from 'react-router-dom'

export default function Questions() {
  const location = useLocation()
  const summary = location.state || {
    track: 'React',
    experience: 'Junior',
    difficulty: 'Adaptive',
    questionCount: 20,
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Interview</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-slate-900">Questions</h1>
          <p className="mt-4 text-lg text-slate-600">
            The question engine will be connected here when the full interview system is ready.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Track</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{summary.track}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Experience</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{summary.experience}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Difficulty</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{summary.difficulty}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Questions</p>
              <p className="mt-2 text-lg font-bold text-slate-900">{summary.questionCount}</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-700">
            Question types will be selected automatically by the interview engine based on the selected track, experience level, difficulty, and future performance.
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/tracks" className="inline-flex rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600">
              Choose Another Track
            </Link>
            <Link to="/dashboard" className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
