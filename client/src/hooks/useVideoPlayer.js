// Generic custom-controls engine for a <video> element. Owns no media
// source of its own — it just wires play/pause/seek state to whatever
// <video ref={videoRef}> the caller renders. This is what lets the exact
// same play/pause/seek/progress logic drive the background video in both
// the Editor canvas and Live Preview, with each page free to render its own
// controls markup around it.
import { useCallback, useRef, useState } from 'react';

export function useVideoPlayer() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const onLoadedMetadata = useCallback((e) => setDuration(e.target.duration || 0), []);
  const onTimeUpdate = useCallback((e) => setCurrentTime(e.target.currentTime || 0), []);
  const onPlay = useCallback(() => setIsPlaying(true), []);
  const onPause = useCallback(() => setIsPlaying(false), []);
  const onEnded = useCallback(() => setIsPlaying(false), []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }, []);

  const seek = useCallback((time) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = time;
    setCurrentTime(time);
  }, []);

  // Call whenever the underlying source changes (background media
  // replaced/removed) so a stale duration/time from the previous file never
  // lingers in whatever controls UI is reading these values.
  const resetForNewSource = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    resetForNewSource,
    videoEvents: { onLoadedMetadata, onTimeUpdate, onPlay, onPause, onEnded },
  };
}
