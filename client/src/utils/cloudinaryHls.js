// Cloudinary video URL ko adaptive-streaming (.m3u8) URL me badalta hai.
// Non-cloudinary/plain URL ke liye null return karta hai (caller fallback karega).
export function toHlsUrl(url) {
  if (!url || !url.includes('/video/upload/')) return null;
  return url
    .replace('/video/upload/', '/video/upload/sp_auto/')
    .replace(/\.\w+(\?.*)?$/, '.m3u8$1');
}