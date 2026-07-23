import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import Skeleton from '../../components/common/Skeleton/Skeleton';
import './Gallery.css';

const TABS = ['All', 'Videos', 'Reels', 'Posters', 'Stories', 'Banners'];
const isVideoTag = (tag) => tag === 'Video' || tag === 'Reel';

export default function Gallery() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = location.state?.projectId ? { project_id: location.state.projectId } : {};
    axiosClient.get(ENDPOINTS.TEMPLATES, { params })
      .then((res) => setItems(res.data.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [location.state?.projectId]);

  const visible =
    activeTab === 'All' ? items : items.filter((i) => `${i.type}s` === activeTab || i.type === activeTab);

  const title = location.state?.name || location.state?.tab || 'Gallery';

  return (
    <div className="gallery">
      <div className="gallery__header">
        <button className="gallery__back" onClick={() => navigate(-1)} aria-label="Back">
          ←
        </button>
        <h1 className="gallery__title">{title}</h1>
        <button className="gallery__share" aria-label="Share">⤴</button>
      </div>

      {/* {!location.state?.tab && !location.state?.projectId && (
        <div className="gallery__hero" onClick={() => navigate('/preview')}>
          <div className="gallery__hero-image" />
          <button className="gallery__hero-play" aria-label="Play">▶</button>
        </div>
      )} */}

      <div className="gallery__tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`gallery__tab ${activeTab === t ? 'gallery__tab--active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="gallery__grid">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="gallery__grid-item" style={{ pointerEvents: 'none' }}>
                <Skeleton width="100%" height="160px" radius="10px" />
                <Skeleton width="70%" height="12px" radius="6px" style={{ marginTop: 8 }} />
                <Skeleton width="45%" height="10px" radius="6px" style={{ marginTop: 4 }} />
              </div>
            ))
          : visible.map((item) => (
              <button
                key={item.id}
                className="gallery__grid-item"
                onClick={() => {
                  axiosClient.post(`${ENDPOINTS.TEMPLATES}/${item.id}/view`).catch(() => {});
                  navigate('/preview', { state: item });
                }}
              >
                <span className="gallery__grid-tag">{item.type}</span>
                {isVideoTag(item.type) ? (
                  <video className="gallery__grid-media" src={item.file_url} muted loop playsInline />
                ) : (
                  <img className="gallery__grid-media" src={item.file_url} alt={item.title} />
                )}
              </button>
            ))
        }
      </div>
    </div>
  );
}