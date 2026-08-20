const trackDetails = {
  react: {
    name: 'React',
    topics: ['components', 'hooks', 'state management', 'rendering'],
  },
  angular: {
    name: 'Angular',
    topics: ['components', 'dependency injection', 'RxJS', 'templates'],
  },
  vue: {
    name: 'Vue.js',
    topics: ['components', 'reactivity', 'composition API', 'directives'],
  },
  dotnet: {
    name: '.NET',
    topics: ['classes', 'dependency injection', 'LINQ', 'ASP.NET Core'],
  },
  node: {
    name: 'Node.js',
    topics: ['the event loop', 'modules', 'streams', 'HTTP servers'],
  },
  mobile: {
    name: 'Mobile Development',
    topics: ['screen navigation', 'app lifecycle', 'state persistence', 'mobile performance'],
  },
}

const questionTemplates = [
  ({ name, topics }) => ({
    type: 'MCQ',
    difficulty: 'Easy',
    prompt: `Which concept is most directly associated with ${name} ${topics[0]}?`,
    options: [`Reusable ${topics[0]}`, 'Database indexing', 'Network encryption', 'Operating system scheduling'],
  }),
  ({ name, topics }) => ({
    type: 'True / False',
    difficulty: 'Medium',
    prompt: `${name} applications can use ${topics[1]} to separate shared application behavior from individual views.`,
    options: ['True', 'False'],
  }),
  ({ name, topics }) => ({
    type: 'Short Answer',
    difficulty: 'Easy',
    prompt: `In one or two sentences, what problem does ${name} ${topics[2]} help solve?`,
  }),
  ({ name, topics }) => ({
    type: 'Long Answer',
    difficulty: 'Medium',
    prompt: `Describe how you would design a maintainable ${name} feature that uses ${topics[3]}.`,
  }),
  ({ name, topics }) => ({
    type: 'MCQ',
    difficulty: 'Medium',
    prompt: `Which approach is usually best when structuring ${name} ${topics[0]} for reuse?`,
    options: ['Keep responsibilities focused', 'Put all logic in one file', 'Duplicate every view', 'Avoid composition entirely'],
  }),
  ({ name, topics }) => ({
    type: 'True / False',
    difficulty: 'Easy',
    prompt: `Testing ${name} ${topics[0]} helps verify behavior without requiring every part of the application to be changed.`,
    options: ['True', 'False'],
  }),
  ({ name, topics }) => ({
    type: 'Short Answer',
    difficulty: 'Medium',
    prompt: `What is one tradeoff to consider when using ${name} ${topics[1]}?`,
  }),
  ({ name, topics }) => ({
    type: 'Long Answer',
    difficulty: 'Easy',
    prompt: `Outline the steps you would take to debug a small ${name} issue involving ${topics[2]}.`,
  }),
  ({ name, topics }) => ({
    type: 'MCQ',
    difficulty: 'Easy',
    prompt: `Which outcome is a likely benefit of organizing ${name} code around ${topics[0]}?`,
    options: ['Easier maintenance', 'Guaranteed zero bugs', 'No need for testing', 'Automatic database backups'],
  }),
  ({ name, topics }) => ({
    type: 'Short Answer',
    difficulty: 'Medium',
    prompt: `Give one practical example of improving a ${name} application using ${topics[3]}.`,
  }),
]

const additionalQuestionTemplates = [
  ({ name, topics }) => ({
    type: 'MCQ',
    difficulty: 'Medium',
    prompt: `Which practice improves the maintainability of ${name} ${topics[0]}?`,
    options: ['Small focused units', 'One global function', 'Repeated copy and paste', 'Hidden mutable state'],
  }),
  ({ name, topics }) => ({
    type: 'True / False',
    difficulty: 'Easy',
    prompt: `Clear boundaries make it easier to change ${name} ${topics[1]} without rewriting every feature.`,
    options: ['True', 'False'],
  }),
  ({ name, topics }) => ({
    type: 'Short Answer',
    difficulty: 'Medium',
    prompt: `How would you test a ${name} feature that depends on ${topics[2]}?`,
  }),
  ({ name, topics }) => ({
    type: 'Long Answer',
    difficulty: 'Easy',
    prompt: `Explain how you would document a ${name} implementation that uses ${topics[3]}.`,
  }),
  ({ name, topics }) => ({
    type: 'MCQ',
    difficulty: 'Easy',
    prompt: `What is a useful first step when reviewing ${name} ${topics[0]}?`,
    options: ['Understand the component boundary', 'Skip the requirements', 'Remove all tests', 'Change unrelated files'],
  }),
  ({ name, topics }) => ({
    type: 'True / False',
    difficulty: 'Medium',
    prompt: `A ${name} design should consider how ${topics[2]} behaves when data changes over time.`,
    options: ['True', 'False'],
  }),
  ({ name, topics }) => ({
    type: 'Short Answer',
    difficulty: 'Easy',
    prompt: `Name one signal that a ${name} feature using ${topics[3]} needs refactoring.`,
  }),
  ({ name, topics }) => ({
    type: 'Long Answer',
    difficulty: 'Medium',
    prompt: `Compare two reasonable approaches for handling ${topics[1]} in a ${name} application.`,
  }),
  ({ name, topics }) => ({
    type: 'MCQ',
    difficulty: 'Medium',
    prompt: `Which concern should be reviewed before shipping ${name} ${topics[3]}?`,
    options: ['User-facing failure handling', 'Ignoring edge cases', 'Removing observability', 'Duplicating configuration'],
  }),
  ({ name, topics }) => ({
    type: 'Short Answer',
    difficulty: 'Easy',
    prompt: `What is one way to keep ${name} ${topics[2]} understandable to another engineer?`,
  }),
]

function getTrackDetails(trackId) {
  return trackDetails[trackId] || {
    name: trackId,
    topics: ['architecture', 'shared services', 'application state', 'performance'],
  }
}

export function getMockQuestions(trackId) {
  const details = getTrackDetails(trackId)

  return questionTemplates.map((createQuestion, index) => ({
    id: `${trackId}-${index + 1}`,
    ...addMockAnswerKey(createQuestion(details)),
  }))
}

export function getAdditionalMockQuestions(trackId) {
  const details = getTrackDetails(trackId)

  return additionalQuestionTemplates.map((createQuestion, index) => ({
    id: `${trackId}-additional-${index + 1}`,
    ...addMockAnswerKey(createQuestion(details)),
  }))
}

function addMockAnswerKey(question) {
  return {
    ...question,
    correctAnswer: question.options?.[0] || null,
  }
}

export function getTrackName(trackId) {
  return trackDetails[trackId]?.name || trackId
}