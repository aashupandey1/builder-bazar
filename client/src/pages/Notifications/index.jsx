import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import Skeleton from '../../components/common/Skeleton/Skeleton';
import './Notifications.css';

// ponytail: simple relative time, no date lib for one field
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get(ENDPOINTS.NOTIFICATIONS)
      .then((res) => setItems(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await axiosClient.patch(`${ENDPOINTS.NOTIFICATIONS}/${id}/read`);
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await axiosClient.patch(`${ENDPOINTS.NOTIFICATIONS}/read-all`);
  };

  return (
    <div className="notifications">
      <div className="notifications__header">
        <button className="notifications__back" onClick={() => navigate(-1)} aria-label="Back">←</button>
        <h1 className="notifications__title">Notifications</h1>
        <button className="notifications__markall" onClick={markAllRead}>Mark all as read</button>
      </div>

      <div className="notifications__list">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="notifications__item" style={{ pointerEvents: 'none' }}>
                <Skeleton width="36px" height="36px" radius="50%" />
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <Skeleton width="55%" height="13px" radius="6px" />
                  <Skeleton width="75%" height="11px" radius="6px" style={{ marginTop: 5 }} />
                </div>
              </div>
            ))
          : items.map((n) => (
              <div key={n.id} className="notifications__item" onClick={() => !n.is_read && markRead(n.id)}>
                <span className="notifications__icon" />
                <div className="notifications__info">
                  <p className="notifications__item-title">{n.title}</p>
                  <p className="notifications__item-sub">{n.message}</p>
                </div>
                <div className="notifications__meta">
                  <span className="notifications__time">{timeAgo(n.created_at)}</span>
                  {!n.is_read && <span className="notifications__dot" />}
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}