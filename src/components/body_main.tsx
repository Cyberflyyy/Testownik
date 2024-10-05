'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Testownik() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})

  const questions = [
    { id: 1, question: "Która planeta jest największa w Układzie Słonecznym?", answers: ["Mars", "Jowisz", "Saturn", "Neptun"] },
    { id: 2, question: "Kto napisał 'Romeo i Julia'?", answers: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"] },
    { id: 3, question: "Jaki jest symbol chemiczny złota?", answers: ["Au", "Ag", "Fe", "Cu"] },
    { id: 4, question: "W którym roku rozpoczęła się II wojna światowa?", answers: ["1935", "1939", "1941", "1945"] }
  ]

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }))
  }

  const goToNextQuestion = () => {
    setCurrentQuestionIndex(prev => (prev + 1) % questions.length)
  }

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex(prev => (prev - 1 + questions.length) % questions.length)
  }

  // Przykładowe dane dla liczników
  const totalQuestions = questions.length
  const masteredQuestions = 2
  const correctAnswers = 2
  const incorrectAnswers = 1

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col lg:flex-row">
      <div className="w-full lg:w-56 xl:w-64 bg-gray-800 p-4 md:p-6 flex flex-row lg:flex-col justify-between lg:justify-start lg:space-y-6 order-first lg:order-last">
        <div>
          <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Wszystkie pytania</h3>
          <div className="text-2xl md:text-3xl font-bold">{totalQuestions}</div>
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
              style={{ width: `${(correctAnswers / (correctAnswers + incorrectAnswers)) * 100}%` }}
            >
              <span className="font-bold text-xs md:text-sm">{correctAnswers}</span>
            </div>
            <div 
              className="bg-red-500 flex items-center justify-center"
              style={{ width: `${(incorrectAnswers / (correctAnswers + incorrectAnswers)) * 100}%` }}
            >
              <span className="font-bold text-xs md:text-sm">{incorrectAnswers}</span>
            </div>
          </div>
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
                <div className="space-y-3 md:space-y-4">
                  {currentQuestion.answers.map((answer, index) => (
                    <button
                      key={index}
                      className={`w-full text-left p-3 md:p-4 rounded-lg transition-colors duration-200 ${
                        selectedAnswers[currentQuestion.id] === answer
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      onClick={() => handleAnswerSelect(answer)}
                    >
                      {answer}
                    </button>
                  ))}
                </div>
                <div className="mt-6 md:mt-8 flex justify-between items-center">
                  <button
                    onClick={goToPreviousQuestion}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 md:px-4 rounded-full transition-colors duration-300 ease-in-out flex items-center text-sm md:text-base"
                  >
                    <ChevronLeft className="mr-1 md:mr-2" /> Poprzednie
                  </button>
                  <span className="text-gray-400 text-sm md:text-base">
                    {currentQuestionIndex + 1} / {questions.length}
                  </span>
                  <button
                    onClick={goToNextQuestion}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 md:px-4 rounded-full transition-colors duration-300 ease-in-out flex items-center text-sm md:text-base"
                  >
                    Następne <ChevronRight className="ml-1 md:ml-2" />
                  </button>
                </div>
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