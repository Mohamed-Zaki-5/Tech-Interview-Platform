/**
 * Assessment Page
 * Protected route - only accessible to authenticated users
 */

import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Assessment() {
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const assessments = [
    {
      title: 'Technical Interview',
      difficulty: 'Advanced',
      description: 'Comprehensive technical interview assessment',
      duration: '60 minutes',
      icon: '💻',
    },
    {
      title: 'Coding Challenge',
      difficulty: 'Intermediate',
      description: 'Solve coding problems under time pressure',
      duration: '45 minutes',
      icon: '🔧',
    },
    {
      title: 'System Design',
      difficulty: 'Advanced',
      description: 'Design scalable systems and architectures',
      duration: '90 minutes',
      icon: '🏗️',
    },
    {
      title: 'Behavioral',
      difficulty: 'Beginner',
      description: 'Practice behavioral interview questions',
      duration: '30 minutes',
      icon: '💬',
    },
  ]

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700'
      case 'Advanced':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Assessments</h1>
          <p className="text-lg text-gray-600 mt-2">Take assessments to evaluate your skills and track progress</p>
        </div>

        {/* Assessment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {assessments.map((assessment) => (
            <div
              key={assessment.title}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors">
                <div className="text-4xl mb-3">{assessment.icon}</div>
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold text-gray-900">{assessment.title}</h3>
                </div>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(assessment.difficulty)}`}>
                  {assessment.difficulty}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">{assessment.description}</p>
                <p className="text-sm text-gray-500 mb-6">
                  <span className="font-semibold">Duration:</span> {assessment.duration}
                </p>

                <button
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 text-gray-600 font-semibold rounded-lg cursor-not-allowed opacity-50 transition-all"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About Assessments</h2>
          <p className="text-gray-600 mb-4">
            Our comprehensive assessment suite is designed to help you prepare thoroughly for technical interviews. Each assessment simulates real interview conditions and provides detailed feedback on your performance.
          </p>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold mt-1">✓</span>
              <span>Track your progress with detailed performance analytics</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold mt-1">✓</span>
              <span>Get immediate feedback and suggestions for improvement</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold mt-1">✓</span>
              <span>Compare your results with other users and industry benchmarks</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
