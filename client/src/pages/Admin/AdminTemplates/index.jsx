import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Pencil, Trash2, Search, MoreVertical, X } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import { ENDPOINTS } from '../../../api/endpoints';
import './AdminTemplates.css';

const TYPES = ['Video', 'Reel', 'Poster', 'Story', 'Banner'];
const TABS = ['All', ...TYPES];
const PLURAL = { Video: 'Videos', Reel: 'Reels', Poster: 'Posters', Story: 'Stories', Banner: 'Banners' };
const PAGE_SIZE = 10;

const isVideoTag = (tag) => tag === 'Video' || tag === 'Reel';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AdminTemplates() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get('project_id');
  const projectName = searchParams.get('project_name');
  const [templates, setTemplates] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [tabCounts, setTabCounts] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadStats = () =>
    axiosClient.get(`${ENDPOINTS.TEMPLATES}/stats`).then((res) => setTabCounts(res.data.data)).catch(() => {});

  const loadPage = async (currentOffset, replace = false) => {
    const params = { limit: PAGE_SIZE, offset: currentOffset };
    if (activeTab !== 'All') params.type = activeTab;
    if (search) params.search = search;
    if (projectId) params.project_id = projectId;
    const res = await axiosClient.get(ENDPOINTS.TEMPLATES, { params });
    const rows = res.data.data;
    setTemplates((prev) => (replace ? rows : [...prev, ...rows]));
    setHasMore(rows.length === PAGE_SIZE);
    setTotal((prev) => (replace ? rows.length : prev + rows.length));
    setOffset(currentOffset + rows.length);
  };

  useEffect(() => { loadStats(); }, [projectId]);
  useEffect(() => { loadPage(0, true); }, [activeTab, search, projectId]);

  const clearProjectFilter = () => {
    searchParams.delete('project_id');
    searchParams.delete('project_name');
    setSearchParams(searchParams);
  };

  const refresh = () => { loadPage(0, true); loadStats(); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete karna hai?')) return;
    await axiosClient.delete(`${ENDPOINTS.TEMPLATES}/${id}`);
    refresh();
  };

  const saveEdit = async (id) => {
    await axiosClient.put(`${ENDPOINTS.TEMPLATES}/${id}`, { title: editTitle });
    setEditingId(null);
    refresh();
  };

  const tabCount = (tab) =>
    tab === 'All' ? (tabCounts?.total ?? 0) : (tabCounts?.byType.find((t) => t.type === tab)?.count ?? 0);

  return (
    <div className="admin-templates">
      {projectId && (
        <div className="admin-templates__project-filter">
          <span>Project: <strong>{projectName || projectId}</strong></span>
          <button onClick={clearProjectFilter} aria-label="Clear project filter">
            <X size={14} /> Clear
          </button>
        </div>
      )}

      <div className="admin-templates__searchbar">
        <Search size={16} color="#9aa4b2" />
        <input
          type="text" placeholder="Search templates..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <div className="admin-templates__tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`admin-templates__tab ${activeTab === t ? 'admin-templates__tab--active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t === 'All' ? 'All' : PLURAL[t]} ({tabCount(t)})
          </button>
        ))}
      </div>

      <div className="template-list">
        {templates.map((t) => (
          <div className="template-card" key={t.id}>
            <div className="template-card__thumb">
              {isVideoTag(t.type) ? (
                <>
                  <video src={t.file_url} muted playsInline />
                  <span className="template-card__play"><Play size={16} fill="#fff" /></span>
                </>
              ) : (
                <img src={t.file_url} alt={t.title} />
              )}
            </div>

            <div className="template-card__body">
              {editingId === t.id ? (
                <input
                  className="template-card__edit-input"
                  value={editTitle}
                  autoFocus
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              ) : (
                <p className="template-card__title">{t.title}</p>
              )}
              <p className="template-card__meta">
                {t.type} · {formatDate(t.created_at)}{t.is_featured ? ' · Featured' : ''}
              </p>
            </div>

            {editingId === t.id ? (
              <button className="template-card__save-btn" onClick={() => saveEdit(t.id)}>Save</button>
            ) : (
              <div className="template-card__menu-wrap">
                <button
                  className="template-card__menu-btn"
                  onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)}
                  aria-label="More options"
                >
                  <MoreVertical size={18} />
                </button>
                {openMenuId === t.id && (
                  <div className="template-card__dropdown" onMouseLeave={() => setOpenMenuId(null)}>
                    <button onClick={() => { setEditingId(t.id); setEditTitle(t.title); setOpenMenuId(null); }}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="template-card__dropdown-danger" onClick={() => { handleDelete(t.id); setOpenMenuId(null); }}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="template-list__count">Showing {total} template{total !== 1 ? 's' : ''}</p>
      {hasMore && (
        <button className="view-more-btn" onClick={() => loadPage(offset)}>View More</button>
      )}
    </div>
  );
}