export const GUEST_PRACTICE_COMPLETED_KEY = 'guestPracticeCompleted'

const INITIAL_PRACTICE_SESSION_KEY = 'initialPracticeSession'
const COMPLETED_INTERVIEW_SESSION_KEY = 'completedInterviewSession'

export function hasCompletedGuestPractice() {
  return window.localStorage.getItem(GUEST_PRACTICE_COMPLETED_KEY) === 'true'
}

export function saveInitialPracticeSession(session) {
  window.localStorage.setItem(INITIAL_PRACTICE_SESSION_KEY, JSON.stringify(session))
  window.localStorage.setItem(GUEST_PRACTICE_COMPLETED_KEY, 'true')
}

export function saveCompletedInterviewSession(session) {
  window.localStorage.setItem(COMPLETED_INTERVIEW_SESSION_KEY, JSON.stringify(session))
}

export function getCompletedInterviewSession() {
  const storedSession = window.localStorage.getItem(COMPLETED_INTERVIEW_SESSION_KEY)

  if (!storedSession) return null

  try {
    return JSON.parse(storedSession)
  } catch {
    return null
  }
}

export function getInitialPracticeSession() {
  const storedSession = window.localStorage.getItem(INITIAL_PRACTICE_SESSION_KEY)

  if (!storedSession) return null

  try {
    return JSON.parse(storedSession)
  } catch {
    return null
  }
}