'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

const Header_main = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const toggleMenu = () => {
    setIsMenuOpen(prevState => !prevState)
  }
  
  return (
    <>
    <header className="bg-gradient-to-r from-purple-800 to-indigo-800 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-3xl font-bold text-white">
              Testownik
            </h1>
            <nav className="hidden md:flex space-x-4">
              <a href="#" className="text-white hover:text-purple-400 transition-colors">Strona Główna</a>
              <a href="#" className="text-white hover:text-purple-400 transition-colors">O Nas</a>
              <a href="#" className="text-white hover:text-purple-400 transition-colors">Kontakt</a>
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
            className="bg-gray-800 shadow-lg overflow-hidden"
          >
            <div className="container mx-auto py-4 px-4 flex flex-col space-y-4">
              <a href="#" className="text-white hover:text-purple-400 transition-colors">Strona Główna</a>
              <a href="#" className="text-white hover:text-purple-400 transition-colors">O Nas</a>
              <a href="#" className="text-white hover:text-purple-400 transition-colors">Kontakt</a>
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