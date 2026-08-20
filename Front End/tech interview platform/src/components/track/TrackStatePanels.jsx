export function LoadingState({ title = 'Loading track content', message = 'Preparing practice content and track details...' }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
      <h3 className="mt-5 text-center text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-center text-sm text-slate-600">{message}</p>
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message = 'We could not load this track right now. Please try another track or revisit later.' }) {
  return (
    <div className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl">⚠️</div>
      <h3 className="mt-5 text-center text-xl font-bold text-rose-700">{title}</h3>
      <p className="mt-2 text-center text-sm text-rose-700/80">{message}</p>
    </div>
  )
}

export function EmptyState({ title = 'No track selected', message = 'Choose a track to preview its practice categories and question formats.' }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-8 shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-2xl">📚</div>
      <h3 className="mt-5 text-center text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-center text-sm text-slate-600">{message}</p>
    </div>
  )
}
