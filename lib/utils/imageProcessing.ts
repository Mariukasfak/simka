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

  // ⚡ Bolt Performance Optimization: Using 1D Look-Up Table (LUT) for brightness and contrast
  // and hoisting saturation checks to eliminate redundant math operations per pixel.
  const hasBrightness = filter.brightness !== undefined && filter.brightness !== 1;
  const hasContrast = filter.contrast !== undefined && filter.contrast !== 0;
  const hasSaturation = filter.saturation !== undefined && filter.saturation !== 1;

  if (!hasBrightness && !hasContrast && !hasSaturation) return;

  let lut: Uint8Array | null = null;

  if (hasBrightness || hasContrast) {
    lut = new Uint8Array(256);
    let factor = 1;
    if (hasContrast) {
      factor = (259 * (filter.contrast! + 255)) / (255 * (259 - filter.contrast!));
    }

    for (let i = 0; i < 256; i++) {
      let val = i;
      if (hasBrightness) {
        val *= filter.brightness!;
        val = Math.min(255, Math.max(0, val));
      }
      if (hasContrast) {
        val = factor * (val - 128) + 128;
        val = Math.min(255, Math.max(0, val));
      }
      lut[i] = val;
    }
  }

  for (let i = 0; i < data.length; i += 4) {
    if (lut) {
      data[i] = lut[data[i]];
      data[i + 1] = lut[data[i + 1]];
      data[i + 2] = lut[data[i + 2]];
    }

    if (hasSaturation) {
      const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
      data[i] = gray * (1 - filter.saturation!) + data[i] * filter.saturation!;
      data[i + 1] = gray * (1 - filter.saturation!) + data[i + 1] * filter.saturation!;
      data[i + 2] = gray * (1 - filter.saturation!) + data[i + 2] * filter.saturation!;
    }
  }

  ctx.putImageData(imageData, 0, 0)
}