import { useState, useEffect, useRef } from 'react'
import { DesignPosition } from '@/lib/types'

interface OptimizedDraggableImageProps {
  imageUrl: string
  position: DesignPosition
  scale: number
  opacity: number
  onPositionChange: (position: DesignPosition) => void
  containerRef: React.RefObject<HTMLDivElement>
}

export default function OptimizedDraggableImage({
  imageUrl,
  position,
  scale,
  opacity,
  onPositionChange,
  containerRef
}: OptimizedDraggableImageProps) {
  const [bounds, setBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 })
  const [internalPosition, setInternalPosition] = useState(position)
  const [isDragging, setIsDragging] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const elementRef = useRef<HTMLDivElement>(null)
  const lastUpdateTime = useRef<number>(0)
  const positionRef = useRef(position)
  const pendingPosition = useRef<DesignPosition | null>(null)
  const throttleTime = 50 // ms - padidintas intervalas tarp atnaujinimų

  // Sinchronizuojame išorinę poziciją su vidine, tik kai nesitampo
  useEffect(() => {
    if (!isDragging) {
      setInternalPosition(position)
      positionRef.current = position
    }
  }, [position, isDragging])

  // Atnaujinti ribas, kai pasikeičia konteinerio arba paveikslėlio dydis
  useEffect(() => {
    const updateBounds = () => {
      if (containerRef.current && imageRef.current) {
        const container = containerRef.current.getBoundingClientRect()
        const image = imageRef.current.getBoundingClientRect()
        
        // Apskaičiuojame mastelį pagal dydį
        const scaledWidth = image.width * scale
        const scaledHeight = image.height * scale
        
        // Nustatome ribas, kad paveikslėlis išliktų konteinerio viduje
        setBounds({
          left: -scaledWidth / 2,
          top: -scaledHeight / 2,
          right: container.width - scaledWidth / 2,
          bottom: container.height - scaledHeight / 2
        })
      }
    }

    // Pradinė ribų apskaita
    updateBounds()

    // Atnaujinkite ribas keičiant lango dydį ar keičiant mastelį
    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [scale, containerRef])

  // Praneškite apie pozicijos pakeitimą tik su ribojimu
  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (pendingPosition.current && (pendingPosition.current.x !== positionRef.current.x || 
                                    pendingPosition.current.y !== positionRef.current.y)) {
        onPositionChange(pendingPosition.current)
        positionRef.current = { ...pendingPosition.current }
        lastUpdateTime.current = Date.now()
        pendingPosition.current = null
      }
    }, throttleTime)

    return () => clearInterval(updateInterval)
  }, [onPositionChange])

  // Pelės paspaudimo pradžia
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    
    // Paruošiame elementą vilkimui
    if (elementRef.current) {
      elementRef.current.style.transition = 'none'
      elementRef.current.style.cursor = 'grabbing'
    }
    
    // Pridedame įvykio klausytojus
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Pelės judesys
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    const movementX = e.movementX
    const movementY = e.movementY
    
    // Ignoruojame labai mažus judesius, kad sumažintume triukšmą
    if (Math.abs(movementX) < 1 && Math.abs(movementY) < 1) return
    
    // Apskaičiuojame naują poziciją
    const newX = Math.max(
      bounds.left,
      Math.min(bounds.right, internalPosition.x + movementX)
    )
    const newY = Math.max(
      bounds.top,
      Math.min(bounds.bottom, internalPosition.y + movementY)
    )
    
    // Atnaujiname vidinę poziciją iš karto (sklandumui)
    setInternalPosition({ x: newX, y: newY })
    
    // Atnaujiname laukiančią poziciją, kuri bus perduota kai ateis laikas
    pendingPosition.current = { x: newX, y: newY }
  }

  // Pelės atleidimas
  const handleMouseUp = () => {
    setIsDragging(false)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    
    // Atnaujiname CSS perėjimus
    if (elementRef.current) {
      elementRef.current.style.transition = 'transform 0.2s, opacity 0.2s'
      elementRef.current.style.cursor = 'grab'
    }
    
    // Forsuojame galutinį pozicijos atnaujinimą
    if (pendingPosition.current) {
      onPositionChange(pendingPosition.current)
      positionRef.current = { ...pendingPosition.current }
      pendingPosition.current = null
    }
  }

  // Liečiamojo ekrano pradžia
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length !== 1) return
    
    setIsDragging(true)
    
    // Paruošiame elementą vilkimui
    if (elementRef.current) {
      elementRef.current.style.transition = 'none'
    }
    
    // Pridedame įvykio klausytojus
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
  }

  // Liečiamojo ekrano judesys
  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    if (!isDragging || e.touches.length !== 1) return
    
    const touch = e.touches[0]
    const prevTouch = e.changedTouches[0]
    
    // Apskaičiuojame judesį
    const movementX = touch.clientX - prevTouch.clientX
    const movementY = touch.clientY - prevTouch.clientY
    
    // Ignoruojame labai mažus judesius
    if (Math.abs(movementX) < 1 && Math.abs(movementY) < 1) return
    
    // Apskaičiuojame naują poziciją su ribomis
    const newX = Math.max(
      bounds.left,
      Math.min(bounds.right, internalPosition.x + movementX)
    )
    const newY = Math.max(
      bounds.top,
      Math.min(bounds.bottom, internalPosition.y + movementY)
    )
    
    // Atnaujiname vidinę poziciją
    setInternalPosition({ x: newX, y: newY })
    
    // Atnaujiname laukiančią poziciją
    pendingPosition.current = { x: newX, y: newY }
  }

  // Liečiamojo ekrano pabaiga
  const handleTouchEnd = () => {
    setIsDragging(false)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
    
    // Atnaujiname CSS perėjimus
    if (elementRef.current) {
      elementRef.current.style.transition = 'transform 0.2s, opacity 0.2s'
    }
    
    // Forsuojame galutinį pozicijos atnaujinimą
    if (pendingPosition.current) {
      onPositionChange(pendingPosition.current)
      positionRef.current = { ...pendingPosition.current }
      pendingPosition.current = null
    }
  }

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-grab ${isDragging ? 'cursor-grabbing z-10' : ''}`}
      style={{
        transform: `translate(-50%, -50%) translate(${internalPosition.x}px, ${internalPosition.y}px) scale(${scale})`,
        opacity: opacity,
        transformOrigin: 'center',
        transition: isDragging ? 'none' : 'transform 0.2s, opacity 0.2s',
        willChange: 'transform' // Pagerina perbraižymo našumą
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Dizaino elementas"
        className="max-w-[200px] max-h-[200px] pointer-events-none select-none"
        draggable={false}
        onLoad={() => {
          // Pranešame apie paveikslėlio užkrovimą, kad atnaujintume ribas
          if (imageRef.current) {
            const event = new Event('resize')
            window.dispatchEvent(event)
          }
        }}
      />
    </div>
  )
}