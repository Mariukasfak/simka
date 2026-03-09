// Helper functions for image processing

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export function resizeImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width
        let height = img.height
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
        
        // Create canvas and resize
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'))
              return
            }
            resolve(blob)
          },
          'image/jpeg',
          0.85
        )
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
    } catch (error) {
      reject(error)
    }
  })
}

export function applyImageFilter(
  canvas: HTMLCanvasElement,
  filter: {
    brightness?: number
    contrast?: number
    saturation?: number
    blur?: number
    sepia?: number
    grayscale?: number
  }
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // ⚡ Bolt Performance Optimization:
  // - Extract condition checks outside the loop
  // - Pre-calculate constant values
  // - Hoist properties from Uint8ClampedArray for performance
  // - Explicit clamping when writing to JS numbers as Uint8ClampedArray bounds checking is lost
  const hasBrightness = filter.brightness !== undefined
  const brightness = filter.brightness || 1

  const hasContrast = filter.contrast !== undefined
  const contrastFactor = hasContrast
    ? (259 * ((filter.contrast as number) + 255)) / (255 * (259 - (filter.contrast as number)))
    : 1

  const hasSaturation = filter.saturation !== undefined
  const saturation = filter.saturation || 1
  const invSaturation = 1 - saturation

  if (!hasBrightness && !hasContrast && !hasSaturation) return

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i]
    let g = data[i + 1]
    let b = data[i + 2]

    // Apply brightness
    if (hasBrightness) {
      r *= brightness
      g *= brightness
      b *= brightness
    }

    // Apply contrast
    if (hasContrast) {
      r = contrastFactor * (r - 128) + 128
      g = contrastFactor * (g - 128) + 128
      b = contrastFactor * (b - 128) + 128
    }

    // Apply saturation
    if (hasSaturation) {
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b
      const grayInv = gray * invSaturation
      r = grayInv + r * saturation
      g = grayInv + g * saturation
      b = grayInv + b * saturation
    }

    // Explicit clamp required for JS Number
    data[i] = Math.min(255, Math.max(0, r))
    data[i + 1] = Math.min(255, Math.max(0, g))
    data[i + 2] = Math.min(255, Math.max(0, b))
  }

  ctx.putImageData(imageData, 0, 0)
}