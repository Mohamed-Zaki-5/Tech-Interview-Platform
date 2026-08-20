import { Link, useParams } from 'react-router-dom'
import { getTrackName } from '../data/mockQuestions'
import { createMockEvaluation } from '../services/mockEvaluationService'
import { getCompletedInterviewSession, getInitialPracticeSession } from '../services/practiceStorage'

export default function Evaluation() {
  const { trackId } = useParams()
  const session = getCompletedInterviewSession() || getInitialPracticeSession()
  const trackName = getTrackName(trackId)

  if (!session || session.trackId !== trackId) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <section className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Evaluation unavailable</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">No completed session found</h1>
            <p className="mt-4 text-lg text-slate-600">Complete the initial practice session before viewing its evaluation.</p>
            <Link to="/tracks" className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-600">
              Back to Tracks
            </Link>
          </section>
        </main>
      </div>
    )
  }

  const evaluation = createMockEvaluation({ questions: session.questions, answers: session.answers })

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Evaluation</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-slate-900">{trackName}</h1>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Mock evaluation</p>
            <p className="mt-2 text-sm text-indigo-900">This evaluation is generated locally for now and does not come from a backend service.</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-600">Score</p>
              <p className="mt-2 text-3xl font-black text-indigo-600">{evaluation.score}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-600">Percentage</p>
              <p className="mt-2 text-3xl font-black text-indigo-600">{evaluation.percentage}%</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">
            <p className="text-sm font-semibold text-slate-600">Summary</p>
            <p className="mt-2 text-lg text-slate-900">{evaluation.summary}</p>
            <p className="mt-4 text-sm text-slate-600">{evaluation.note}</p>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link to={`/tracks/${trackId}`} className="inline-flex justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-600">
              Try Again
            </Link>
            <Link to="/tracks" className="inline-flex justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600">
              Choose Another Track
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-600">Total questions</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{evaluation.totalQuestions}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-semibold text-emerald-700">Correct answers</p>
              <p className="mt-2 text-3xl font-black text-emerald-700">{evaluation.correctAnswers}</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
              <p className="text-sm font-semibold text-rose-700">Wrong answers</p>
              <p className="mt-2 text-3xl font-black text-rose-700">{evaluation.wrongAnswers}</p>
            </div>
          </div>

          <details className="mt-8 rounded-2xl border border-slate-200 p-5">
            <summary className="cursor-pointer text-lg font-bold text-slate-900">Review Answers</summary>
            <div className="mt-5 space-y-4">
              {evaluation.review.map((item, index) => (
                <div key={`${index}-${item.question}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-500">Question {index + 1}</p>
                  <p className="mt-2 font-semibold text-slate-900">{item.question}</p>
                  <p className="mt-3 text-sm text-slate-700"><span className="font-semibold">Your answer:</span> {item.userAnswer}</p>
                  <p className="mt-1 text-sm text-slate-700"><span className="font-semibold">Correct answer:</span> {item.correctAnswer}</p>
                  <p className={`mt-2 text-sm font-bold ${item.status === 'Correct' ? 'text-emerald-700' : item.status === 'Incorrect' ? 'text-rose-700' : 'text-amber-700'}`}>{item.status}</p>
                </div>
              ))}
            </div>
          </details>
        </section>
      </main>
    </div>
  )
}