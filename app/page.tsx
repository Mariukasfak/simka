'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductSelector from '@/components/ProductSelector'
import UploadArea from '@/components/UploadArea'
import EnhancedDesignCanvas from '@/components/EnhancedDesignCanvas'
import EnhancedOrderForm from '@/components/EnhancedOrderForm'
import { useDesignState } from '@/lib/hooks/useDesignState'
import { PRINT_AREAS, PRODUCT_VIEWS } from '@/lib/constants'
import toast from 'react-hot-toast'
import type { Product } from '@/lib/types'

export default function Home() {
  const searchParams = useSearchParams()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Design state management
  const {
    designState,
    currentView,
    updateDesignState,
    setCurrentView,
    resetDesignState
  } = useDesignState()
  
  // Design previews for each print area
  const [designPreviews, setDesignPreviews] = useState<Record<string, string | null>>({
    'front': null,
    'back': null,
    'left-sleeve': null,
    'right-sleeve': null
  })
  
  const [selectedProduct, setSelectedProduct] = useState<Product>({
    id: 'hoodie-light',
    name: 'Džemperis (šviesus)',
    imageUrl: '/images/hoodie_light.png',
    type: 'hoodie',
    color: 'light',
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
  
  // Load product from URL params
  useEffect(() => {
    const productId = searchParams.get('product')
    if (productId) {
      const product = products.find(p => p.id === productId)
      if (product) {
        setSelectedProduct(product)
      }
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchParams, products])

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    // Reset design state when changing products
    resetDesignState()
    setDesignPreviews({
      'front': null,
      'back': null,
      'left-sleeve': null,
      'right-sleeve': null
    })
  }
  
  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl || null)
    
    if (!imageUrl) {
      // Clear all previews if no image
      setDesignPreviews({
        'front': null,
        'back': null,
        'left-sleeve': null,
        'right-sleeve': null
      })
    }
  }

  // Update preview for current view
  const handlePreviewGenerated = (preview: string | null) => {
    setDesignPreviews(prev => ({
      ...prev,
      [currentView]: preview
    }))
  }

  const handleOrderSubmit = async (formData: any) => {
    if (!Object.values(designPreviews).some(preview => preview !== null)) {
      toast.error('Nepavyko sugeneruoti dizaino peržiūros')
      return
    }

    setIsSubmitting(true)
    try {
      // Here would be the API call to the server
      // For now, we'll simulate the request
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create data that would be sent to the server
      const orderData = {
        ...formData,
        product: selectedProduct,
        designPreviews,
        designState,
        totalPrice: selectedProduct.price * formData.quantity
      }
      
      console.log('Sending order data:', orderData)
      
      toast.success('Užklausa sėkmingai išsiųsta!')
      
      // Reset form
      setUploadedImage(null)
      resetDesignState()
      setDesignPreviews({
        'front': null,
        'back': null,
        'left-sleeve': null,
        'right-sleeve': null
      })
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('Įvyko klaida siunčiant užklausą')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-600 mb-3"></div>
          <p className="text-accent-600">Kraunama...</p>
        </div>
      </div>
    )
  }

  // Get current product view image
  const getCurrentProductImage = () => {
    const views = PRODUCT_VIEWS[selectedProduct.id as keyof typeof PRODUCT_VIEWS]
    return views ? views[currentView] : selectedProduct.imageUrl
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
          
          <UploadArea onImageUpload={handleImageUpload} />
          
          {uploadedImage && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4">Dizaino pozicijos</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(PRINT_AREAS).map(([position, area]) => (
                  <button
                    key={position}
                    onClick={() => setCurrentView(position as any)}
                    className={`p-3 rounded-lg text-center transition ${
                      currentView === position 
                        ? 'bg-accent-100 border border-accent-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-sm font-medium">{area.name}</div>
                    {designPreviews[position] && (
                      <div className="text-xs text-green-600 mt-1">✓ Pridėta</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <EnhancedOrderForm
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
            disabled={!uploadedImage}
            designPreviews={designPreviews}
            printAreas={Object.keys(PRINT_AREAS) as any[]}
            productPrice={selectedProduct.price}
          />
        </div>

        <div>
          <EnhancedDesignCanvas
            productImage={getCurrentProductImage()}
            uploadedImage={uploadedImage}
            designState={designState}
            onDesignChange={updateDesignState}
            onPreviewGenerated={handlePreviewGenerated}
            printAreas={PRINT_AREAS}
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </div>
      </div>
    </div>
  )
}