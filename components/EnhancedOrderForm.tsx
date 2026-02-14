'use client'

import { useState, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import type { PrintAreaPosition } from '@/lib/types'
import { orderFormSchema, type OrderFormData } from '@/lib/validations/order'

// Print area labels in Lithuanian - optimizuota su useMemo
const printAreaLabels: Record<PrintAreaPosition, string> = {
  'front': 'Priekis',
  'back': 'Nugara',
  'left-sleeve': 'Kairė rankovė',
  'right-sleeve': 'Dešinė rankovė'
}

interface EnhancedOrderFormProps {
  onSubmit: (data: OrderFormData) => Promise<void>
  isSubmitting: boolean
  disabled?: boolean
  designPreviews: Record<string, string | null>
  printAreas: PrintAreaPosition[]
  productPrice: number
}

export default function EnhancedOrderForm({
  onSubmit,
  isSubmitting,
  disabled = false,
  designPreviews,
  printAreas,
  productPrice
}: EnhancedOrderFormProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [currentPreview, setCurrentPreview] = useState<PrintAreaPosition | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // Optimizuota su useMemo, kad nereikėtų kaskart perskaičiuoti
  const defaultPrintAreas = useMemo(() => 
    printAreas.filter(area => designPreviews[area] !== null), 
    [printAreas, designPreviews]
  )
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      quantity: 1,
      size: 'M',
      printAreas: defaultPrintAreas
    }
  })

  const selectedPrintAreas = watch('printAreas')
  const quantity = watch('quantity')
  
  // Optimizuota su useCallback
  const handleFormSubmit = useCallback(async (data: OrderFormData) => {
    try {
      await onSubmit(data)
      setIsSuccess(true)
      reset()
    } catch (error) {
      console.error('Order submission error:', error)
      setIsSuccess(false)
    }
  }, [onSubmit, reset])

  // Calculate total price - optimizuota su useMemo
  const totalPrice = useMemo(() => {
    const basePrice = productPrice * (quantity || 1)
    const printingPrice = (selectedPrintAreas?.length || 0) * 5 // €5 per print area
    return basePrice + printingPrice
  }, [productPrice, quantity, selectedPrintAreas])

  // Check if at least one design is added - optimizuota su useMemo
  const hasAnyDesign = useMemo(() => 
    Object.values(designPreviews).some(preview => preview !== null),
    [designPreviews]
  )

  // Optimizuota funkcija preview parodymui
  const showPreviewForArea = useCallback((area: PrintAreaPosition) => {
    setCurrentPreview(area)
    setShowPreview(true)
  }, [])

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Užsakymas sėkmingai pateiktas!</h3>
        <p className="text-green-700 mb-6">
          Dėkojame už jūsų užsakymą. Netrukus susisieksime elektroniniu paštu dėl tolesnių detalių.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => {
              setIsSuccess(false);
              window.location.href = "/"; // Grįžti į pradinį puslapį
            }}
            variant="outline"
          >
            Grįžti į pradinį puslapį
          </Button>
          <Button
            onClick={() => {
              setIsSuccess(false);
              // Čia galite pridėti nuorodą į "Mano užsakymai" puslapį, jei toks yra
            }}
          >
            Kurti naują dizainą
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Preview Modal */}
      {showPreview && currentPreview && designPreviews[currentPreview] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h3 className="text-lg font-medium mb-4">
              {printAreaLabels[currentPreview]} - Peržiūra
            </h3>
            <img 
              src={designPreviews[currentPreview] || ''} 
              alt={`${printAreaLabels[currentPreview]} peržiūra`} 
              className="mb-4 max-h-96 mx-auto"
            />
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                Grįžti
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Asmeninė informacija</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Vardas <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              {...register('name')}
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              disabled={isSubmitting || disabled}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              El. paštas <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              {...register('email')}
              type="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              disabled={isSubmitting || disabled}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefono numeris
          </label>
          <input
            id="phone"
            {...register('phone')}
            type="tel"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            disabled={isSubmitting || disabled}
            placeholder="+370"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Užsakymo informacija</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="size" className="block text-sm font-medium text-gray-700">
              Dydis <span className="text-red-500">*</span>
            </label>
            <select
              id="size"
              {...register('size')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              disabled={isSubmitting || disabled}
            >
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="3XL">3XL</option>
              <option value="4XL">4XL</option>
            </select>
            {errors.size && (
              <p className="mt-1 text-sm text-red-600">{errors.size.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Kiekis <span className="text-red-500">*</span>
            </label>
            <input
              id="quantity"
              {...register('quantity', { valueAsNumber: true })}
              type="number"
              min="1"
              max="1000"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              disabled={isSubmitting || disabled}
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spausdinimo vietos <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {printAreas.map((area) => (
              <div key={area} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`printArea-${area}`}
                  value={area}
                  disabled={!designPreviews[area] || isSubmitting || disabled}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  {...register('printAreas')}
                />
                <label htmlFor={`printArea-${area}`} className="text-sm text-gray-700">
                  {printAreaLabels[area]}
                </label>
                {designPreviews[area] && (
                  <button
                    type="button"
                    className="ml-auto text-xs text-indigo-600 hover:text-indigo-800"
                    onClick={() => showPreviewForArea(area)}
                  >
                    Peržiūrėti
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.printAreas && (
            <p className="mt-1 text-sm text-red-600">{errors.printAreas.message}</p>
          )}
          {selectedPrintAreas && selectedPrintAreas.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Pasirinktos spausdinimo vietos: {selectedPrintAreas.map(area => printAreaLabels[area as PrintAreaPosition]).join(', ')}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
            Papildomi komentarai
          </label>
          <textarea
            id="comments"
            {...register('comments')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="Jei turite papildomų pageidavimų ar klausimų, užrašykite juos čia"
            disabled={isSubmitting || disabled}
          />
          {errors.comments && (
            <p className="mt-1 text-sm text-red-600">{errors.comments.message}</p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Kaina</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Bazinė kaina ({quantity || 1}x):</span>
              <span>€{(productPrice * (quantity || 1)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Spausdinimas ({selectedPrintAreas?.length || 0} vietos):</span>
              <span>€{((selectedPrintAreas?.length || 0) * 5).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t">
              <span>Viso:</span>
              <span>€{totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            * Pateikus užklausą, mes peržiūrėsime jūsų dizainą ir atsiųsime galutinę kainą el. paštu.
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="submit"
          variant="default"
          className="flex-1"
          disabled={isSubmitting || disabled || !hasAnyDesign}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Siunčiama...
            </span>
          ) : (
            'Pateikti užklausą'
          )}
        </Button>
      </div>

      {disabled && (
        <div className="text-sm text-gray-500 italic">
          Pirma įkelkite paveikslėlį, kad galėtumėte pateikti užsakymą.
        </div>
      )}
      
      {!hasAnyDesign && !disabled && (
        <div className="text-sm text-red-500 italic">
          Pridėkite bent vieną dizainą, kad galėtumėte pateikti užklausą.
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex items-start">
          <div className="bg-blue-100 rounded-full p-1 mr-3 flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800">Patarimas</h4>
            <p className="text-sm text-blue-700 mt-1">
              <a href="/login" className="underline hover:text-blue-800">Prisijungę</a> galėsite 
              išsaugoti savo dizainus, peržiūrėti ankstesnius užsakymus ir greičiau atlikti pakartotinius užsakymus.
            </p>
          </div>
        </div>
      </div>
    </form>
  )
}