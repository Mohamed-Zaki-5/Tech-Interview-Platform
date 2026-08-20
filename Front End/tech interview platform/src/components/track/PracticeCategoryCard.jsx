export function PracticeCategoryCard({ title, difficulty, questionType, duration, active = false }) {
  return (
    <div className={[
      'rounded-2xl border bg-white p-5 shadow-sm transition',
      active ? 'border-indigo-200 bg-indigo-50/40 shadow-md' : 'border-slate-200 hover:border-indigo-200',
    ].join(' ')}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Practice</p>
          <h4 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-900">{title}</h4>
        </div>
        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">{duration}</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">{difficulty}</span>
        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">{questionType}</span>
      </div>

      <button type="button" className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600">
        Start Practice
      </button>
    </div>
  )
}
