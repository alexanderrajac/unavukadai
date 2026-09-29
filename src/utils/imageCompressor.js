/**
 * Client-Side Image Resizer & Compressor
 * Scales down large camera/phone photos to max 800px width/height and ~50-80KB JPEG.
 * Prevents browser localStorage quota overflow (QuotaExceededError).
 */
export async function compressImageFile(file, maxWidth = 800, maxHeight = 800, quality = 0.75) {
  if (!file) return null;

  return new Promise((resolve) => {
    // If not an image or running in non-browser environment, fallback
    if (!file.type || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result || null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result);
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight JPEG data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        resolve(readerEvent.target?.result);
      };

      img.src = readerEvent.target?.result;
    };

    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
