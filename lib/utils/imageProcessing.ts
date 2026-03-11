// Helper functions for image processing

export function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function resizeImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create canvas and resize
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob"));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          0.85,
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
    } catch (error) {
      reject(error);
    }
  });
}

export function applyImageFilter(
  canvas: HTMLCanvasElement,
  filter: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    sepia?: number;
    grayscale?: number;
  },
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Apply brightness
    if (filter.brightness) {
      data[i] *= filter.brightness; // R
      data[i + 1] *= filter.brightness; // G
      data[i + 2] *= filter.brightness; // B
    }

    // Apply contrast
    if (filter.contrast) {
      const factor =
        (259 * (filter.contrast + 255)) / (255 * (259 - filter.contrast));
      data[i] = factor * (data[i] - 128) + 128;
      data[i + 1] = factor * (data[i + 1] - 128) + 128;
      data[i + 2] = factor * (data[i + 2] - 128) + 128;
    }

    // Apply saturation
    if (filter.saturation) {
      const gray = 0.2989 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray * (1 - filter.saturation) + data[i] * filter.saturation;
      data[i + 1] =
        gray * (1 - filter.saturation) + data[i + 1] * filter.saturation;
      data[i + 2] =
        gray * (1 - filter.saturation) + data[i + 2] * filter.saturation;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
