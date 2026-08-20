import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const trackCatalog = {
  react: { name: 'React', category: 'Frontend', questionCount: 32 },
  angular: { name: 'Angular', category: 'Frontend', questionCount: 28 },
  vue: { name: 'Vue.js', category: 'Frontend', questionCount: 30 },
  dotnet: { name: '.NET', category: 'Backend', questionCount: 26 },
  node: { name: 'Node.js', category: 'Backend', questionCount: 34 },
  mobile: { name: 'Mobile Development', category: 'Mobile', questionCount: 24 },
}

const experienceLevels = [
  {
    value: 'Junior',
    years: '0–2 years',
    description: 'Focus on fundamentals, core concepts, and entry-level interview skills.',
  },
  {
    value: 'Mid-Level',
    years: '2–5 years',
    description: 'Focus on practical development, problem solving, and real-world engineering.',
  },
  {
    value: 'Senior',
    years: '5+ years',
    description: 'Focus on advanced concepts, architecture, scalability, and engineering decisions.',
  },
]

const difficultyModes = [
  {
    value: 'Adaptive',
    description: 'Questions automatically adjust in difficulty based on your performance.',
    featured: true,
  },
  { value: 'Easy', description: 'A lighter and more foundational interview pace.' },
  { value: 'Medium', description: 'A balanced interview for steady, practical challenge.' },
  { value: 'Hard', description: 'A tougher interview designed to push your limits.' },
]

export default function TrackDetail() {
  const { trackId } = useParams()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [selectedExperience, setSelectedExperience] = useState('Junior')
  const [selectedDifficulty, setSelectedDifficulty] = useState('Adaptive')

  const track = useMemo(() => trackCatalog[trackId] || trackCatalog.react, [trackId])
  const canStartInterview = Boolean(track && selectedExperience && selectedDifficulty)

  const handleStartInterview = () => {
    if (!canStartInterview) return

    const nextPath = `/practice/${trackId}?experience=${encodeURIComponent(selectedExperience)}&difficulty=${encodeURIComponent(selectedDifficulty)}`
    const payload = {
      track: track.name,
      experience: selectedExperience,
      difficulty: selectedDifficulty,
      questionCount: track.questionCount,
    }

    if (isAuthenticated) {
      navigate(nextPath, { state: payload })
      return
    }

    navigate(`/login?redirect=${encodeURIComponent(nextPath)}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Track</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl">{track.name}</h1>
          </div>
          <Link to="/tracks" className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600">
            ← Back to tracks
          </Link>
        </div>

        <div className="space-y-8">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Experience Level</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-900">What&apos;s your experience level?</h2>
            <p className="mt-3 text-base text-slate-600">Choose the level that best matches the interview you&apos;re preparing for.</p>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {experienceLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setSelectedExperience(level.value)}
                  className={[
                    'rounded-[1.75rem] border p-5 text-left transition-all duration-200',
                    selectedExperience === level.value
                      ? 'border-indigo-200 bg-indigo-50 shadow-sm ring-2 ring-indigo-100'
                      : 'border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-white',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xl font-black tracking-[-0.04em] text-slate-900">{level.value}</span>
                    {selectedExperience === level.value && <span className="rounded-full bg-indigo-600 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">Selected</span>}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-indigo-600">{level.years}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{level.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Difficulty Mode</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-900">Choose Your Challenge</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {difficultyModes.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setSelectedDifficulty(mode.value)}
                  className={[
                    'rounded-[1.75rem] border p-5 text-left transition-all duration-200',
                    selectedDifficulty === mode.value
                      ? mode.featured
                        ? 'border-indigo-300 bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                        : 'border-indigo-200 bg-indigo-50 text-slate-900 ring-2 ring-indigo-100'
                      : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-indigo-200 hover:bg-white',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-lg font-black tracking-[-0.04em]">{mode.value}</span>
                    {mode.featured && <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-50">Recommended</span>}
                  </div>
                  <p className={['mt-3 text-sm leading-6', selectedDifficulty === mode.value && mode.featured ? 'text-indigo-50' : 'text-slate-600'].join(' ')}>
                    {mode.description}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Your Interview</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-900">Ready to begin?</h2>
              </div>

              <button
                type="button"
                onClick={handleStartInterview}
                disabled={!canStartInterview}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Start Interview →
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Track</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{track.name}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Experience</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{selectedExperience}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Difficulty</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{selectedDifficulty}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Questions</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{track.questionCount}</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
