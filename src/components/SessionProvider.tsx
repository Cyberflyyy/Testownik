'use client'

import { SessionProvider as Provider } from "next-auth/react"
import { Session } from "next-auth"

type Props = {
  children: React.ReactNode
  session: Session | null // Użyj odpowiedniego typu
}

export default function SessionProvider({ children, session }: Props) {
  return (
    <Provider session={session}>
      {children}
    </Provider>
  )
}
