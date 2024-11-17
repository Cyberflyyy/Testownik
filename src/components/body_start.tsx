'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Book, BarChart2, PlusCircle, Delete, Edit, Clock } from 'lucide-react'
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

const Body_start = () => {
  const router = useRouter()
  const { data: session } = useSession() as { data: ExtendedSession | null }
  const [weeklyTestTime, setWeeklyTestTime] = useState(0)
  const [completedTests, setCompletedTests] = useState(0)
  const [averageScore, setAverageScore] = useState(0)

  useEffect(() => {
    if (session?.user?.id) {
      fetchWeeklyTestTime()
      fetchUserStats()
    }
  }, [session])

  const fetchWeeklyTestTime = async () => {
    try {
      const response = await fetch(`/api/get-weekly-test-time?userId=${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setWeeklyTestTime(data.weeklyTestTime)
      } else {
        console.error('Błąd podczas pobierania czasu testów:', await response.text())
      }
    } catch (error) {
      console.error('Błąd podczas pobierania czasu testów:', error)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/get-user-stats?userId=${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setCompletedTests(data.completedTests)
        setAverageScore(data.averageScore)
      } else {
        console.error('Błąd podczas pobierania statystyk użytkownika:', await response.text())
      }
    } catch (error) {
      console.error('Błąd podczas pobierania statystyk użytkownika:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m ${seconds % 60}s`
  }

  const handlefolder1 = () => {
    router.push('/home/1')
  }
  const handlefolder2 = () => {
    router.push('/home/2')
  }
  const handlefolder3 = () => {
    router.push('/home/3')
  }
  const handlefolder4 = () => {
    router.push('/home/4')
  }

  return (
    <div className="flex-grow bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          Witaj w QuickTest !
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <QuickAccessCard 
            icon={<Book className="h-8 w-8" />}
            title="Rozpocznij test"
            description="Wybierz kategorię i rozpocznij nowy test"
            onClick={handlefolder1}
          />
          <QuickAccessCard 
            icon={<Edit className="h-8 w-8" />}
            title="Edytuj "
            description="Zmień nazwę, pytania lub odpowiedzi"
            onClick={handlefolder2}
          />
          <QuickAccessCard 
            icon={<Delete className="h-8 w-8" />}
            title="Usuń test"
            description="Usuń test którego nie potrzebujesz"
            onClick={handlefolder3}
          />
          <QuickAccessCard 
            icon={<PlusCircle className="h-8 w-8" />}
            title="Stwórz własny test"
            description="Przygotuj własny zestaw pytań"
            onClick={handlefolder4}
          />
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Twoje podsumowanie</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Ukończone testy" value={completedTests.toString()} />
            <StatCard title="Średni wynik" value={`${averageScore.toFixed(2)}%`} />
            <StatCard 
              title="Czas nauki w tym tygodniu" 
              value={formatTime(weeklyTestTime)}
              icon={<Clock className="h-6 w-6 text-purple-400" />}
            />
          </div>
        </div>

        <div className="mt-12 text-center">
          <button 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 ease-in-out transform hover:scale-105"
            onClick={handlefolder1}
          >
            Rozpocznij nową sesję nauki
          </button>
        </div>
      </div>
    </div>
  )
}

interface QuickAccessCardProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick?: () => void
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ icon, title, description, onClick }) => (
  <div 
    className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center cursor-pointer"
    onClick={onClick}
  >
    <div className="mb-4 text-purple-400">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
)

interface StatCardProps {
  title: string
  value: string
  icon?: React.ReactNode
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => (
  <div className="bg-gray-700 rounded-lg p-4 text-center">
    <h4 className="text-lg font-semibold mb-2">{title}</h4>
    <div className="flex items-center justify-center">
      {icon && <div className="mr-2">{icon}</div>}
      <p className="text-3xl font-bold text-purple-400">{value}</p>
    </div>
  </div>
)

export default Body_start