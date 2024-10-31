'use client'

import { useSession } from 'next-auth/react'
import Header_main from './header_main'
import Body_start from './body_start'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Ładowanie...</div>
  }

  if (!session) {
    return <div>Nie masz dostępu do tej strony. Zaloguj się.</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header_main />
      <Body_start  />
    </div>
  )
}