'use client'

import { useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import ProductSelector from '@/components/ProductSelector'
import UploadArea from '@/components/UploadArea'
import DesignCanvas from '@/components/DesignCanvas'
import Controls from '@/components/Controls'
import OrderForm from '@/components/OrderForm'
import type { Product } from '@/lib/types'
import type { OrderFormData } from '@/lib/validations/order'
import toast from 'react-hot-toast'

export default function Home() {
  const [productImage, setProductImage] = useState('/images/hoodie_dark.png')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [opacity, setOpacity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [designPreview, setDesignPreview] = useState<string | null>(null)
  
  const [selectedProduct, setSelectedProduct] = useState<Product>({
    id: 'hoodie-dark',
    name: 'Džemperis (tamsus)',
    imageUrl: '/images/hoodie_dark.png',
    type: 'hoodie',
    color: 'dark',
    price: 39.99
  })

  const products: Product[] = [
    {
      id: 'hoodie-dark',
      name: 'Džemperis (tamsus)',
      imageUrl: '/images/hoodie_dark.png',
      type: 'hoodie',
      color: 'dark',
      price: 39.99
    },
    {
      id: 'hoodie-light',
      name: 'Džemperis (šviesus)',
      imageUrl: '/images/hoodie_light.png',
      type: 'hoodie',
      color: 'light',
      price: 39.99
    },
    {
      id: 'tshirt-dark',
      name: 'Marškinėliai (tamsūs)',
      imageUrl: '/images/tshirt_dark.png',
      type: 'tshirt',
      color: 'dark',
      price: 24.99
    },
    {
      id: 'tshirt-light',
      name: 'Marškinėliai (šviesūs)',
      imageUrl: '/images/tshirt_light.png',
      type: 'tshirt',
      color: 'light',
      price: 24.99
    }
  ]

  const handleProductSelect = useCallback((product: Product) => {
    setSelectedProduct(product)
    setProductImage(product.imageUrl)
  }, [])

  const supabase = createClientComponentClient()

  const handleOrderSubmit = async (formData: OrderFormData) => {
    if (!designPreview) {
      toast.error('Nepavyko sugeneruoti dizaino peržiūros')
      return
    }

    setIsSubmitting(true)
    try {
      const totalPrice = selectedProduct.price * formData.quantity

      const response = await fetch('/api/submitDesign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          designPreview,
          totalPrice,
          productId: selectedProduct.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit order')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      toast.success('Užsakymas sėkmingai pateiktas!')
      
      // Reset form state
      setUploadedImage(null)
      setScale(1)
      setOpacity(1)
      setDesignPreview(null)
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('Įvyko klaida pateikiant užsakymą')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Susikurk savo dizainą
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
            disabled={!uploadedImage}
            designPreview={designPreview}
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