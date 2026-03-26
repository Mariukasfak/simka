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

// ⚡ Bolt Performance Optimization:
// Optimized applyImageFilter using a 1D Look-Up Table (LUT) for brightness and contrast.
// This eliminates millions of redundant math operations per image by pre-calculating the 256 possible pixel values.
// Saturation logic is also hoisted outside the loop to avoid checking `if (filter.saturation)` on every iteration.
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

  const hasBrightness = filter.brightness !== undefined && filter.brightness !== 1
  const hasContrast = filter.contrast !== undefined && filter.contrast !== 0
  const hasSaturation = filter.saturation !== undefined && filter.saturation !== 1

  if (!hasBrightness && !hasContrast && !hasSaturation) return

  // Pre-calculate Look-Up Table (LUT) for brightness and contrast
  const lut = new Uint8ClampedArray(256)

  let contrastFactor = 1
  if (hasContrast) {
    contrastFactor = (259 * (filter.contrast! + 255)) / (255 * (259 - filter.contrast!))
  }

  for (let i = 0; i < 256; i++) {
    let val = i

    if (hasBrightness) {
      val *= filter.brightness!
      // In original code, the value was written to Uint8ClampedArray here,
      // implicitly clamping it before applying contrast.
      val = Math.max(0, Math.min(255, val))
    }

    if (hasContrast) {
      val = contrastFactor * (val - 128) + 128
    }

    lut[i] = val
  }

  const sat = filter.saturation ?? 1
  const invSat = 1 - sat

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i]
    let g = data[i + 1]
    let b = data[i + 2]

    // Apply LUT for brightness and contrast
    if (hasBrightness || hasContrast) {
      r = lut[r]
      g = lut[g]
      b = lut[b]
    }

    // Apply saturation
    if (hasSaturation) {
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b
      r = gray * invSat + r * sat
      g = gray * invSat + g * sat
      b = gray * invSat + b * sat
    }

    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
  }

  ctx.putImageData(imageData, 0, 0)
}