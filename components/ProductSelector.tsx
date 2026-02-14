'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Product } from '@/lib/types'

interface ProductSelectorProps {
  products: Product[]
  selectedProduct: Product
  onSelect: (product: Product) => void
}

export default function ProductSelector({
  products,
  selectedProduct,
  onSelect
}: ProductSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-brand-900">
        Pasirinkite produktą
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <motion.button
            key={product.id}
            onClick={() => onSelect(product)}
            className={`relative p-4 rounded-lg border-2 transition-colors ${
              selectedProduct.id === product.id
                ? 'border-accent-500 bg-accent-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative aspect-square bg-white rounded overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-contain p-2"
              />
            </div>
            
            <div className="mt-3 text-center">
              <h3 className="text-sm font-medium text-brand-900">
                {product.name}
              </h3>
              <p className="mt-1 text-sm text-brand-600">
                €{product.price}
              </p>
            </div>

            {selectedProduct.id === product.id && (
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

      <div className="mt-4 p-4 bg-brand-50 rounded-lg">
        <h3 className="text-sm font-medium text-brand-900">
          Produkto informacija
        </h3>
        <div className="mt-2 text-sm text-brand-600">
          <p>Medžiaga: 100% medvilnė</p>
          <p>Svoris: 280 g/m²</p>
          <p>Priežiūra: Skalbti 30°C temperatūroje</p>
        </div>
      </div>
    </div>
  )
}