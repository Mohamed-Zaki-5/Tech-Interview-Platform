import PracticeModeCard from './PracticeModeCard'

const modes = [
  {
    title: 'Multiple Choice',
    description: 'Test your knowledge with clearly structured questions that build speed and confidence.',
    icon: '✓',
  },
  {
    title: 'True / False',
    description: 'Quick concept checks to reinforce fundamentals and remove doubt.',
    icon: '✔️',
  },
  {
    title: 'Short Answer',
    description: 'Explain ideas clearly and sharpen communication skills under pressure.',
    icon: '✍️',
  },
  {
    title: 'Long Answer',
    description: 'Practice deeper analysis and structured reasoning for complex technical questions.',
    icon: '📝',
  },
  {
    title: 'Code Challenges',
    description: 'Write working solutions and validate your engineering thinking in real time.',
    icon: '💻',
  },
  {
    title: 'AI Evaluation',
    description: 'Receive intelligent feedback and improvement suggestions with future AI review.',
    icon: '🤖',
    isFuture: true,
  },
]

export default function PracticeModesSection() {
  return (
    <section className="bg-gradient-to-b from-white via-indigo-50/40 to-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex rounded-full border border-violet-200 bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">Practice</div>
          <h2 className="text-4xl font-black tracking-[-0.05em] text-slate-900 sm:text-5xl">Build confidence in every format</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">Prepare for technical interviews with question styles that mirror real hiring rounds and engineering conversations.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {modes.map((mode) => (
            <PracticeModeCard key={mode.title} {...mode} />
          ))}
        </div>
      </div>
    </section>
  )
}
