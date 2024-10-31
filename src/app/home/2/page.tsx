'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowLeft } from 'lucide-react'
import Header_main from '@/components/header_main'
import Link from 'next/link'

const data = [
  { name: 'Matematyka', poprawne: 80, niepoprawne: 20 },
  { name: 'Fizyka', poprawne: 65, niepoprawne: 35 },
  { name: 'Chemia', poprawne: 45, niepoprawne: 55 },
  { name: 'Biologia', poprawne: 70, niepoprawne: 30 },
  { name: 'Historia', poprawne: 55, niepoprawne: 45 },
]

const StatisticsPage: React.FC = () => {
  return (
    <>
    <Header_main />
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/home" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6">
          <ArrowLeft className="mr-2" />
          Powrót do strony głównej
        </Link>
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
          Twoje statystyki
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Ukończone testy" value="42" />
          <StatCard title="Średni wynik" value="78%" />
          <StatCard title="Najlepszy wynik" value="95%" />
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-12">
          <h2 className="text-2xl font-semibold mb-4">Wyniki według kategorii</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="poprawne" stackId="a" fill="#8884d8" />
                <Bar dataKey="niepoprawne" stackId="a" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Ostatnie aktywności</h2>
          <ul className="space-y-4">
            <ActivityItem 
              category="Matematyka" 
              score={85} 
              date="2023-05-15" 
            />
            <ActivityItem 
              category="Fizyka" 
              score={72} 
              date="2023-05-14" 
            />
            <ActivityItem 
              category="Chemia" 
              score={68} 
              date="2023-05-13" 
            />
          </ul>
        </div>
      </div>
    </div></>
  )
}

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

interface ActivityItemProps {
  category: string
  score: number
  date: string
}

const ActivityItem: React.FC<ActivityItemProps> = ({ category, score, date }) => (
  <li className="flex justify-between items-center bg-gray-700 rounded-lg p-4">
    <div>
      <h3 className="font-semibold">{category}</h3>
      <p className="text-sm text-gray-400">{date}</p>
    </div>
    <div className="text-2xl font-bold text-purple-400">{score}%</div>
  </li>
)

export default StatisticsPage