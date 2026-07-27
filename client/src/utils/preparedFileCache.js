const cache = new Map();

// MIME types that navigator.canShare() accepts for file sharing.
// Cloudinary sometimes serves assets as application/octet-stream which canShare()
// silently rejects — we derive the correct type from the URL extension instead.
const SHAREABLE_MIME = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp',
  mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm',
};

function resolveType(blobType, url) {
  // Use blob.type only when it's a real, canShare-friendly type
  if (blobType && blobType !== 'application/octet-stream' && blobType !== 'binary/octet-stream') {
    return blobType;
  }
  // Derive from the URL path (strip query string first)
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
  return SHAREABLE_MIME[ext] || 'image/jpeg'; // fallback: treat as JPEG
}

export function prepareFile(url) {
  if (!url) return Promise.resolve(null);
  if (cache.has(url)) return cache.get(url);

  const promise = fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const mimeType = resolveType(blob.type, url);
      const isVideo = mimeType.startsWith('video');
      // Cloudinary URLs often have no meaningful filename in the path — build one
      const rawName = url.split('?')[0].split('/').pop() || '';
      const ext = rawName.split('.').pop()?.toLowerCase();
      const fileName = SHAREABLE_MIME[ext]
        ? rawName                                     // has a proper extension
        : (isVideo ? 'video.mp4' : 'image.jpg');     // no extension in URL
      return new File([blob], fileName, { type: mimeType });
    })
    .catch((err) => {
      cache.delete(url); // don't lock in failure, let next click retry
      throw err;
    });

  cache.set(url, promise);
  return promise;
}