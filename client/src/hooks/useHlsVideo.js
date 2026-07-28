import { useEffect } from 'react';
import { toHlsUrl } from '../utils/cloudinaryHls';

export function useHlsVideo(videoRef, src) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    const hlsUrl = toHlsUrl(src);
    let hls;

    if (!hlsUrl) {
      video.src = src; // cloudinary video nahi hai — plain mp4
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl; // Safari/iOS — native HLS support
    } else {
      import('hls.js').then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          hls = new Hls({ maxBufferLength: 30 });
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) video.src = src; }); // fallback
        } else {
          video.src = src; // HLS unsupported browser — plain mp4
        }
      });
    }
    return () => hls?.destroy();
  }, [videoRef, src]);
}