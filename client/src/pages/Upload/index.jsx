import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/layout/BottomNav';
import { useEditorStore } from '../../store/editorStore';
import './Upload.css';
import {
  PlayIcon,
  ImageIcon,
} from "../../components/common/Icon";
const PREVIEW_COUNT = 6;

// Mock existing uploads — jab backend aayega, isse fetch() response se
// replace karna hoga, baaki neeche ka sab code (slice/view-more/preview) wahi rahega.
const INITIAL_ITEMS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  type: i % 2 === 0 ? 'image' : 'video',
  url: null,
  duration: i % 2 === 0 ? null : '00:20',
}));

export default function Upload() {
  const navigate = useNavigate();
  const resetElements = useEditorStore((s) => s.resetElements);
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [visibleCount, setVisibleCount] = useState(PREVIEW_COUNT);
  const [pickerOpen, setPickerOpen] = useState(false);

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleFileChosen = (type) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setItems((prev) => [{ id: Date.now(), type, url, duration: null }, ...prev]);
    setPickerOpen(false);
    e.target.value = ''; // same file dobara select ho sake
    resetElements(); // Reset editor elements when a new file is chosen
    navigate('/live-preview', { state: { media: url, type } });
  };

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return (
    <div className="upload">
      <div className="upload__header">
        <button className="upload__back" onClick={() => navigate(-1)} aria-label="Back">←</button>
        <h1 className="upload__title">My Content</h1>
        <button className="upload__menu" aria-label="More">⋮</button>
      </div>

      <button className="upload__dropzone" onClick={() => setPickerOpen((v) => !v)}>
        <div className="upload__dropzone-icon">⬆</div>
        <p className="upload__dropzone-title">Upload Your Content</p>
        <p className="upload__dropzone-sub">Image, Video, Poster or Reel</p>
        <span className="upload__dropzone-btn">Upload Now</span>
      </button>

      {pickerOpen && (
        <div className="upload__picker">
          <button
            className="upload__picker-btn"
            onClick={() => imageInputRef.current?.click()}
          >
            <ImageIcon className="upload__picker-icon" />
            <span>Image</span>
          </button>

          <button
            className="upload__picker-btn"
            onClick={() => videoInputRef.current?.click()}
          >
            <PlayIcon className="upload__picker-icon" />
            <span>Video</span>
          </button>
        </div>
      )}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="upload__hidden-input"
        onChange={handleFileChosen('image')}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="upload__hidden-input"
        onChange={handleFileChosen('video')}
      />

      <div className="upload__section-head">
        <h3>Recent Uploads</h3>
      </div>

      <div className="upload__recent">
        {visibleItems.map((item) => (
          <div key={item.id} className="upload__recent-item">
            {item.url && item.type === 'video' && (
              <video src={item.url} className="upload__recent-media" muted />
            )}
            {item.url && item.type === 'image' && (
              <img src={item.url} alt="" className="upload__recent-media" />
            )}
            {item.duration && <span className="upload__recent-duration">{item.duration}</span>}
          </div>
        ))}
      </div>

      {hasMore && (
        <button className="upload__view-more" onClick={() => setVisibleCount((c) => c + PREVIEW_COUNT)}>
          View More
        </button>
      )}

      <BottomNav />
    </div>
  );
}