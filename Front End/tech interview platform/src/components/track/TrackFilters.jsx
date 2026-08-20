export function DifficultySelector({ levels, selected, onSelect }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Difficulty</p>
      <div className="flex flex-wrap gap-2">
        {levels.map((level) => {
          const active = selected === level
          return (
            <button
              key={level}
              type="button"
              onClick={() => onSelect(level)}
              className={[
                'rounded-full border px-3 py-2 text-sm font-medium transition',
                active
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-600',
              ].join(' ')}
            >
              {level}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function QuestionTypeSelector({ types, selected, onSelect }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Question type</p>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => {
          const active = selected === type
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelect(type)}
              className={[
                'rounded-full border px-3 py-2 text-sm font-medium transition',
                active
                  ? 'border-violet-600 bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:text-violet-600',
              ].join(' ')}
            >
              {type}
            </button>
          )
        })}
      </div>
    </div>
  )
}
