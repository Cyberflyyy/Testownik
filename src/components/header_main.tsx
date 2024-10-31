'use client'
import { signOut } from "next-auth/react";
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const Header_main: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const toggleMenu = () => {
    setIsMenuOpen(prevState => !prevState)
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // 768px to breakpoint md w Tailwind
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup listener on component unmount
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return (
    <>
      <header className="bg-gradient-to-r from-purple-800 to-indigo-800 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">

              <h1 className="text-3xl font-bold text-white">
                Testownik
              </h1>
            </div>
            <button
      onClick={() => signOut()}
      className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Wyloguj się
    </button>
            <nav className="hidden md:flex space-x-4">
              <Link href="/" className="text-white hover:text-purple-400 transition-colors">Strona Główna</Link>
              <Link href="/about" className="text-white hover:text-purple-400 transition-colors">O Nas</Link>
              <Link href="/contact" className="text-white hover:text-purple-400 transition-colors">Kontakt</Link>
            </nav>
            <button className="bg-purple-600 hidden md:block hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 ease-in-out">
              Stwórz bazę
            </button>
            <button 
              className="md:hidden text-white focus:outline-none z-20"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Zamknij menu" : "Otwórz menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-gray-800 shadow-lg overflow-hidden md:hidden"
          >
            <div className="container mx-auto py-4 px-4 flex flex-col space-y-4">
              <Link href="/" className="text-white hover:text-purple-400 transition-colors">Strona Główna</Link>
              <Link href="/about" className="text-white hover:text-purple-400 transition-colors">O Nas</Link>
              <Link href="/contact" className="text-white hover:text-purple-400 transition-colors">Kontakt</Link>
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-300 ease-in-out">
                Stwórz bazę
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header_main