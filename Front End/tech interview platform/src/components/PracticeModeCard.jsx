export default function PracticeModeCard({ title, description, icon, isFuture = false }) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)]">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-2xl shadow-inner shadow-white/60 transition-transform duration-300 group-hover:scale-105">{icon}</div>

      <h3 className="mb-2 text-xl font-bold tracking-[-0.03em] text-slate-900">{title}</h3>
      <p className="mb-5 text-sm leading-6 text-slate-600">{description}</p>

      {isFuture ? (
        <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-700">Coming Soon</span>
      ) : (
        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">Available</span>
      )}
    </div>
  )
}
