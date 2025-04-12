import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
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
              href="/about" 
              className="text-brand-dark hover:text-brand-primary px-3 py-2 text-sm font-medium"
            >
              Apie mus
            </Link>
            <Link 
              href="/contact" 
              className="text-brand-dark hover:text-brand-primary px-3 py-2 text-sm font-medium"
            >
              Kontaktai
            </Link>
          </nav>

          <div className="flex items-center">
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