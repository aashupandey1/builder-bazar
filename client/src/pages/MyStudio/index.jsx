import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import './MyStudio.css';

const TABS = ['Recent', 'Favorites', 'Drafts',];
const PREVIEW_COUNT = 10;

function formatDate(iso) {
  const d = new Date(iso);
  return `Edited on ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

// Favorites/Drafts/Downloads need their own tables+endpoints (not built yet) — empty for now.
// ponytail: real for Recent only, rest wired when those endpoints exist.
// Drafts/Downloads need their own tables+endpoints (not built yet) — empty for now.
// ponytail: real for Recent + Favorites, rest wired when those endpoints exist.
function toItem(p) {
  return {
    id: p.id,
    title: p.title || 'Untitled',
    meta: p.template_id ? 'From template' : 'Scratch',
    date: formatDate(p.updated_at),
  };
}

export default function MyStudio() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Recent');
  const [visibleCount, setVisibleCount] = useState(PREVIEW_COUNT);
  const [projects, setProjects] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    axiosClient.get(ENDPOINTS.PROJECTS)
      .then((res) => setProjects(res.data.data))
      .catch(() => setProjects([]));
    axiosClient.get(ENDPOINTS.FAVORITES)
      .then((res) => {
        setFavorites(res.data.data);
        setFavoriteIds(new Set(res.data.data.map((p) => p.id)));
      })
      .catch(() => { });
  }, []);

  const handleToggleFavorite = (e, id) => {
    e.stopPropagation();
    const isFav = favoriteIds.has(id);
    const req = isFav
      ? axiosClient.delete(`${ENDPOINTS.FAVORITES}/${id}`)
      : axiosClient.post(`${ENDPOINTS.FAVORITES}/${id}`);
    req.then(() => {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        isFav ? next.delete(id) : next.add(id);
        return next;
      });
      if (isFav) setFavorites((prev) => prev.filter((p) => p.id !== id));
    }).catch(() => { });
  };

  const itemsForTab =
    activeTab === 'Recent' ? projects.map(toItem)
      : activeTab === 'Favorites' ? favorites.map(toItem)
        : [];
  const visibleItems = itemsForTab.slice(0, visibleCount);
  const hasMore = visibleCount < itemsForTab.length;

  const handleTabClick = (t) => {
    setActiveTab(t);
    setVisibleCount(PREVIEW_COUNT); // naya tab khulte hi wapas preview mode me
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this project?')) return;
    axiosClient.delete(`${ENDPOINTS.PROJECTS}/${id}`)
      .then(() => {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setFavorites((prev) => prev.filter((p) => p.id !== id));
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      })
      .catch(() => { });
  };

  return (
    <div className="mystudio">
      <Header title="My Studio" />

      <div className="mystudio__tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`mystudio__tab ${activeTab === t ? 'mystudio__tab--active' : ''}`}
            onClick={() => handleTabClick(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mystudio__list">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="mystudio__item"
            onClick={() => navigate('/live-preview', { state: { projectId: item.id } })}
          >
            <div className="mystudio__thumb" />
            <div className="mystudio__info">
              <p className="mystudio__title">{item.title}</p>
              <p className="mystudio__meta">{item.meta}</p>
              <p className="mystudio__date">{item.date}</p>
            </div>
            <button
              className="mystudio__menu"
              aria-label="Favorite"
              onClick={(e) => handleToggleFavorite(e, item.id)}
            >
              {favoriteIds.has(item.id) ? '♥' : '♡'}
            </button>
            <button
              className="mystudio__menu"
              aria-label="Delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.id);
              }}
            >
              ⋮
            </button>
          </div>
        ))}

        {itemsForTab.length === 0 && (
          <p className="mystudio__empty">No items found in this tab.</p>
        )}
      </div>

      {hasMore && (
        <button className="mystudio__view-more" onClick={() => setVisibleCount((c) => c + PREVIEW_COUNT)}>
          View More
        </button>
      )}

      <BottomNav />
    </div>
  );
}