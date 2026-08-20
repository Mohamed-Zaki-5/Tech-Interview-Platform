import { Link, useNavigate } from 'react-router-dom'
import TrackCard from './TrackCard'

const tracks = [
  {
    name: 'React',
    route: '/tracks/react',
    category: 'Frontend Framework',
    description: 'Master React fundamentals, hooks, state management, and component patterns.',
    questions: 45,
    icon: '⚛️',
  },
  {
    name: 'Angular',
    route: '/tracks/angular',
    category: 'Frontend Framework',
    description: 'Learn Angular architecture, dependency injection, and RxJS concepts.',
    questions: 38,
    icon: '🅰️',
  },
  {
    name: 'Vue.js',
    route: '/tracks/vue',
    category: 'Frontend Framework',
    description: 'Explore Vue reactivity, composition API, and component lifecycle.',
    questions: 32,
    icon: '💚',
  },
  {
    name: '.NET',
    route: '/tracks/dotnet',
    category: 'Backend',
    description: 'Understand C#, ASP.NET Core, and enterprise application patterns.',
    questions: 52,
    icon: '🔷',
  },
  {
    name: 'Node.js',
    route: '/tracks/node',
    category: 'Backend',
    description: 'Learn async programming, Express, databases, and API design.',
    questions: 48,
    icon: '🟩',
  },
  {
    name: 'Mobile Development',
    route: '/tracks/mobile',
    category: 'Mobile',
    description: 'Practice iOS, Android, React Native, and cross-platform development.',
    questions: 55,
    icon: '📱',
  },
]

export default function TracksSection() {
  const navigate = useNavigate()

  return (
    <section id="tracks" className="bg-slate-950 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-200">Tracks</div>
          <h2 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">Choose your track</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">Practice the technologies you care about most and build interview confidence with structured guidance.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tracks.map((track) => (
            <Link key={track.name} to={track.route} className="block h-full cursor-pointer">
              <TrackCard {...track} />
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-5 text-slate-300">Explore free practice questions before creating an account.</p>
          <button
            type="button"
            onClick={() => navigate('/tracks')}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5"
          >
            Start Exploring
          </button>
        </div>
      </div>
    </section>
  )
}
