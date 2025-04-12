'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface Mockup {
  id: string
  name: string
  imageUrl: string
}

interface FigmaMockupSelectorProps {
  onSelect: (mockup: Mockup) => void
  selectedMockup?: Mockup
}

export default function FigmaMockupSelector({
  onSelect,
  selectedMockup
}: FigmaMockupSelectorProps) {
  const [mockups, setMockups] = useState<Mockup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMockups() {
      try {
        const response = await fetch('/api/figma/mockups')
        if (!response.ok) {
          throw new Error('Failed to fetch mockups')
        }
        const data = await response.json()
        setMockups(data)
      } catch (error) {
        setError('Failed to load mockups')
        console.error('Error fetching mockups:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMockups()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-brand-900">
        Pasirinkite produkto maketą
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {mockups.map((mockup) => (
          <motion.button
            key={mockup.id}
            onClick={() => onSelect(mockup)}
            className={`relative p-4 rounded-lg border-2 transition-colors ${
              selectedMockup?.id === mockup.id
                ? 'border-accent-500 bg-accent-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative aspect-square bg-white rounded overflow-hidden">
              <Image
                src={mockup.imageUrl}
                alt={mockup.name}
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
            
            <div className="mt-3 text-center">
              <h3 className="text-sm font-medium text-brand-900">
                {mockup.name}
              </h3>
            </div>

            {selectedMockup?.id === mockup.id && (
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}