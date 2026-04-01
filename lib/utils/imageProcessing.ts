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

  // ⚡ Bolt Performance Optimization: Using a 1D Look-Up Table (LUT) to pre-calculate brightness and contrast across all 256 possible pixel values. Combined with hoisting saturation checks outside the main loop, this eliminates millions of redundant math operations per image.
  const lut = new Uint8ClampedArray(256)

  const hasBrightness = filter.brightness !== undefined && filter.brightness !== 1
  const hasContrast = filter.contrast !== undefined && filter.contrast !== 0

  let contrastFactor = 1;
  if (hasContrast) {
    contrastFactor = (259 * (filter.contrast! + 255)) / (255 * (259 - filter.contrast!))
  }

  for (let i = 0; i < 256; i++) {
    let val = i;

    // Apply brightness
    if (hasBrightness) {
      val = val * filter.brightness!;
    }

    // Explicitly clamp before contrast to avoid overflow logic errors
    val = Math.min(255, Math.max(0, val));

    // Apply contrast
    if (hasContrast) {
      val = contrastFactor * (val - 128) + 128;
    }

    // Final clamp for the LUT
    lut[i] = Math.min(255, Math.max(0, val));
  }

  const hasSaturation = filter.saturation !== undefined && filter.saturation !== 1;

  if (hasSaturation) {
    const saturation = filter.saturation!;
    const invSaturation = 1 - saturation;
    for (let i = 0; i < data.length; i += 4) {
      // First apply LUT for brightness/contrast
      const r = lut[data[i]];
      const g = lut[data[i + 1]];
      const b = lut[data[i + 2]];

      // Then apply saturation inline
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;

      data[i] = gray * invSaturation + r * saturation;
      data[i + 1] = gray * invSaturation + g * saturation;
      data[i + 2] = gray * invSaturation + b * saturation;
    }
  } else {
    // Fast path: Only brightness and contrast
    for (let i = 0; i < data.length; i += 4) {
      data[i] = lut[data[i]];
      data[i + 1] = lut[data[i + 1]];
      data[i + 2] = lut[data[i + 2]];
    }
  }

  ctx.putImageData(imageData, 0, 0)
}