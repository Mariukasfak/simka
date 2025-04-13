'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import type { PrintAreaPosition } from '@/lib/types'

// Validation schema
const orderFormSchema = z.object({
  name: z.string()
    .min(2, 'Vardas turi būti bent 2 simbolių ilgio')
    .max(50, 'Vardas negali būti ilgesnis nei 50 simbolių')
    .regex(/^[a-zA-ZĄąČčĘęĖėĮįŠšŲųŪūŽž\s]+$/, 'Vardas gali turėti tik raides ir tarpus'),
  email: z.string()
    .email('Neteisingas el. pašto formatas')
    .min(5, 'El. paštas turi būti bent 5 simbolių ilgio')
    .max(100, 'El. paštas negali būti ilgesnis nei 100 simbolių'),
  phone: z.string()
    .min(8, 'Telefono numeris turi būti bent 8 simbolių')
    .max(15, 'Telefono numeris negali būti ilgesnis nei 15 simbolių')
    .regex(/^[+]?[\d\s-()]+$/, 'Neteisingas telefono numerio formatas')
    .optional(),
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL'], {
    required_error: 'Pasirinkite dydį'
  }),
  quantity: z.number()
    .min(1, 'Minimalus kiekis yra 1')
    .max(1000, 'Maksimalus kiekis yra 1000')
    .int('Kiekis turi būti sveikasis skaičius'),
  printAreas: z.array(z.string()).min(1, 'Pasirinkite bent vieną spausdinimo vietą'),
  comments: z.string()
    .max(500, 'Komentaras negali būti ilgesnis nei 500 simbolių')
    .optional()
    .transform(val => val === '' ? undefined : val),
})

type OrderFormData = z.infer<typeof orderFormSchema>

// Print area labels in Lithuanian
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
  
  const defaultPrintAreas = printAreas.filter(area => designPreviews[area] !== null)
  
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
  
  const handleFormSubmit = async (data: OrderFormData) => {
    try {
      await onSubmit(data)
      reset()
    } catch (error) {
      console.error('Order submission error:', error)
    }
  }

  // Calculate total price
  const calculateTotalPrice = () => {
    const basePrice = productPrice * (quantity || 1)
    const printingPrice = (selectedPrintAreas?.length || 0) * 5 // €5 per print area
    return basePrice + printingPrice
  }

  // Check if at least one design is added
  const hasAnyDesign = Object.values(designPreviews).some(preview => preview !== null)

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
                    onClick={() => {
                      setCurrentPreview(area)
                      setShowPreview(true)
                    }}
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
              <span>€{calculateTotalPrice().toFixed(2)}</span>
            </div>
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
          {isSubmitting ? 'Siunčiama...' : 'Pateikti užklausą'}
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
    </form>
  )
}