'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import ProductSelector from '@/components/ProductSelector'
import UploadArea from '@/components/UploadArea'
import EnhancedDesignCanvas from '@/components/EnhancedDesignCanvas'
import EnhancedOrderForm from '@/components/EnhancedOrderForm'
import DesignWizard, { WizardStep } from '@/components/DesignWizard'
import WizardContent from '@/components/WizardContent'
import { useDesignState } from '@/lib/hooks/useDesignState'
import { PRINT_AREAS, PRODUCT_VIEWS } from '@/lib/constants'
import { toast } from 'react-hot-toast'
import type { Product } from '@/lib/types'

// Static products definition - performance optimization
const PRODUCTS: Product[] = [
  {
    id: 'hoodie-dark',
    name: 'Džemperis (tamsus)',
    imageUrl: '/images/hoodie_dark.png',
    type: 'hoodie',
    color: 'dark',
    price: 39.99,
    description: 'Kokybiškas, šiltas džemperis su gobtuvu. Puikiai tinka vėsesniam orui. Sudėtis: 80% medvilnė, 20% poliesteris. Gramatūra: 280 g/m².'
  },
  {
    id: 'hoodie-light',
    name: 'Džemperis (šviesus)',
    imageUrl: '/images/hoodie_light_front.png',
    type: 'hoodie',
    color: 'light',
    price: 39.99,
    description: 'Stilingas šviesus džemperis su gobtuvu. Minkštas vidus užtikrina komfortą. Sudėtis: 80% medvilnė, 20% poliesteris. Gramatūra: 280 g/m².'
  },
  {
    id: 'tshirt-dark',
    name: 'Marškinėliai (tamsūs)',
    imageUrl: '/images/tshirt_dark.png',
    type: 'tshirt',
    color: 'dark',
    price: 24.99,
    description: 'Klasikiniai juodi marškinėliai trumpomis rankovėmis. Pagaminti iš aukštos kokybės medvilnės. Sudėtis: 100% medvilnė. Gramatūra: 180 g/m².'
  },
  {
    id: 'tshirt-light',
    name: 'Marškinėliai (šviesūs)',
    imageUrl: '/images/tshirt_light.png',
    type: 'tshirt',
    color: 'light',
    price: 24.99,
    description: 'Lengvi ir patogūs balti marškinėliai. Puikiai tinka spaudai. Sudėtis: 100% medvilnė. Gramatūra: 180 g/m².'
  }
];

