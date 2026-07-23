import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Search, Star } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import { ENDPOINTS } from '../../../api/endpoints';
import '../AdminTemplates/AdminTemplates.css';
import './AdminProjects.css';

export default function AdminProjects() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [projectTemplates, setProjectTemplates] = useState([]);

  const refresh = () => {
    axiosClient.get(ENDPOINTS.PROPERTIES).then((res) => setProperties(res.data.data));
  };

  const toggleHeroPicker = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    const res = await axiosClient.get(ENDPOINTS.TEMPLATES, { params: { project_id: id, limit: 50 } });
    setProjectTemplates(res.data.data);
  };

  const setProjectHero = async (templateId) => {
    await axiosClient.patch(`${ENDPOINTS.TEMPLATES}/${templateId}/feature`);
    const res = await axiosClient.get(ENDPOINTS.TEMPLATES, { params: { project_id: expandedId, limit: 50 } });
    setProjectTemplates(res.data.data);
  };

  useEffect(() => { refresh(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete karna hai?')) return;
    await axiosClient.delete(`${ENDPOINTS.PROPERTIES}/${id}`);
    refresh();
  };

  const saveEdit = async (id) => {
    await axiosClient.put(`${ENDPOINTS.PROPERTIES}/${id}`, { name: editName });
    setEditingId(null);
    refresh();
  };

  const q = search.trim().toLowerCase();
  const visible = q
    ? properties.filter((p) =>
      [p.name, p.location, p.address].filter(Boolean).join(' ').toLowerCase().includes(q)
    )
    : properties;

  return (
    <div className="admin-projects">
      <div className="admin-templates__searchbar">
        <Search size={16} color="#9aa4b2" />
        <input
          type="text" placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="property-list">
        {visible.map((p) => (
          <div className="property-card" key={p.id}>
            <div className="property-card__row">
              <div
                className="property-card__body"
                onClick={() => {
                  if (editingId === p.id) return;
                  navigate(`/admin/templates?project_id=${p.id}&project_name=${encodeURIComponent(p.name)}`);
                }}
                style={{ cursor: editingId === p.id ? 'default' : 'pointer' }}
              >
                {editingId === p.id ? (
                  <input
                    className="template-card__edit-input"
                    value={editName}
                    autoFocus
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  <p className="property-card__title">{p.name}</p>
                )}
                <p className="property-card__meta">
                  {[p.location, p.address].filter(Boolean).join(' — ') || 'No location set'}
                </p>
                <span className="property-card__count">{p.template_count}+ Creatives</span>
              </div>

              <div className="template-card__actions">
                <button className="icon-btn" onClick={() => toggleHeroPicker(p.id)} aria-label="Hero select">
                  <Star size={16} />
                </button>
                {editingId === p.id ? (
                  <button className="icon-btn icon-btn--save" onClick={() => saveEdit(p.id)}>Save</button>
                ) : (
                  <button className="icon-btn" onClick={() => { setEditingId(p.id); setEditName(p.name); }} aria-label="Edit">
                    <Pencil size={16} />
                  </button>
                )}
                <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(p.id)} aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {expandedId === p.id && (
              <div className="property-card__hero-picker">
                {projectTemplates.length === 0 && <p className="property-card__meta">Is project me koi media nahi hai.</p>}
                {projectTemplates.map((t) => (
                  <button key={t.id} className="property-card__hero-item" onClick={() => setProjectHero(t.id)}>
                    <Star size={14} fill={t.is_featured ? '#f5a623' : 'none'} />
                    <span>{t.title} ({t.type})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        ))}
        {q && !visible.length && <p className="property-card__meta">Koi project nahi mila.</p>}
      </div>
    </div>
  );
}