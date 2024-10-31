import { Inter } from 'next/font/google'
import './globals.css'
import { getServerSession } from "next-auth/next"
import SessionProvider from "../components/SessionProvider"
import { authOptions } from "./api/auth/[...nextauth]/auth"

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="pl">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}