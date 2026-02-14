'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/types'

export default function ProductsPage() {
  const [products] = useState<Product[]>([
    {
      id: 'hoodie-dark',
      name: 'Džemperis (tamsus)',
      description: 'Aukštos kokybės medvilninis džemperis su gobtuvu',
      imageUrl: '/images/hoodie_dark.png',
      type: 'hoodie',
      color: 'dark',
      price: 39.99
    },
    {
      id: 'hoodie-light',
      name: 'Džemperis (šviesus)',
      description: 'Klasikinis šviesus džemperis su gobtuvu',
      imageUrl: '/images/hoodie_light.png',
      type: 'hoodie',
      color: 'light',
      price: 39.99
    },
    {
      id: 'tshirt-dark',
      name: 'Marškinėliai (tamsūs)',
      description: 'Patogūs medvilniniai marškinėliai',
      imageUrl: '/images/tshirt_dark.png',
      type: 'tshirt',
      color: 'dark',
      price: 24.99
    },
    {
      id: 'tshirt-light',
      name: 'Marškinėliai (šviesūs)',
      description: 'Lengvi ir stilingi marškinėliai',
      imageUrl: '/images/tshirt_light.png',
      type: 'tshirt',
      color: 'light',
      price: 24.99
    }
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-brand-900 mb-4">
          Mūsų produktai
        </h1>
        <p className="text-xl text-brand-600 max-w-2xl mx-auto">
          Pasirinkite produktą ir sukurkite savo unikalų dizainą
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div 
            key={product.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105"
          >
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold text-brand-900 mb-2">
                {product.name}
              </h3>
              <p className="text-brand-600 mb-4">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-brand-900">
                  €{product.price}
                </span>
                <Link
                  href={`/?product=${product.id}`}
                  className="btn btn-primary"
                >
                  Kurti dizainą
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-brand-900 mb-4">
          Norite sukurti kažką ypatingo?
        </h2>
        <p className="text-brand-600 mb-8 max-w-2xl mx-auto">
          Susisiekite su mumis dėl individualių užsakymų ar didesnių kiekių
        </p>
        <Link
          href="/"
          className="btn btn-outline"
        >
          Susisiekti
        </Link>
      </div>
    </div>
  )
}