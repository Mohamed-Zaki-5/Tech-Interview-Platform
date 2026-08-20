import { useState } from 'react'
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { getAdditionalMockQuestions, getMockQuestions, getTrackName } from '../data/mockQuestions'
import { useAuth } from '../hooks/useAuth'
import { getInitialPracticeSession, hasCompletedGuestPractice, saveCompletedInterviewSession, saveInitialPracticeSession } from '../services/practiceStorage'

function PracticeSession({ trackId, isAuthenticated, isAdditionalSession, setup }) {
  const trackName = getTrackName(trackId)
  const questions = isAdditionalSession ? getAdditionalMockQuestions(trackId) : getMockQuestions(trackId)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState(() => Array(questions.length).fill(''))
  const [isComplete, setIsComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [guestSessionCompleted, setGuestSessionCompleted] = useState(() => hasCompletedGuestPractice())

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestionIndex]
  const guestIsBlocked = !isAuthenticated && (guestSessionCompleted || isAdditionalSession)

  const updateAnswer = (answer) => {
    setAnswers((previousAnswers) => {
      const nextAnswers = [...previousAnswers]
      nextAnswers[currentQuestionIndex] = answer
      return nextAnswers
    })
  }

  const goToNextQuestion = () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    if (currentQuestionIndex === questions.length - 1) {
      const completedSession = { trackId, questions, answers, ...setup }
      saveCompletedInterviewSession(completedSession)

      if (!isAuthenticated && !isAdditionalSession) {
        saveInitialPracticeSession(completedSession)
        setGuestSessionCompleted(true)
      }
      setIsComplete(true)
      return
    }

    setCurrentQuestionIndex((index) => index + 1)
    setIsSubmitting(false)
  }

  const renderAnswerControl = () => {
    const questionType = currentQuestion.type?.toUpperCase().replace(/[^A-Z]/g, '_')

    if (questionType === 'MCQ' || questionType === 'TRUE_FALSE') {
      if (!Array.isArray(currentQuestion.options) || currentQuestion.options.length === 0) {
        return <p className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">This question is unavailable. Please try again later.</p>
      }

      return (
        <div className="mt-6 space-y-3">
          {currentQuestion.options.map((option) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
                currentAnswer === option
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200'
              }`}
            >
              <input
                type="radio"
                name={currentQuestion.id}
                value={option}
                checked={currentAnswer === option}
                onChange={(event) => updateAnswer(event.target.value)}
                className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">{option}</span>
            </label>
          ))}
        </div>
      )
    }

    return (
      <textarea
        value={currentAnswer}
        onChange={(event) => updateAnswer(event.target.value)}
        rows={questionType === 'LONG_ANSWER' ? 8 : 4}
        placeholder={questionType === 'LONG_ANSWER' ? 'Write your detailed answer...' : 'Write your answer...'}
        aria-label={questionType === 'LONG_ANSWER' ? 'Long answer' : 'Short answer'}
        className="mt-6 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    )
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10">
          <section className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Interview unavailable</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900">No questions are available</h1>
            <p className="mt-4 text-slate-600">Please choose another track and try again.</p>
            <Link to="/tracks" className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white">Back to Tracks</Link>
          </section>
        </main>
      </div>
    )
  }

  if (!currentQuestion || !currentQuestion.type || !currentQuestion.prompt) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10">
          <section className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-600">Question unavailable</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900">We could not load this question</h1>
            <p className="mt-4 text-slate-600">Return to the track list and start the interview again.</p>
            <Link to="/tracks" className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white">Back to Tracks</Link>
          </section>
        </main>
      </div>
    )
  }

  if (isComplete || guestIsBlocked) {
    const isGuestCompletion = !isAuthenticated
    const authRedirect = isAdditionalSession && !guestSessionCompleted ? '/tracks' : `/evaluation/${trackId}`

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <section className="w-full rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Practice complete</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">{trackName}</h1>
            <p className="mt-4 text-lg text-slate-600">
              {isGuestCompletion
                ? isAdditionalSession && !guestSessionCompleted
                  ? 'Create an account or sign in to continue practicing after the initial session.'
                  : 'Your free practice session is complete. Create an account or sign in to view your evaluation and continue practicing.'
                : 'This practice session is complete.'}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              {isGuestCompletion ? (
                <>
                  <Link to={`/register?redirect=${authRedirect}`} className="inline-flex justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-600">
                    Create Account
                  </Link>
                  <Link to={`/login?redirect=${authRedirect}`} className="inline-flex justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to={`/evaluation/${trackId}`} className="inline-flex justify-center rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-600">
                  View Evaluation
                </Link>
              )}
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Practice</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] text-slate-900">{trackName}</h1>
          </div>
          <Link to="/tracks" className="text-sm font-semibold text-slate-600 transition hover:text-indigo-600">Back to Tracks</Link>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-600">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>{currentQuestion.difficulty}</span>
          </div>

          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-indigo-600 transition-all"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{currentQuestion.type}</p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-slate-900">{currentQuestion.prompt}</h2>
            {renderAnswerControl()}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={goToNextQuestion}
              disabled={isSubmitting}
              className="rounded-full bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting answer...' : currentQuestionIndex === questions.length - 1 ? 'Finish Practice' : 'Next Question'}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function Practice() {
  const { trackId } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const isAdditionalSession = searchParams.get('session') === 'additional'
  const setup = location.state || {
    experience: searchParams.get('experience') || 'Junior',
    difficulty: searchParams.get('difficulty') || 'Adaptive',
  }
  const initialPracticeSession = getInitialPracticeSession()

  if (isAuthenticated && hasCompletedGuestPractice() && !isAdditionalSession) {
    if (initialPracticeSession?.trackId === trackId) {
      return <Navigate to={`/evaluation/${trackId}`} replace />
    }

    return <Navigate to={`/practice/${trackId}?session=additional`} replace />
  }

  return (
    <PracticeSession
      key={`${trackId}-${isAdditionalSession}`}
      trackId={trackId}
      isAuthenticated={isAuthenticated}
      isAdditionalSession={isAdditionalSession}
      setup={setup}
    />
  )
}
