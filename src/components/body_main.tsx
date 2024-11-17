'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Check, ArrowRight, Book, Clock, RefreshCw, Download, Upload } from 'lucide-react'
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
  const [elapsedTime, setElapsedTime] = useState(0)
  const [testStartTime, setTestStartTime] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchTests()
    } else if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    if (selectedTest) {
      const savedState = localStorage.getItem(`testState_${selectedTest.id}`)
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        setQuestions(parsedState.questions)
        setCurrentQuestion(parsedState.currentQuestion)
        setSelectedAnswers(parsedState.selectedAnswers)
        setIsChecking(parsedState.isChecking)
        setIsCorrect(parsedState.isCorrect)
        setMasteredQuestions(parsedState.masteredQuestions)
        setCorrectAnswersCount(parsedState.correctAnswersCount)
        setIncorrectAnswersCount(parsedState.incorrectAnswersCount)
        setElapsedTime(parsedState.elapsedTime || 0)
        setTestStartTime(Date.now())
      } else {
        const questionsWithRepetitions = selectedTest.questions.map(q => ({ ...q, repetitions: 2 }))
        setQuestions(shuffleArray(questionsWithRepetitions))
        pickRandomQuestion(questionsWithRepetitions)
        setElapsedTime(0)
        setTestStartTime(Date.now())
      }
    }
  }, [selectedTest])

  useEffect(() => {
    if (selectedTest) {
      const stateToSave = {
        questions,
        currentQuestion,
        selectedAnswers,
        isChecking,
        isCorrect,
        masteredQuestions,
        correctAnswersCount,
        incorrectAnswersCount,
        elapsedTime
      }
      localStorage.setItem(`testState_${selectedTest.id}`, JSON.stringify(stateToSave))
    }
  }, [selectedTest, questions, currentQuestion, selectedAnswers, isChecking, isCorrect, masteredQuestions, correctAnswersCount, incorrectAnswersCount, elapsedTime])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (selectedTest) {
      timer = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1)
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [selectedTest])

  const updateWeeklyTestTime = async (timeSpent: number) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/update-weekly-test-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          timeSpent,
        }),
      })
      if (!response.ok) {
        throw new Error('Nie udało się zaktualizować tygodniowego czasu testów')
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji tygodniowego czasu testów:', error)
    }
  }
  
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
          const savedTestId = localStorage.getItem('selectedTestId')
          if (savedTestId) {
            const savedTest = data.tests.find((test: Test) => test.id === savedTestId)
            if (savedTest) {
              setSelectedTest(savedTest)
            }
          }
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
    localStorage.setItem('selectedTestId', test.id)
    setSelectedAnswers([])
    setIsChecking(false)
    setIsCorrect(null)
    setMasteredQuestions(0)
    setCorrectAnswersCount(0)
    setIncorrectAnswersCount(0)
    setElapsedTime(0)
    setTestStartTime(Date.now())
  }

  const handleback = () => {
    if (testStartTime) {
      const timeSpent = Math.floor((Date.now() - testStartTime) / 1000)
      updateWeeklyTestTime(timeSpent)
    }
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

  const updateUserStats = async (score: number) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/update-user-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          score,
        }),
      })
      if (!response.ok) {
        throw new Error('Nie udało się zaktualizować statystyk użytkownika')
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji statystyk użytkownika:', error)
    }
  }

  const pickRandomQuestion = (questionPool: QuestionWithRepetition[] = questions) => {
    if (questionPool.length === 0) {
      alert("Gratulacje! Ukończyłeś test!")
      if (testStartTime) {
        const timeSpent = Math.floor((Date.now() - testStartTime) / 1000)
        updateWeeklyTestTime(timeSpent)
      }
      const score = (correctAnswersCount / (correctAnswersCount + incorrectAnswersCount)) * 100
      updateUserStats(score)
      setSelectedTest(null)
      setCurrentQuestion(null)
      localStorage.removeItem(`testState_${selectedTest?.id}`)
      localStorage.removeItem('selectedTestId')
      return
    }
    const randomIndex = Math.floor(Math.random() * questionPool.length)
    setCurrentQuestion(questionPool[randomIndex])
  }

  const resetTest = () => {
    if (selectedTest) {
      if (testStartTime) {
        const timeSpent = Math.floor((Date.now() - testStartTime) / 1000)
        updateWeeklyTestTime(timeSpent)
      }
      const questionsWithRepetitions = selectedTest.questions.map(q => ({ ...q, repetitions: 2 }))
      setQuestions(shuffleArray(questionsWithRepetitions))
      pickRandomQuestion(questionsWithRepetitions)
      setSelectedAnswers([])
      setIsChecking(false)
      setIsCorrect(null)
      setMasteredQuestions(0)
      setCorrectAnswersCount(0)
      setIncorrectAnswersCount(0)
      setElapsedTime(0)
      setTestStartTime(Date.now())
      localStorage.removeItem(`testState_${selectedTest.id}`)
    }
  }

  const goToNextQuestion = () => {
    if (isCorrect) {
      setMasteredQuestions(prev => prev + 1)
    }
    setSelectedAnswers([])
    setIsChecking(false)
    setIsCorrect(null)
    pickRandomQuestion()
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleExportTest = async () => {
    if (!selectedTest || !session?.user?.id) return

    try {
      const response = await fetch(`/api/export-test?testId=${selectedTest.id}`)
      if (!response.ok) throw new Error('Nie udało się wyeksportować testu')
      
      const testData = await response.json()
      const blob = new Blob([JSON.stringify(testData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedTest.name.replace(/\s+/g, '_')}_export.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Błąd podczas eksportu testu:', error)
      alert('Nie udało się wyeksportować testu. Spróbuj ponownie.')
    }
  }

  const handleImportTest = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !session?.user?.id) return
  
    try {
      const fileContent = await file.text()
      const importedTest = JSON.parse(fileContent)
  
      const response = await fetch('/api/import-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          test: importedTest
        }),
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Nie udało się zaimportować testu')
      }
  
      const result = await response.json()
      if (result.success) {
        alert('Test został pomyślnie zaimportowany!')
        fetchTests() // Odśwież listę testów
      } else {
        throw new Error(result.error || 'Nie udało się zaimportować testu')
      }
    } catch (error) {
      console.error('Błąd podczas importu testu:', error)
      alert(`Nie udało się zaimportować testu. ${(error as Error).message}`)
    }
  
    if (fileInputRef.current) {
      fileInputRef.current.value = '' // Zresetuj input pliku
    }
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
      <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">Wybierz test</h1>
            <button
              onClick={handleback}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full flex items-center transition-colors duration-300"
            >
              <ArrowLeft className="mr-2" size={18} />
              Powrót
            </button>
          </div>

          {tests.length === 0 ? (
            <p className="text-center text-gray-400 text-lg">Brak dostępnych testów. Dodaj nowy test, aby rozpocząć.</p>
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
                  <div className="flex items-center text-gray-400 mt-auto">
                    <Book size={16} className="mr-2" />
                    <span>{test.questions.length} pytań</span>
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
              <span className="font-bold text-xs md:text-sm">{correctAnswersCount > 0 && correctAnswersCount}</span>
            </div>
            <div 
              className="bg-red-500 flex items-center justify-center"
              style={{ width: `${(incorrectAnswersCount / (correctAnswersCount + incorrectAnswersCount || 1)) * 100}%` }}
            >
              <span className="font-bold text-xs md:text-sm">{incorrectAnswersCount > 0 && incorrectAnswersCount}</span>
            </div>
          </div>
        </div>
        <div className="w-full">
          <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Czas testu</h3>
          <div className="text-2xl md:text-3xl font-bold flex items-center justify-center bg-gray-700 rounded-lg p-2 overflow-hidden">
            <Clock className="mr-2 flex-shrink-0" size={24} />
            <div className="relative">
              {formatTime(elapsedTime).split('').map((char, index) => (
                <motion.span
                  key={`${index}-${char}`}
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (testStartTime) {
              const timeSpent = Math.floor((Date.now() - testStartTime) / 1000)
              updateWeeklyTestTime(timeSpent)
            }
            setSelectedTest(null)
            localStorage.removeItem(`testState_${selectedTest?.id}`)
            localStorage.removeItem('selectedTestId')
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 ease-in-out flex items-center justify-center"
        >
          <ArrowLeft className="mr-2" /> Powrót do wyboru testu
        </button>
        <button onClick={handleback} className="text-purple-400 hover:text-purple-300">
          Powrót do strony głównej
        </button>
        <button
          onClick={resetTest}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 ease-in-out flex items-center justify-center"
        >
          <RefreshCw className="mr-2" /> Resetuj test
        </button>
        <button
          onClick={handleExportTest}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 ease-in-out flex items-center justify-center"
        >
          <Download className="mr-2" /> Eksportuj test
        </button>
        <div>
          <input
            type="file"
            accept=".json"
            onChange={handleImportTest}
            className="hidden"
            ref={fileInputRef}
            id="import-test-input"
          />
          <label
            htmlFor="import-test-input"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 ease-in-out flex items-center justify-center cursor-pointer"
          >
            <Upload className="mr-2" /> Importuj test
          </label>
        </div>
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
                        selectedAnswers.includes(index) && !isChecking
                          ? 'bg-purple-600 text-white '
                          : !isChecking ? 'bg-gray-700 hover:bg-gray-600' : ''
                      } ${
                        isChecking && currentQuestion.correctAnswers.includes(index)
                          ? 'bg-green-500 hover:none'
                          : ''
                      }${
                        isChecking && !currentQuestion.correctAnswers.includes(index) && selectedAnswers.includes(index)
                          ? 'bg-red-500 hover:none'
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