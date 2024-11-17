'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react'
import { Session } from "next-auth"

interface ExtendedSession extends Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

interface Question {
  id: string
  question: string
  answers: string[]
  correctAnswers: number[]
}

interface Test {
  id: string
  name: string
  questions: Question[]
}

export default function EditTest() {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession() as { data: ExtendedSession | null, status: "loading" | "authenticated" | "unauthenticated" }
  const [tests, setTests] = useState<Test[]>([])
  const [selectedTest, setSelectedTest] = useState<Test | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user?.id) {
      fetchTests()
    } else if (sessionStatus === 'unauthenticated') {
      router.push('/')
    }
  }, [sessionStatus, session, router])

  const fetchTests = async () => {
    if (!session?.user?.id) return
    
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/get-tests?userId=${session.user.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.tests) {
          setTests(data.tests)
        } else {
          setError('Nieprawidłowa struktura danych z API')
        }
      } else {
        const errorText = await response.text()
        setError(`Nie udało się pobrać testów. Status: ${response.status}. Treść: ${errorText}`)
      }
    } catch (error) {
      setError(`Wystąpił błąd podczas pobierania testów: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestSelect = (test: Test) => {
    setSelectedTest(test)
  }

  const handleTestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedTest) {
      setSelectedTest({ ...selectedTest, name: e.target.value })
    }
  }

  const handleQuestionChange = (questionId: string, newQuestion: string) => {
    if (selectedTest) {
      const updatedQuestions = selectedTest.questions.map(q =>
        q.id === questionId ? { ...q, question: newQuestion } : q
      )
      setSelectedTest({ ...selectedTest, questions: updatedQuestions })
    }
  }

  const handleAnswerChange = (questionId: string, answerIndex: number, newAnswer: string) => {
    if (selectedTest) {
      const updatedQuestions = selectedTest.questions.map(q =>
        q.id === questionId
          ? { ...q, answers: q.answers.map((a, i) => (i === answerIndex ? newAnswer : a)) }
          : q
      )
      setSelectedTest({ ...selectedTest, questions: updatedQuestions })
    }
  }

  const handleCorrectAnswerToggle = (questionId: string, answerIndex: number) => {
    if (selectedTest) {
      const updatedQuestions = selectedTest.questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              correctAnswers: q.correctAnswers.includes(answerIndex)
                ? q.correctAnswers.filter(i => i !== answerIndex)
                : [...q.correctAnswers, answerIndex]
            }
          : q
      )
      setSelectedTest({ ...selectedTest, questions: updatedQuestions })
    }
  }

  const handleAddQuestion = () => {
    if (selectedTest) {
      const newQuestion: Question = {
        id: Date.now().toString(),
        question: '',
        answers: ['', '', '', ''],
        correctAnswers: []
      }
      setSelectedTest({
        ...selectedTest,
        questions: [...selectedTest.questions, newQuestion]
      })
    }
  }

  const handleRemoveQuestion = (questionId: string) => {
    if (selectedTest) {
      const updatedQuestions = selectedTest.questions.filter(q => q.id !== questionId)
      setSelectedTest({ ...selectedTest, questions: updatedQuestions })
    }
  }

  const handleSaveTest = async () => {
    if (!selectedTest || !session?.user?.id) {
      setError("Brak wybranego testu lub sesji użytkownika")
      return
    }
  
    try {
      setIsLoading(true)
      setError(null)
  
      const response = await fetch('/api/update-test', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          test: selectedTest
        }),
      })
  
      const result = await response.json()
  
      if (!response.ok) {
        throw new Error(result.message || 'Nie udało się zaktualizować testu')
      }
  
      if (result.success) {
        // Opcjonalnie: zaktualizuj lokalny stan lub cache
        // setTests(prevTests => prevTests.map(t => t.id === result.test.id ? result.test : t))
        
        router.push('/home')
      } else {
        throw new Error(result.message || 'Nie udało się zaktualizować testu')
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji testu:', error)
      setError(`Wystąpił błąd podczas aktualizacji testu: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (sessionStatus === 'loading' || isLoading) {
    return <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">Ładowanie...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchTests} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full">
          Spróbuj ponownie
        </button>
      </div>
    )
  }

  if (!selectedTest) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Wybierz test do edycji</h1>
            <button
              onClick={() => router.push('/home')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full flex items-center transition-colors duration-300"
            >
              <ArrowLeft className="mr-2" size={18} />
              Powrót
            </button>
          </div>

          {tests.length === 0 ? (
            <p className="text-center text-gray-400 text-lg">Brak dostępnych testów do edycji.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tests.map((test) => (
                <motion.button
                  key={test.id}
                  onClick={() => handleTestSelect(test)}
                  className="bg-gray-800 hover:bg-gray-700 text-left p-4 rounded-lg shadow-lg transition-colors duration-300 ease-in-out flex flex-col"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h2 className="text-lg font-semibold mb-2 text-purple-300">{test.name}</h2>
                  <div className="text-gray-400 mt-auto">
                    {test.questions.length} pytań
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Edycja testu</h1>
          <button
            onClick={() => setSelectedTest(null)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full flex items-center transition-colors duration-300"
          >
            <ArrowLeft className="mr-2" size={18} />
            Powrót do wyboru testu
          </button>
        </div>

        <div className="mb-6">
          <label htmlFor="testName" className="block text-sm font-medium text-gray-400 mb-2">
            Nazwa testu
          </label>
          <input
            type="text"
            id="testName"
            value={selectedTest.name}
            onChange={handleTestNameChange}
            className="w-full bg-gray-800 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <AnimatePresence>
          {selectedTest.questions.map((question, qIndex) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-gray-800 p-4 rounded-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pytanie {qIndex + 1}</h3>
                <button
                  onClick={() => handleRemoveQuestion(question.id)}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <input
                type="text"
                value={question.question}
                onChange={(e) => handleQuestionChange(question.id, e.target.value)}
                className="w-full bg-gray-700 text-white rounded-md py-2 px-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Wpisz pytanie"
              />
              {question.answers.map((answer, aIndex) => (
                <div key={aIndex} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={question.correctAnswers.includes(aIndex)}
                    onChange={() => handleCorrectAnswerToggle(question.id, aIndex)}
                    className="mr-2"
                  />
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => handleAnswerChange(question.id, aIndex, e.target.value)}
                    className="flex-grow bg-gray-700 text-white rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder={`Odpowiedź ${aIndex + 1}`}
                  />
                </div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleAddQuestion}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full flex items-center transition-colors duration-300"
          >
            <Plus className="mr-2" size={18} />
            Dodaj pytanie
          </button>
          <button
            onClick={handleSaveTest}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full flex items-center transition-colors duration-300"
          >
            <Save className="mr-2" size={18} />
            Zakończ edycję
          </button>
        </div>
      </div>
    </div>
  )
}