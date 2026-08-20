import { useNavigate } from 'react-router-dom'

const tracks = [
  {
    id: 'react',
    name: 'React',
    category: 'Frontend',
    description: 'Build confident UI patterns, reusable components, and modern React concepts.',
    icon: '⚛️',
    questionCount: 32,
  },
  {
    id: 'angular',
    name: 'Angular',
    category: 'Frontend',
    description: 'Practice component-driven architecture, services, and clean application design.',
    icon: '🅰️',
    questionCount: 28,
  },
  {
    id: 'vue',
    name: 'Vue.js',
    category: 'Frontend',
    description: 'Refine reactivity, composition patterns, and user-centered frontend decisions.',
    icon: '💚',
    questionCount: 30,
  },
  {
    id: 'dotnet',
    name: '.NET',
    category: 'Backend',
    description: 'Work through enterprise patterns, APIs, and core object-oriented problem solving.',
    icon: '🔷',
    questionCount: 26,
  },
  {
    id: 'node',
    name: 'Node.js',
    category: 'Backend',
    description: 'Practice async flows, API design, and scalable backend interview reasoning.',
    icon: '🟩',
    questionCount: 34,
  },
  {
    id: 'mobile',
    name: 'Mobile Development',
    category: 'Mobile',
    description: 'Prepare for app lifecycle decisions, UX flows, and mobile platform tradeoffs.',
    icon: '📱',
    questionCount: 24,
  },
]

export default function TracksPage() {
  const navigate = useNavigate()

  const handleTrackSelect = (trackId) => {
    navigate(`/tracks/${trackId}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Interview setup</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl">Choose Your Track</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Select the technology you want to practice for your technical interview.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="group flex h-full flex-col rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_22px_60px_rgba(99,102,241,0.12)]"
            >
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 via-violet-50 to-purple-100 text-4xl shadow-inner shadow-white/50">
                {track.icon}
              </div>

              <div className="mb-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">{track.category}</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-900">{track.name}</h2>
              </div>

              <p className="text-sm leading-6 text-slate-600">{track.description}</p>

              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-sm font-semibold text-slate-700">{track.questionCount} Questions</span>
                <button
                  type="button"
                  onClick={() => handleTrackSelect(track.id)}
                  className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
                >
                  Choose {track.name} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
