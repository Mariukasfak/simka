import { Product } from '@/lib/types'

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
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <button
            key={product.id}
            onClick={() => onSelect(product)}
            className={`relative p-2 rounded-lg border-2 transition-all ${
              selectedProduct.id === product.id
                ? 'border-brand-primary bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="relative aspect-square bg-white rounded overflow-hidden">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-2 text-center text-sm font-medium">
              {product.name}
            </div>
            
            {selectedProduct.id === product.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
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
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}