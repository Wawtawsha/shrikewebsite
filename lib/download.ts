/**
 * Downloads a photo resized to web-size (1024px wide) as JPEG.
 * Uses OffscreenCanvas for efficient client-side resizing.
 */
export async function downloadWebSize(photoUrl: string, filename: string): Promise<void> {
  try {
    const response = await fetch(photoUrl);
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    const targetWidth = 1024;
    const scale = targetWidth / bitmap.width;
    const targetHeight = Math.round(bitmap.height * scale);

    // If image is already smaller than 1024px, use original dimensions
    const width = bitmap.width <= targetWidth ? bitmap.width : targetWidth;
    const height = bitmap.width <= targetWidth ? bitmap.height : targetHeight;

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const jpegBlob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.85 });
    const url = URL.createObjectURL(jpegBlob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename.replace(/\.\w+$/, ".jpg");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    window.open(photoUrl, "_blank");
  }
}

/**
 * Downloads a photo at full resolution as JPEG.
 */
export async function downloadFullRes(photoUrl: string, filename: string): Promise<void> {
  try {
    const response = await fetch(photoUrl);
    const raw = await response.blob();

    // Convert to JPEG if not already
    let blob = raw;
    if (raw.type !== "image/jpeg") {
      const bitmap = await createImageBitmap(raw);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.92 });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.replace(/\.\w+$/, ".jpg");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    window.open(photoUrl, "_blank");
  }
}
