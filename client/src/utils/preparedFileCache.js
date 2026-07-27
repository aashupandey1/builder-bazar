const cache = new Map();

export function prepareFile(url) {
  if (!url) return Promise.resolve(null);
  if (cache.has(url)) return cache.get(url);

  const promise = fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const isVideo = blob.type.startsWith('video') || /\.(mp4|mov)$/i.test(url);
      const fileName = url.split('/').pop() || (isVideo ? 'video.mp4' : 'image.jpg');
      return new File([blob], fileName, { type: blob.type || (isVideo ? 'video/mp4' : 'image/jpeg') });
    })
    .catch((err) => {
      cache.delete(url); // don't lock in failure, let next click retry
      throw err;
    });

  cache.set(url, promise);
  return promise;
}