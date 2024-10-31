"use client";

import React from 'react'
import { useRouter } from 'next/navigation'
import { Book, BarChart2, Award, PlusCircle, Download } from 'lucide-react'
import Link from 'next/link';
interface Body_startProps {
  onStartTest: () => void
}

  const Body_start  = () => {
  const router = useRouter()

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
          Witaj w Testowniku!
          
        </h1>
       
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <QuickAccessCard 
            icon={<Book className="h-8 w-8" />}
            title="Rozpocznij test"
            description="Wybierz kategorię i rozpocznij nowy test"
            onClick={handlefolder1}
          />
          <QuickAccessCard 
            icon={<BarChart2 className="h-8 w-8" />}
            title="Twoje statystyki"
            description="Sprawdź swoje postępy i wyniki"
            onClick={handlefolder2}
          />
          <QuickAccessCard 
            icon={<Download className="h-8 w-8" />}
            title="Importuj zestawy"
            description="Zaimportuj własne zestawy pytań"
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
            <StatCard title="Ukończone testy" value="42" />
            <StatCard title="Średni wynik" value="78%" />
            <StatCard title="Streak" value="5 dni" />
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
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="bg-gray-700 rounded-lg p-4 text-center">
    <h4 className="text-lg font-semibold mb-2">{title}</h4>
    <p className="text-3xl font-bold text-purple-400">{value}</p>
    
  </div>
)

export default Body_start