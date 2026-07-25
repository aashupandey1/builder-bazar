import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
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
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    video.currentTime = ratio * duration;
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
        onClick={togglePlay}
      />

      <button className="preview__play-btn" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? <Pause size={22} /> : <Play size={22} />}
      </button>

      <div className="preview__scrub">
        <span>{formatTime(current)}</span>
        <div className="preview__scrub-bar" onClick={seek}>
          <div className="preview__scrub-fill" style={{ width: `${progress}%` }} />
        </div>
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
          >
            ←
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
          ←
        </button>

        <h1 className="preview__title">
          {state.title}
        </h1>

        <button
          className="preview__icon-btn"
          aria-label="Download"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download size={20} />
        </button>

        <button
          className={`preview__icon-btn ${favBounce ? 'preview__icon-btn--bounce' : ''}`}
          aria-label="Favorite"
          onClick={toggleFavorite}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
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