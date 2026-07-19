import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Clapperboard, Image as ImageIcon, BookImage, Rows3, Folder, Star } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import { ENDPOINTS } from '../../../api/endpoints';
import './AdminDashboard.css';

// ponytail: type -> icon map, no separate config file for 5 entries
const TYPE_ICON = { Video, Reel: Clapperboard, Poster: ImageIcon, Story: BookImage, Banner: Rows3 };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [templateStats, setTemplateStats] = useState(null);
  const [projectCount, setProjectCount] = useState(null);

  useEffect(() => {
    axiosClient.get(`${ENDPOINTS.TEMPLATES}/stats`)
      .then((res) => setTemplateStats(res.data.data))
      .catch(() => setTemplateStats({ total: 0, byType: [], featured: null }));
    axiosClient.get(ENDPOINTS.PROPERTIES)
      .then((res) => setProjectCount(res.data.data.length))
      .catch(() => setProjectCount(0));
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__cards">
        <button className="admin-dashboard__card" onClick={() => navigate('/admin/templates')}>
          <span className="admin-dashboard__card-value">{templateStats?.total ?? '—'}</span>
          <span className="admin-dashboard__card-label">Total Templates</span>
        </button>
        <button className="admin-dashboard__card" onClick={() => navigate('/admin/projects')}>
          <span className="admin-dashboard__card-value">{projectCount ?? '—'}</span>
          <span className="admin-dashboard__card-label">Total Projects</span>
        </button>
      </div>

      <h3 className="admin-dashboard__section-title">Templates by Type</h3>
      <div className="admin-dashboard__type-grid">
        {['Video', 'Reel', 'Poster', 'Story', 'Banner'].map((type) => {
          const Icon = TYPE_ICON[type];
          const count = templateStats?.byType.find((t) => t.type === type)?.count || 0;
          return (
            <div className="admin-dashboard__type-card" key={type}>
              <Icon size={18} />
              <span className="admin-dashboard__type-count">{count}</span>
              <span className="admin-dashboard__type-label">{type}</span>
            </div>
          );
        })}
      </div>

      {templateStats?.featured && (
        <>
          <h3 className="admin-dashboard__section-title">Featured Template</h3>
          <div className="admin-dashboard__featured">
            <Star size={16} />
            <span>{templateStats.featured.title}</span>
            <span className="admin-dashboard__featured-type">{templateStats.featured.type}</span>
          </div>
        </>
      )}
    </div>
  );
}