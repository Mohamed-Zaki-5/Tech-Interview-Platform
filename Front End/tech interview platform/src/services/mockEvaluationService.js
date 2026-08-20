export function createMockEvaluation({ questions = [], answers = [] }) {
  const answeredCount = answers.filter((answer) => answer.trim()).length
  const percentage = questions.length === 0 ? 0 : Math.round((answeredCount / questions.length) * 100)
  const review = questions.map((question, index) => {
    const userAnswer = answers[index] || ''
    const hasAnswer = userAnswer.trim().length > 0
    const isAutoGradable = Boolean(question.correctAnswer)

    return {
      question: question.prompt,
      userAnswer: userAnswer || 'No answer submitted',
      correctAnswer: question.correctAnswer || 'Not auto-graded',
      status: !hasAnswer ? 'Unanswered' : !isAutoGradable ? 'Needs review' : userAnswer === question.correctAnswer ? 'Correct' : 'Incorrect',
    }
  })
  const correctAnswers = review.filter((item) => item.status === 'Correct').length
  const wrongAnswers = review.filter((item) => item.status === 'Incorrect').length

  return {
    isMock: true,
    score: `${answeredCount}/${questions.length}`,
    percentage,
    totalQuestions: questions.length,
    correctAnswers,
    wrongAnswers,
    review,
    summary: answeredCount === questions.length
      ? 'Every question has a response recorded.'
      : `${answeredCount} of ${questions.length} questions have a response recorded.`,
    note: 'This is a mock evaluation based on response completion. Long answers are not AI-evaluated in this phase.',
  }
}