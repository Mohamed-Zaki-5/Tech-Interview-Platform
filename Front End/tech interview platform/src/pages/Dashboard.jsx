/**
 * Dashboard Page
 * Personal interview preparation hub for authenticated users
 */

import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const continuePreparation = {
  track: 'React',
  experience: 'Junior',
  difficulty: 'Adaptive',
  progress: 68,
}

const trackProgress = [
  { name: 'React', experience: 'Junior', progress: 68 },
  { name: 'Angular', experience: 'Junior', progress: 32 },
  { name: 'Node.js', experience: 'Junior', progress: 20 },
]

const recentInterviews = [
  {
    track: 'React Interview',
    experience: 'Junior',
    difficulty: 'Adaptive',
    score: '82%',
    date: '2 days ago',
  },
  {
    track: 'Node.js Interview',
    experience: 'Junior',
    difficulty: 'Medium',
    score: '74%',
    date: '5 days ago',
  },
]

const recommendedNext = {
  title: 'React — Mid-Level Concepts',
  summary: 'Your React fundamentals are getting stronger. Try the next level to deepen your understanding.',
}

export default function Dashboard() {
  const { currentUser } = useAuth()
  const userName = currentUser?.name || 'there'
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Dashboard</p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900 sm:text-5xl">
                {greeting}, {userName} 👋
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-slate-600">
                Keep building your interview skills and track your progress.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/questions"
                state={{
                  track: continuePreparation.track,
                  experience: continuePreparation.experience,
                  difficulty: continuePreparation.difficulty,
                  questionCount: 20,
                }}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
              >
                Continue Interview →
              </Link>
              <Link
                to="/tracks"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
              >
                Explore Tracks
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-8">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Continue preparation</p>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-slate-900">{continuePreparation.track}</h2>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-indigo-700">
                  {continuePreparation.experience}
                </span>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Difficulty</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{continuePreparation.difficulty}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Progress</p>
                    <p className="mt-1 text-xl font-bold text-indigo-600">{continuePreparation.progress}%</p>
                  </div>
                </div>

                <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500"
                    style={{ width: `${continuePreparation.progress}%` }}
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/questions"
                    state={{
                      track: continuePreparation.track,
                      experience: continuePreparation.experience,
                      difficulty: continuePreparation.difficulty,
                      questionCount: 20,
                    }}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
                  >
                    Continue Interview →
                  </Link>
                  <Link
                    to="/tracks"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600"
                  >
                    View Tracks
                  </Link>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black tracking-[-0.05em] text-slate-900">Your Progress</h2>
                <span className="text-sm font-semibold text-slate-500">UI-ready data</span>
              </div>

              <div className="space-y-5">
                {trackProgress.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-bold text-slate-900">{item.name}</p>
                        <p className="text-sm text-slate-500">{item.experience}</p>
                      </div>
                      <span className="text-sm font-bold text-indigo-600">{item.progress}%</span>
                    </div>
                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-8">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Recommended for you</p>
                <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-slate-900">{recommendedNext.title}</h2>
              </div>
              <p className="text-base leading-7 text-slate-600">{recommendedNext.summary}</p>
              <div className="mt-6">
                <Link
                  to="/tracks"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
                >
                  Start Interview →
                </Link>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.04)] sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black tracking-[-0.05em] text-slate-900">Recent Interviews</h2>
                <Link to="/tracks" className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700">
                  Explore tracks
                </Link>
              </div>

              {recentInterviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-lg font-bold text-slate-900">No interviews yet.</p>
                  <p className="mt-2 text-sm text-slate-600">Start your first interview to begin tracking your progress.</p>
                  <Link
                    to="/tracks"
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
                  >
                    Explore Tracks →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentInterviews.map((item) => (
                    <div key={`${item.track}-${item.date}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-bold text-slate-900">{item.track}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.experience} • {item.difficulty}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                          {item.score}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-500">{item.date}</span>
                        <button type="button" className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600">
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
