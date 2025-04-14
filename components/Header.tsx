'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Tikriname vartotojo prisijungimo būseną
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setIsLoggedIn(!!data.session)
      } catch (error) {
        console.error('Autentifikacijos klaida:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
  }, [])

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.svg"
                alt="Siemka.lt"
                width={120}
                height={32}
                style={{ width: 'auto', height: 'auto' }}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className="text-brand-dark hover:text-brand-primary px-3 py-2 text-sm font-medium"
            >
              Pagrindinis
            </Link>
            <Link 
              href="/products" 
              className="text-brand-dark hover:text-brand-primary px-3 py-2 text-sm font-medium"
            >
              Produktai
            </Link>
            <Link 
              href={{ pathname: '/about' }}
              className="text-brand-dark hover:text-brand-primary px-3 py-2 text-sm font-medium"
            >
              Apie mus
            </Link>
            <Link 
              href={{ pathname: '/contact' }}
              className="text-brand-dark hover:text-brand-primary px-3 py-2 text-sm font-medium"
            >
              Kontaktai
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-24 h-8 bg-gray-200 animate-pulse rounded-md"></div>
            ) : isLoggedIn ? (
              <div className="flex space-x-4">
                <Link
                  href={{ pathname: '/account' }}
                  className="text-brand-dark hover:text-brand-primary px-3 py-2 text-sm font-medium"
                >
                  Mano paskyra
                </Link>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    setIsLoggedIn(false)
                  }}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Atsijungti
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Prisijungti
              </Link>
            )}
            
            <a
              href="https://siemka.lt"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Į pagrindinę svetainę
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}