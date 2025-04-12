import { useRef, useEffect, useState } from 'react'
import html2canvas from 'html2canvas'
import Image from 'next/image'

interface DesignCanvasProps {
  productImage: string
  uploadedImage: string | null
  scale: number
  opacity: number
  onPreviewGenerated: (preview: string | null) => void
}

export default function DesignCanvas({
  productImage,
  uploadedImage,
  scale,
  opacity,
  onPreviewGenerated
}: DesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [productImageLoaded, setProductImageLoaded] = useState(false)
  const [uploadedImageLoaded, setUploadedImageLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track product image loading
  const handleProductImageLoad = () => {
    setProductImageLoaded(true)
    setError(null)
  }

  const handleProductImageError = () => {
    setError('Failed to load product image')
    setProductImageLoaded(false)
  }

  // Track uploaded image loading
  const handleUploadedImageLoad = () => {
    setUploadedImageLoaded(true)
    setError(null)
  }

  const handleUploadedImageError = () => {
    setError('Failed to load uploaded image')
    setUploadedImageLoaded(false)
  }

  // Generate preview when design changes
  useEffect(() => {
    const generatePreview = async () => {
      if (!canvasRef.current || !uploadedImage || !productImageLoaded || (uploadedImage && !uploadedImageLoaded)) {
        onPreviewGenerated(null)
        return
      }

      try {
        const canvas = await html2canvas(canvasRef.current, {
          backgroundColor: null,
          scale: 2,
          logging: false,
          imageTimeout: 15000,
          useCORS: true,
          allowTaint: true,
          foreignObjectRendering: true
        })
        
        const preview = canvas.toDataURL('image/png')
        onPreviewGenerated(preview)
      } catch (error) {
        console.error('Error generating preview:', error)
        onPreviewGenerated(null)
      }
    }

    generatePreview()
  }, [productImage, uploadedImage, scale, opacity, onPreviewGenerated, productImageLoaded, uploadedImageLoaded])

  return (
    <div className="space-y-4">
      <div 
        ref={canvasRef} 
        className="relative w-full aspect-square bg-white rounded-lg shadow-md overflow-hidden"
      >
        {/* Loading state */}
        {(!productImageLoaded || (uploadedImage && !uploadedImageLoaded)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <div className="text-red-500 text-center p-4">
              <p className="font-medium">Error loading image</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Product image */}
        <Image
          src={productImage}
          alt="Produkto vaizdas"
          className="w-full h-full object-contain"
          width={500}
          height={500}
          priority
          onLoad={handleProductImageLoad}
          onError={handleProductImageError}
        />
        
        {/* Print area indicator */}
        <div 
          className={`absolute border-2 rounded transition-colors ${
            uploadedImage ? 'border-blue-400 border-dashed' : 'border-transparent'
          }`}
          style={{
            top: '25%',
            left: '25%',
            width: '50%',
            height: '40%',
            pointerEvents: 'none',
          }}
        />
        
        {/* Uploaded design image */}
        {uploadedImage && (
          <div
            className="absolute touch-none"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity: opacity,
              transition: 'transform 0.1s, opacity 0.1s'
            }}
          >
            <Image
              src={uploadedImage}
              alt="Įkeltas dizainas"
              className="max-w-[200px] max-h-[200px] pointer-events-none select-none"
              width={200}
              height={200}
              draggable={false}
              onLoad={handleUploadedImageLoad}
              onError={handleUploadedImageError}
            />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-500 text-center">
        <p>Naudokite pelę arba rodyklių klavišus, kad perkeltumėte dizainą</p>
        <p>Spustelėkite R, kad atstatytumėte poziciją</p>
      </div>
    </div>
  )
}