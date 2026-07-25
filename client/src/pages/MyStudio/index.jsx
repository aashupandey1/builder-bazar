import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import Skeleton from '../../components/common/Skeleton/Skeleton';
import './MyStudio.css';

const TABS = ['Recent', 'Favorites', 'Drafts'];
const PREVIEW_COUNT = 10;

function formatDate(iso) {
  const d = new Date(iso);
  return `Edited on ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

function projectToItem(p) {
  return {
    id: p.id,
    title: p.title || 'Untitled',
    meta: p.template_id ? 'From template' : 'Scratch',
    date: formatDate(p.updated_at),
    thumb: p.thumbnail_url,
  };
}

function templateToItem(t) {
  return {
    id: t.id,
    title: t.title || 'Untitled',
    meta: t.type,
    date: null,
    thumb: t.thumbnail_url || t.file_url,
  };
}

// ponytail: Drafts needs its own table+endpoint (not built yet) — empty for now.
export default function MyStudio() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Recent');
  const [visibleCount, setVisibleCount] = useState(PREVIEW_COUNT);
  const [projects, setProjects] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axiosClient.get(ENDPOINTS.PROJECTS).then((res) => setProjects(res.data.data)).catch(() => setProjects([])),
      axiosClient.get(ENDPOINTS.FAVORITES).then((res) => setFavorites(res.data.data)).catch(() => { }),
    ]).finally(() => setLoading(false));
  }, []);

  const itemsForTab =
    activeTab === 'Recent' ? projects.map(projectToItem)
      : activeTab === 'Favorites' ? favorites.map(templateToItem)
        : [];
  const visibleItems = itemsForTab.slice(0, visibleCount);
  const hasMore = visibleCount < itemsForTab.length;

  const handleTabClick = (t) => {
    setActiveTab(t);
    setVisibleCount(PREVIEW_COUNT);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this project?')) return;
    axiosClient.delete(`${ENDPOINTS.PROJECTS}/${id}`)
      .then(() => setProjects((prev) => prev.filter((p) => p.id !== id)))
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
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mystudio__item" style={{ pointerEvents: 'none' }}>
              <Skeleton width="56px" height="56px" radius="8px" />
              <div style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width="55%" height="14px" radius="6px" />
                <Skeleton width="35%" height="11px" radius="6px" style={{ marginTop: 6 }} />
              </div>
            </div>
          ))
          : visibleItems.map((item) => (
            <div
              key={item.id}
              className="mystudio__item"
              onClick={() =>
                activeTab === 'Favorites'
                  ? navigate('/preview', { state: favorites.find((f) => f.id === item.id) })
                  : navigate('/live-preview', { state: { projectId: item.id } })
              }
            >
              <div className="mystudio__thumb">
                {item.thumb && <img src={item.thumb} alt="" className="mystudio__thumb-img" />}
              </div>
              <div className="mystudio__info">
                <p className="mystudio__title">{item.title}</p>
                <p className="mystudio__meta">{item.meta}</p>
                {item.date && <p className="mystudio__date">{item.date}</p>}
              </div>
              {activeTab === 'Recent' && (
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
              )}
            </div>
          ))
        }

        {!loading && itemsForTab.length === 0 && (
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