// Sukuriame atskirą komponentą su useSearchParams
function HomeContent() {
  const searchParams = useSearchParams()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showDesignTool, setShowDesignTool] = useState(false)
  const [hasDesignedProduct, setHasDesignedProduct] = useState(false)
  const [currentWizardStep, setCurrentWizardStep] = useState<WizardStep>('product')
  
  // Design state management
  const {
    designState,
    designStates,
    currentView,
    updateDesignState,
    setCurrentView,
    resetDesignState,
    getAllDesignStates
  } = useDesignState()
  
  // Design previews for each print area
  const [designPreviews, setDesignPreviews] = useState<Record<string, string | null>>({
    'front': null,
    'back': null,
    'left-sleeve': null,
    'right-sleeve': null
  })
  
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[1]); // Džemperis (šviesus) kaip numatytasis

  // Load product from URL params - optimizuotas priklausomybėms
  const productId = searchParams?.get('product')

  useEffect(() => {
    if (productId) {
      const product = PRODUCTS.find(p => p.id === productId)
      if (product) {
        setSelectedProduct(product)
      }
    }
  }, [productId])

  // Simulate loading only if design tool is visible
  useEffect(() => {
    if (showDesignTool) {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 300)
      
      return () => clearTimeout(timer)
    } else {
      // If design tool is not visible, we don't need loading state
      setIsLoading(false)
    }
  }, [showDesignTool])

  // Reset funkcija - optimizuota su useCallback
  const resetPreviews = useCallback(() => {
    return {
      'front': null,
      'back': null,
      'left-sleeve': null,
      'right-sleeve': null
    };
  }, []);

  const handleProductSelect = useCallback((product: Product) => {
    setSelectedProduct(product)
    // Reset design state when changing products
    resetDesignState()
    setDesignPreviews(resetPreviews())
  }, [resetDesignState, resetPreviews]);
  
  const handleImageUpload = useCallback((imageUrl: string) => {
    setUploadedImage(imageUrl || null)
    
    if (!imageUrl) {
      // Clear all previews if no image
      setDesignPreviews(resetPreviews())
    }
  }, [resetPreviews]);

  // Update preview for current view
  const handlePreviewGenerated = useCallback((preview: string | null) => {
    setDesignPreviews(prev => ({
      ...prev,
      [currentView]: preview
    }))
    
    // If a preview was generated, mark that user has designed something
    if (preview) {
      setHasDesignedProduct(true)
    }
  }, [currentView]);

  // Optimizuota versija su POST į API
  const handleOrderSubmit = useCallback(async (formData: any) => {
    if (!Object.values(designPreviews).some(preview => preview !== null)) {
      toast.error('Nepavyko sugeneruoti dizaino peržiūros')
      return
    }

    setIsSubmitting(true)
    try {
      // Sukuriame užsakymo duomenis
      const orderData = {
        ...formData,
        product: selectedProduct,
        designPreviews,
        uploadedImage, // Pridedame originalų logotipą
        designStates: getAllDesignStates(), // Naudojame visų pozicijų dizaino būsenas
        totalPrice: selectedProduct.price * formData.quantity,
        printAreas: Object.keys(PRINT_AREAS).filter(area => designPreviews[area] !== null)
      }
      
      // Siunčiame duomenis į serverį
      const response = await fetch('/api/submit-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Įvyko klaida siunčiant užklausą');
      }
      
      toast.success('Užklausa sėkmingai išsiųsta!')
      
      // Reset form
      setUploadedImage(null)
      resetDesignState()
      setDesignPreviews(resetPreviews())
      setCurrentWizardStep('product')
      setHasDesignedProduct(false)
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error(error instanceof Error ? error.message : 'Įvyko klaida siunčiant užklausą')
    } finally {
      setIsSubmitting(false)
    }
  }, [designPreviews, uploadedImage, getAllDesignStates, resetDesignState, resetPreviews, selectedProduct]);

  // Pereiname į kitą žingsnį
  const handleNextStep = useCallback(() => {
    setCurrentWizardStep(prevStep => {
      switch (prevStep) {
        case 'product': return 'upload';
        case 'upload': return 'design';
        case 'design': return 'order';
        default: return prevStep;
      }
    });
  }, []);

  // Handler for CTA button click
  const handleStartDesigning = () => {
    setShowDesignTool(true)
    setIsLoading(true) // Start loading when design tool is requested
    // Scroll to the design tool after a short delay to let it render
    setTimeout(() => {
      document.getElementById('design-tool')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Make PRODUCT_VIEWS globally available for the wizard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).PRODUCT_VIEWS = PRODUCT_VIEWS;
    }
  }, []);

  // Kraunasi būsena - optimizuota versija
  if (isLoading && showDesignTool) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mb-3"></div>
          <p className="text-accent-600 text-lg">Kraunamas dizaino įrankis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero sekcija - visada rodoma */}
      <div className="mb-12 text-center relative">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">
            Susikurk savo spaudos dizainą ant marškinėlių ar džemperių
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Įkelk savo logotipą, uždėk jį ant rūbo ir gauk pasiūlymą per kelias minutes
          </p>
          
          {!showDesignTool && (
            <>
              {/* Pataisytas CTA mygtukas - aiškiai matomas ir ryškus */}
              <button 
                onClick={handleStartDesigning}
                className="px-8 py-4 bg-accent-600 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-accent-700 transition-colors inline-flex items-center justify-center"
                style={{ minWidth: '220px' }}
              >
                Pradėti kurti dizainą
              </button>

              <div className="mt-10 flex justify-center space-x-8">
                <div className="relative w-48 h-64 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/images/tshirt_light.png" 
                    alt="Marškinėliai su logotipu" 
                    width={192} 
                    height={256} 
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                      <Image 
                        src="/images/logo.svg" 
                        alt="Logotipas ant marškinėlių" 
                        width={50} 
                        height={50}
                      />
                    </div>
                  </div>
                </div>
                <div className="relative w-48 h-64 bg-gray-100 rounded-lg overflow-hidden shadow-md">
                  <Image 
                    src="/images/hoodie_dark.png" 
                    alt="Džemperis su logotipu" 
                    width={192} 
                    height={256} 
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                      <Image 
                        src="/images/logo.svg" 
                        alt="Logotipas ant džemperio" 
                        width={50} 
                        height={50} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dizaino įrankis su vedliu - rodomas tik kai showDesignTool = true */}
      {showDesignTool && (
        <div id="design-tool" className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Sukurkite savo dizainą</h2>
          
          <DesignWizard
            currentStep={currentWizardStep}
            setCurrentStep={setCurrentWizardStep}
            hasUploadedImage={!!uploadedImage}
            hasDesignedProduct={hasDesignedProduct}
            designPreviews={designPreviews}
          />
          
          <WizardContent
            currentStep={currentWizardStep}
            products={PRODUCTS}
            selectedProduct={selectedProduct}
            uploadedImage={uploadedImage}
            designState={designState}
            designPreviews={designPreviews}
            printAreas={PRINT_AREAS}
            currentView={currentView}
            isSubmitting={isSubmitting}
            onProductSelect={handleProductSelect}
            onImageUpload={handleImageUpload}
            onDesignChange={updateDesignState}
            onViewChange={setCurrentView}
            onPreviewGenerated={handlePreviewGenerated}
            onOrderSubmit={handleOrderSubmit}
            onNextStep={handleNextStep}
          />
        </div>
      )}
    </div>
  )
}

// Pagrindinis puslapis su Suspense - atnaujintas komponentas be privalomo prisijungimo
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-600 mb-3"></div>
          <p className="text-accent-600">Kraunama...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}