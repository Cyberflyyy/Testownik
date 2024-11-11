'use client'

import { useSession } from 'next-auth/react'
import Header_main from './header_main'
import Body_start from './body_start'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Ładowanie...</div>
  }

  if (!session) {
    return (
      <div>
        <div>Nie masz dostępu do tej strony. </div>
        <Link href="/" className=" hover:text-purple-400 transition-colors">Strona Główna</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header_main />
      <Body_start  />
    </div>
  )
}