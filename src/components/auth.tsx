'use client'

import { useSession, signIn } from 'next-auth/react'
import { Github } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Auth() {
  const {  status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/home')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Ładowanie...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold text-white mb-6">Witaj w Quicktest</h1>
          <p className="text-gray-300 mb-8">Zaloguj się, aby rozpocząć naukę</p>
          <button
            onClick={() => signIn('github')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 ease-in-out flex items-center justify-center mx-auto"
          >
            <Github className="mr-2" />
            Zaloguj się przez GitHub
          </button>
        </div>
      </div>
    )
  }

  return null
}
