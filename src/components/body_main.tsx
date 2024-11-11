'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, ArrowRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'

interface ExtendedSession extends Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

interface Test {
  id: string;
  name: string;
  questions: Question[];
}

interface Question {
  id: string;
  question: string;
  answers: string[];
  correctAnswers: number[];
}

interface QuestionWithRepetition extends Question {
  repetitions: number;
}

export default function Body_main() {
  const router = useRouter()
  const { data: session, status } = useSession() as { data: ExtendedSession | null, status: "loading" | "authenticated" | "unauthenticated" }
  const [tests, setTests] = useState<Test[]>([])
  const [selectedTest, setSelectedTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<QuestionWithRepetition[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<QuestionWithRepetition | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [isChecking, setIsChecking] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [masteredQuestions, setMasteredQuestions] = useState(0)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchTests()
    } else if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    if (selectedTest) {
      const questionsWithRepetitions = selectedTest.questions.map(q => ({ ...q, repetitions: 2 }))
      setQuestions(shuffleArray(questionsWithRepetitions))
      pickRandomQuestion(questionsWithRepetitions)
    }
  }, [selectedTest])

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
    setSelectedAnswers([])
    setIsChecking(false)
    setIsCorrect(null)
    setMasteredQuestions(0)
    setCorrectAnswersCount(0)
    setIncorrectAnswersCount(0)
  }

  const handleback = () => {
    router.push('/home')
  }

  const handleAnswerSelect = (index: number) => {
    if (isChecking) return
    setSelectedAnswers(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const handleCheckAnswer = () => {
    if (!currentQuestion) return

    const isAnswerCorrect = arraysEqual(selectedAnswers.sort(), currentQuestion.correctAnswers.sort())
    setIsChecking(true)
    setIsCorrect(isAnswerCorrect)

    if (isAnswerCorrect) {
      setCorrectAnswersCount(prev => prev + 1)
      updateQuestionRepetition(-1)
    } else {
      setIncorrectAnswersCount(prev => prev + 1)
      updateQuestionRepetition(1)
    }
  }

  const updateQuestionRepetition = (change: number) => {
    setQuestions(prev => {
      const updatedQuestions = prev.map(q => 
        q.id === currentQuestion?.id
          ? { ...q, repetitions: Math.max(0, q.repetitions + change) }
          : q
      )
      return updatedQuestions.filter(q => q.repetitions > 0)
    })
  }

  const pickRandomQuestion = (questionPool: QuestionWithRepetition[] = questions) => {
    if (questionPool.length === 0) {
      alert("Gratulacje! Ukończyłeś test!")
      setSelectedTest(null)
      setCurrentQuestion(null)
      return
    }
    const randomIndex = Math.floor(Math.random() * questionPool.length)
    setCurrentQuestion(questionPool[randomIndex])
  }

  const goToNextQuestion = () => {
   if (isCorrect){
    null
   }
    setSelectedAnswers([])
    setIsChecking(false)
    setIsCorrect(null)
    pickRandomQuestion()
  }

  if (status === 'loading' || isLoading) {
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

  if (!selectedTest || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Wybierz test</h2>
        {tests.length > 0 ? (
          <div className="space-y-4">
            {tests.map((test) => (
              <button
                key={test.id}
                onClick={() => handleTestSelect(test)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 ease-in-out"
              >
                {test.name}
              </button>
            ))}
          </div>
        ) : (
          <p>Brak dostępnych testów. Dodaj nowy test, aby rozpocząć.</p>
        )}
        <button onClick={handleback} className="mt-4 text-purple-400 hover:text-purple-300">
          Powrót do strony głównej
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col lg:flex-row">
      <div className="w-full lg:w-56 xl:w-64 bg-gray-800 p-4 md:p-6 flex flex-row lg:flex-col justify-between lg:justify-start lg:space-y-6 order-first lg:order-last">
        <div>
          <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Wszystkie pytania</h3>
          <div className="text-2xl md:text-3xl font-bold">{questions.length}</div>
        </div>
        <div>
          <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Opanowane</h3>
          <div className="text-2xl md:text-3xl font-bold">{masteredQuestions}</div>
        </div>
        <div className="w-1/3 lg:w-full">
          <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Odpowiedzi</h3>
          <div className="h-6 md:h-8 bg-gray-700 rounded-full overflow-hidden flex">
            <div 
              className="bg-green-500 flex items-center justify-center"
              style={{ width: `${(correctAnswersCount / (correctAnswersCount + incorrectAnswersCount || 1)) * 100}%` }}
            >
              <span className="font-bold text-xs md:text-sm">{correctAnswersCount}</span>
            </div>
            <div 
              className="bg-red-500 flex items-center justify-center"
              style={{ width: `${(incorrectAnswersCount / (correctAnswersCount + incorrectAnswersCount || 1)) * 100}%` }}
            >
              <span className="font-bold text-xs md:text-sm">{incorrectAnswersCount}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedTest(null)
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 ease-in-out flex items-center justify-center"
        >
          <ArrowLeft className="mr-2" /> Powrót do wyboru testu
        </button>
        <button onClick={handleback} className="text-purple-400 hover:text-purple-300">
          Powrót do strony głównej
        </button>
      </div>

      <div className="flex-grow flex flex-col">
        <main className="container mx-auto p-4 sm:p-6 md:p-8 flex-grow flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="md:bg-gray-800 md:rounded-xl md:shadow-lg md:p-8 md:hover:shadow-xl md:transition-shadow md:duration-300"
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 md:mb-6">{currentQuestion.question}</h2>
                <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-3 md:space-y-4">
                  {currentQuestion.answers.map((answer, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`w-full text-left p-3 md:p-4 rounded-lg transition-colors duration-200 ${
                        selectedAnswers.includes(index)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      } ${
                        isChecking && currentQuestion.correctAnswers.includes(index)
                          ? 'bg-green-500'
                          : ''
                      }`}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={isChecking}
                    >
                      {answer}
                    </button>
                  ))}
                  <div className="mt-6 md:mt-8 flex flex-col items-center space-y-4">
                    {!isChecking ? (
                      <button
                        onClick={handleCheckAnswer}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 ease-in-out flex items-center"
                      >
                        Sprawdź <Check className="ml-2" />
                      </button>
                    ) : (
                      <button
                        onClick={goToNextQuestion}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 ease-in-out flex items-center"
                      >
                        Następne pytanie <ArrowRight className="ml-2" />
                      </button>
                    )}
                    <div className="text-sm text-gray-400">
                      Ponowne powtórzenia: {currentQuestion.repetitions}
                    </div>
                  </div>
                </form>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <footer className="bg-gray-800 p-4">
          <div className="container mx-auto text-center text-gray-400 text-sm">
            <p>&copy; 2024 Testownik. Wszelkie prawa zastrzeżone.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}