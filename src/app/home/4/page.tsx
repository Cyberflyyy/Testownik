'use client'
import Header_main from '@/components/header_main'
import React, { useState } from 'react'
import { PlusCircle, Trash2, ArrowLeft, Plus, Minus } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Session } from 'next-auth'

interface ExtendedSession extends Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

const CreateTestPage = () => {
  const [testName, setTestName] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const { data: session } = useSession() as { data: ExtendedSession | null }
  const [isDisabled, setIsDisabled] = useState(false);
  const router = useRouter()
  
  const addQuestion = () => {
    setQuestions([...questions, { question: '', answers: ['', '', '', ''], correctAnswers: [] }])
  }

  const updateQuestion = (index: number, field: keyof Question, value: string | number[]) => {
    const updatedQuestions = [...questions]
    if (field === 'correctAnswers') {
      updatedQuestions[index][field] = value as number[]
    } else if (field === 'question') {
      updatedQuestions[index][field] = value as string
    }
    setQuestions(updatedQuestions)
  }

  const updateAnswer = (questionIndex: number, answerIndex: number, value: string) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].answers[answerIndex] = value
    setQuestions(updatedQuestions)
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index)
    setQuestions(updatedQuestions)
  }

  const addAnswer = (questionIndex: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].answers.push('')
    setQuestions(updatedQuestions)
  }

  const removeAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].answers.splice(answerIndex, 1)
    updatedQuestions[questionIndex].correctAnswers = updatedQuestions[questionIndex].correctAnswers.filter(
      (index) => index !== answerIndex
    ).map((index) => (index > answerIndex ? index - 1 : index))
    setQuestions(updatedQuestions)
  }

  const toggleCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...questions]
    const correctAnswers = updatedQuestions[questionIndex].correctAnswers
    const answerIndexPosition = correctAnswers.indexOf(answerIndex)
    
    if (answerIndexPosition === -1) {
      correctAnswers.push(answerIndex)
    } else {
      correctAnswers.splice(answerIndexPosition, 1)
    }
    
    setQuestions(updatedQuestions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    setIsDisabled(true);
    e.preventDefault()
    if (!session?.user?.id) {
      console.error('User not authenticated')
      return
    }
    
    try {
      const response = await fetch('/api/create-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: testName,
          questions: questions,
          userId: session.user.id,
        }),
      })

      if (response.ok) {
        console.log('Test saved successfully')
        setTestName('')
        setQuestions([])
        router.push('/home')
      } else {
        console.error('Failed to save test')
      }
    } catch (error) {
      console.error('Error saving test:', error)
    }
  }

  return (
    <>
      <Header_main />
      <div className="min-h-screen bg-gray-900 text-white p-6 ">
        <div className="max-w-4xl mx-auto">
          <Link href="/home" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6">
            <ArrowLeft className="mr-2" />
            Powrót do strony głównej
          </Link>
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            Stwórz własny test
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="testName" className="block text-sm font-medium text-gray-300 mb-2">
                Nazwa testu
              </label>
              <input
                type="text"
                id="testName"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>

            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="bg-gray-800 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Pytanie {questionIndex + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Wpisz pytanie"
                  required
                />
                {question.answers.map((answer, answerIndex) => (
                  <div key={answerIndex} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`question-${questionIndex}-answer-${answerIndex}`}
                      checked={question.correctAnswers.includes(answerIndex)}
                      onChange={() => toggleCorrectAnswer(questionIndex, answerIndex)}
                      className="text-purple-600 focus:ring-purple-600 rounded"
                    />
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => updateAnswer(questionIndex, answerIndex, e.target.value)}
                      className="flex-grow bg-gray-700 text-white border border-gray-600 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder={`Odpowiedź ${answerIndex + 1}`}
                      required
                    />
                    {question.answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeAnswer(questionIndex, answerIndex)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Minus size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addAnswer(questionIndex)}
                  className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 ease-in-out flex items-center justify-center"
                >
                  <Plus size={20} className="mr-2" /> Dodaj odpowiedź
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 ease-in-out flex items-center justify-center"
            >
              <PlusCircle className="mr-2" /> Dodaj pytanie
            </button>

            <button
              type="submit"
              
              disabled={isDisabled}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 ease-in-out"
            >
              Zapisz test
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

interface Question {
  question: string
  answers: string[]
  correctAnswers: number[]
}

export default CreateTestPage