'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, ArrowLeft, RefreshCcw } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'
interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ExtendedSession extends Session {
  user: ExtendedUser;
}
interface Test {
  id: number
  name: string
  createdAt: string
  questions: Question[];
 
}
interface Question {
  id: string;
  question: string;
  answers: string[];
  correctAnswers: number[];
}
export default function DeleteTests() {
  const [tests, setTests] = useState<Test[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession() as { data: ExtendedSession | null };

  const fetchTests = async () => {
    
    if (!session?.user?.id) {
      setError('Nie jesteś zalogowany')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/get-tests?userId=${session.user.id}`)
      if (!response.ok) throw new Error('Nie udało się pobrać testów')
      const data = await response.json()
      if (data.success) {
        setTests(data.tests)
      } else {
        throw new Error(data.error || 'Nie udało się pobrać testów')
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
      setError('Błąd podczas pobierania testów')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchTests()
    }
  }, [session])

  const handleDeleteTest = async (testId: number) => {
    if (!session?.user?.id) return

    if (confirm('Czy na pewno chcesz usunąć ten test? Tej operacji nie można cofnąć.')) {
      try {
        const response = await fetch(`/api/delete-tests?id=${testId}&userId=${session.user.id}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) throw new Error('Nie udało się usunąć testu')
        
        const result = await response.json()
        if (result.success) {
          setTests(tests.filter(test => test.id !== testId))
        } else {
          throw new Error(result.message || 'Nie udało się usunąć testu')
        }
      } catch (error) {
        console.error('Error deleting test:', error)
        setError('Błąd podczas usuwania testu')
      }
    }
  }

  if (!session) {
    router.push('/')
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCcw size={40} />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">Zarządzanie testami</h1>
          <button
            onClick={() => router.push('/home')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full flex items-center transition-colors duration-300"
          >
            <ArrowLeft className="mr-2" size={18} />
            Powrót
          </button>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6 flex items-center justify-between">
            <p>{error}</p>
            <button 
              onClick={fetchTests}
              className="bg-white text-red-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-red-100 transition-colors duration-300"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {tests.length === 0 ? (
          <p className="text-center text-gray-400 text-lg">Brak dostępnych testów.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {tests.map((test) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-800 p-6 rounded-lg shadow-lg"
                >
                  <h2 className="text-xl font-semibold mb-2">{test.name}</h2>
                  <p className="text-gray-400 mb-4">
                    Utworzono: {new Date(test.createdAt).toLocaleDateString('pl-PL')}
                  </p>
                
                  <button
                    onClick={() => handleDeleteTest(test.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full flex items-center justify-center w-full transition-colors duration-300"
                  >
                    <Trash2 className="mr-2" size={18} />
                    Usuń test
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}