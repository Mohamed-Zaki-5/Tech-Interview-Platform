export default function TrackCard({ name, category, description, questions, icon }) {
  return (
    <div className="group h-full overflow-hidden rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_22px_60px_rgba(99,102,241,0.12)]">
      <div className="mb-5 flex h-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 via-violet-50 to-purple-100 text-4xl shadow-inner shadow-white/50">
        {icon}
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-600">{category}</p>
        <h3 className="text-2xl font-bold tracking-[-0.04em] text-slate-900">{name}</h3>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <span className="h-2 w-2 rounded-full bg-indigo-600" />
          {questions} questions
        </div>
        <span className="text-xs font-semibold text-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">Explore →</span>
      </div>
    </div>
  )
}
