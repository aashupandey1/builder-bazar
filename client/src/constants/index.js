// App-wide constants: media type enums, filter presets, API base URL
export const MEDIA_TYPES = { IMAGE: 'image', VIDEO: 'video', POSTER: 'poster' };

// Shared accept configs for useMediaAsset() slots. MIME sniffing alone isn't
// reliable across browsers/OSes (e.g. .mov sometimes reports an empty
// type), so extension is checked as a fallback rather than a replacement.
// Any new media slot (e.g. a future "watermark" or "intro-clip") reuses
// these building blocks instead of redefining its own mime/ext lists.
export const IMAGE_ACCEPT = {
  mimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  exts: ['.jpg', '.jpeg', '.png', '.webp'],
};

export const VIDEO_ACCEPT = {
  mimes: ['video/mp4', 'video/quicktime', 'video/webm'],
  exts: ['.mp4', '.mov', '.webm'],
};

// Background canvas media: image OR video.
export const BACKGROUND_MEDIA_ACCEPT = { image: IMAGE_ACCEPT, video: VIDEO_ACCEPT };

// Logo: image only.
export const LOGO_MEDIA_ACCEPT = { image: IMAGE_ACCEPT };
