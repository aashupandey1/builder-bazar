import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Heart, ArrowLeft } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { prepareFile } from '../../utils/preparedFileCache';
import './Preview.css';


const isVideoTag = (tag) => tag === 'Video' || tag === 'Reel';
const formatTime = (secs) => {
  if (!isFinite(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => setCurrent(video.currentTime);
    const onMeta = () => setDuration(video.duration);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('loadedmetadata', onMeta);
    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('loadedmetadata', onMeta);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const seek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const v = Number(e.target.value);
    video.currentTime = v;
    setCurrent(v);
  };

  const tapTimerRef = useRef(null);
  const lastTapRef = useRef(0);
  // Set to true by onTouchEnd so the subsequent synthetic click can be skipped.
  // pointerType is only on PointerEvent, not on plain click/MouseEvent, so we
  // cannot rely on it — a ref flag is the safest cross-browser approach.
  const touchHandledRef = useRef(false);
  const [seekFlash, setSeekFlash] = useState(null); // 'left' | 'right' | null

  /**
   * WHY onTouchEnd instead of onClick:
   * On mobile, onClick fires ~300 ms after touchend because the browser waits
   * to see if a double-tap-zoom is coming. Even with touch-action:manipulation
   * in the CSS (which removes the zoom gesture), React's synthetic onClick still
   * arrives late enough that the 300 ms inter-tap window is unreliable.
   * Using onTouchEnd gives us the raw touch timing — taps are typically
   * 80–150 ms apart, so a 300 ms window is plenty without any browser delay.
   *
   * onClick is kept as a desktop (mouse/pointer) fallback only.
   */
  const handleTap = (clientX, currentTarget) => {
    const video = videoRef.current;
    if (!video) return;
    const now = Date.now();
    const rect = currentTarget.getBoundingClientRect();
    const isRight = (clientX - rect.left) > rect.width / 2;
    if (now - lastTapRef.current < 300) {
      // Double-tap detected — seek ±5 s
      clearTimeout(tapTimerRef.current);
      const dur = video.duration || 0;
      video.currentTime = Math.min(dur, Math.max(0, video.currentTime + (isRight ? 5 : -5)));
      lastTapRef.current = 0;
      setSeekFlash(isRight ? 'right' : 'left');
      setTimeout(() => setSeekFlash(null), 400);
    } else {
      // First tap — wait to see if a second tap arrives before toggling play
      lastTapRef.current = now;
      tapTimerRef.current = setTimeout(togglePlay, 300);
    }
  };

  const handleVideoTouchEnd = (e) => {
    e.preventDefault(); // prevent the subsequent synthetic click from firing
    const touch = e.changedTouches[0];
    handleTap(touch.clientX, e.currentTarget);
    touchHandledRef.current = true; // tell the click handler to skip this event
  };

  // Desktop mouse fallback — skipped when the touch handler already ran.
  // We use a ref flag rather than pointerType because pointerType only exists
  // on PointerEvent, not on plain click/MouseEvent.
  const handleVideoClick = (e) => {
    if (touchHandledRef.current) { touchHandledRef.current = false; return; }
    handleTap(e.clientX, e.currentTarget);
  };

  // Route play-button clicks through the same tap logic so that double-tapping
  // the center of the video (where the button sits at z-index 3) participates
  // in seek detection instead of bypassing it. We pass the video element's rect
  // so left/right side detection is relative to the full video area.
  const handlePlayBtnClick = (e) => {
    const video = videoRef.current;
    if (!video) return;
    handleTap(e.clientX, video);
  };

  const progress = duration ? (current / duration) * 100 : 0;

  return (
    <>
      <video
        ref={videoRef}
        className="preview__video"
        src={src}
        autoPlay
        loop
        muted={muted}
        playsInline
        onTouchEnd={handleVideoTouchEnd}
        onClick={handleVideoClick}
      />

      {seekFlash && (
        <div className={`preview__seek-flash preview__seek-flash--${seekFlash}`}>
          {seekFlash === 'right' ? '+5s' : '-5s'}
        </div>
      )}

      <button className="preview__play-btn" onClick={handlePlayBtnClick} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? <Pause size={22} /> : <Play size={22} />}
      </button>

      <div className="preview__scrub">
        <span>{formatTime(current)}</span>
        <input
          type="range"
          className="preview__scrub-range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={current}
          onChange={seek}
        />
        <span>{formatTime(duration)}</span>
        <button className="preview__mute-btn" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </>
  );
}
export default function Preview() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favBounce, setFavBounce] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!state?.id) return;
    axiosClient.get(ENDPOINTS.FAVORITES)
      .then((res) => setIsFavorite(res.data.data.some((t) => t.id === state.id)))
      .catch(() => { });
  }, [state?.id]);

  useEffect(() => {
    if (state?.file_url) prepareFile(state.file_url);
  }, [state?.file_url]);

  const toggleFavorite = () => {
    if (!state?.id) return;
    const next = !isFavorite;
    setIsFavorite(next);
    setFavBounce(true);
    setTimeout(() => setFavBounce(false), 300);
    const req = next
      ? axiosClient.post(`${ENDPOINTS.FAVORITES}/${state.id}`)
      : axiosClient.delete(`${ENDPOINTS.FAVORITES}/${state.id}`);
    req.catch(() => setIsFavorite(!next));
  };

  const getExtension = (url) => {
    const clean = url.split('?')[0].split('#')[0];
    const ext = clean.split('.').pop();
    return ext && ext.length <= 5 ? ext : 'jpg';
  };

  const handleDownload = () => {
    if (!state?.file_url || downloading) return;
    setDownloading(true);
    fetch(state.file_url)
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${state.title || 'download'}.${getExtension(state.file_url)}`;
        a.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => alert('Download failed, try again.'))
      .finally(() => setDownloading(false));
  };
  if (!state) {
    return (
      <div className="preview">
        <div className="preview__header">
          <button
            className="preview__icon-btn"
            onClick={() => navigate(-1)}
            aria-label="Back"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>

          <h1 className="preview__title">Content Preview</h1>
        </div>

        <div
          style={{
            padding: "40px",
            textAlign: "center",
          }}
        >
          No content selected.
        </div>
      </div>
    );
  }

  return (
    <div className="preview">
      <div className="preview__header">
        <button
          className="preview__icon-btn"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>

        <h1 className="preview__title">
          {state.title}
        </h1>

        <div className="preview__header-actions">
          <button
            className="preview__icon-btn"
            aria-label="Download"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download size={20} />
          </button>

          <button
            className={`preview__icon-btn ${isFavorite ? 'preview__icon-btn--active' : ''} ${favBounce ? 'preview__icon-btn--bounce' : ''}`}
            aria-label="Favorite"
            onClick={toggleFavorite}
          >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="preview__media">

        <span className="preview__badge">
          {state.type}
        </span>

        {isVideoTag(state.type) ? (
          <VideoPlayer src={state.file_url} />
        ) : (
          <img className="preview__image" src={state.file_url} alt={state.title} />
        )}

      </div>

      <div className="preview__actions">
        <button className="preview__btn preview__btn--outline preview__btn--disabled" disabled title="Coming soon">
          Customize
        </button>

        <button
          className="preview__btn preview__btn--primary"
          onClick={() => navigate('/share', { state })}
        >
          Share Now
        </button>
      </div>
    </div>
  );
}