'use client'

import { useState, useCallback } from 'react'
import ProductSelector from '../components/ProductSelector'
import UploadArea from '../components/UploadArea'
import DesignCanvas from '../components/DesignCanvas'
import Controls from '../components/Controls'
import OrderForm from '../components/OrderForm'
import type { Product, FormData } from '../lib/types'

export default function Home() {
  const [productImage, setProductImage] = useState('/images/hoodie_dark.png')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [opacity, setOpacity] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState<Product>({
    id: 'hoodie-dark',
    name: 'Džemperis (tamsus)',
    imageUrl: '/images/hoodie_dark.png',
    type: 'hoodie',
    color: 'dark'
  })

  const products: Product[] = [
    {
      id: 'hoodie-dark',
      name: 'Džemperis (tamsus)',
      imageUrl: '/images/hoodie_dark.png',
      type: 'hoodie',
      color: 'dark'
    },
    {
      id: 'hoodie-light',
      name: 'Džemperis (šviesus)',
      imageUrl: '/images/hoodie_light.png',
      type: 'hoodie',
      color: 'light'
    },
    {
      id: 'tshirt-dark',
      name: 'Marškinėliai (tamsūs)',
      imageUrl: '/images/tshirt_dark.png',
      type: 'tshirt',
      color: 'dark'
    },
    {
      id: 'tshirt-light',
      name: 'Marškinėliai (šviesūs)',
      imageUrl: '/images/tshirt_light.png',
      type: 'tshirt',
      color: 'light'
    }
  ]

  const handleProductSelect = useCallback((product: Product) => {
    setSelectedProduct(product)
    setProductImage(product.imageUrl)
  }, [])

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    comments: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!designPreview) {
      throw new Error('Please generate a preview first')
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/submitDesign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          product: selectedProduct?.name,
          imageData: designPreview,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit order')
      }

      // Reset form after successful submission
      setFormData({ name: '', email: '', comments: '' })
    } catch (error) {
      console.error('Error submitting order:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const [designPreview, setDesignPreview] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Susikurk savo dizainą
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <ProductSelector
            products={products}
            selectedProduct={selectedProduct}
            onSelect={handleProductSelect}
          />
          
          <UploadArea onImageUpload={setUploadedImage} />
          
          {uploadedImage && (
            <Controls
              scale={scale}
              opacity={opacity}
              onScaleChange={setScale}
              onOpacityChange={setOpacity}
            />
          )}

          <OrderForm
            formData={formData}
            onChange={handleFormChange}
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
            disabled={!uploadedImage}
          />
        </div>

        <div>
          <DesignCanvas
            productImage={productImage}
            uploadedImage={uploadedImage}
            scale={scale}
            opacity={opacity}
            onPreviewGenerated={setDesignPreview}
          />
        </div>
      </div>
    </div>
  )
}