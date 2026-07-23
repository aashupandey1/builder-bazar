import { useEffect, useState } from 'react';
import { Pencil, Trash2, Search, Star, ChevronDown, Play } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import { ENDPOINTS } from '../../../api/endpoints';
import '../AdminTemplates/AdminTemplates.css';
import './AdminProjects.css';

const isVideoTag = (tag) => tag === 'Video' || tag === 'Reel';

export default function AdminProjects() {
  const [properties, setProperties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [projectTemplates, setProjectTemplates] = useState([]);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [editTemplateTitle, setEditTemplateTitle] = useState('');

  const refresh = () => {
    axiosClient.get(ENDPOINTS.PROPERTIES).then((res) => setProperties(res.data.data));
  };

  const loadProjectTemplates = async (id) => {
    const res = await axiosClient.get(ENDPOINTS.TEMPLATES, { params: { project_id: id, limit: 50 } });
    setProjectTemplates(res.data.data);
  };

  const toggleHeroPicker = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    loadProjectTemplates(id);
  };

  const setProjectHero = async (templateId) => {
    await axiosClient.patch(`${ENDPOINTS.TEMPLATES}/${templateId}/feature`);
    loadProjectTemplates(expandedId);
  };

  const saveTemplateEdit = async (id) => {
    await axiosClient.put(`${ENDPOINTS.TEMPLATES}/${id}`, { title: editTemplateTitle });
    setEditingTemplateId(null);
    loadProjectTemplates(expandedId);
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Ye creative delete karna hai?')) return;
    await axiosClient.delete(`${ENDPOINTS.TEMPLATES}/${id}`);
    loadProjectTemplates(expandedId);
    refresh();
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
        {visible.map((p) => {
          const isOpen = expandedId === p.id;
          return (
            <div className={`property-card ${isOpen ? 'property-card--active' : ''}`} key={p.id}>
              <div className="property-card__row">
                <div className="property-card__body" onClick={() => toggleHeroPicker(p.id)}>
                  {editingId === p.id ? (
                    <input
                      className="template-card__edit-input"
                      value={editName}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    <p className="property-card__title">{p.name}</p>
                  )}
                  <p className="property-card__meta">
                    {[p.secondary_name, p.location, p.address].filter(Boolean).join(' — ') || 'No location set'}
                  </p>
                  <span className="property-card__count">{p.template_count}+ Creatives</span>
                </div>

                <ChevronDown size={18} className={`property-card__chevron ${isOpen ? 'is-open' : ''}`} onClick={() => toggleHeroPicker(p.id)} />

                <div className="template-card__actions">
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

              <div className={`property-card__hero-wrap ${isOpen ? 'is-open' : ''}`}>
                <div className="property-card__hero-inner">
                  <div className="creative-list">
                    {isOpen && projectTemplates.length === 0 && (
                      <p className="property-card__meta">Is project me koi media nahi hai.</p>
                    )}
                    {isOpen && projectTemplates.map((t) => (
                      <div className="creative-item" key={t.id}>
                        <div className="creative-item__thumb" onClick={() => setProjectHero(t.id)}>
                          {isVideoTag(t.type) ? (
                            <>
                              <video src={t.file_url} muted playsInline />
                              <span className="creative-item__play"><Play size={14} fill="#fff" /></span>
                            </>
                          ) : (
                            <img src={t.file_url} alt={t.title} />
                          )}
                          <span className="creative-item__star" aria-label="Set as hero">
                            <Star size={12} fill={t.is_featured ? '#f5a623' : 'none'} color={t.is_featured ? '#f5a623' : '#9aa4b2'} />
                          </span>
                        </div>

                        <div className="creative-item__body">
                          {editingTemplateId === t.id ? (
                            <input
                              className="template-card__edit-input"
                              value={editTemplateTitle}
                              autoFocus
                              onChange={(e) => setEditTemplateTitle(e.target.value)}
                            />
                          ) : (
                            <p className="creative-item__title">{t.title}</p>
                          )}
                          <p className="creative-item__meta">{t.type}</p>
                        </div>

                        <div className="creative-item__actions">
                          {editingTemplateId === t.id ? (
                            <button className="icon-btn icon-btn--save" onClick={() => saveTemplateEdit(t.id)}>Save</button>
                          ) : (
                            <button className="icon-btn" onClick={() => { setEditingTemplateId(t.id); setEditTemplateTitle(t.title); }} aria-label="Edit creative">
                              <Pencil size={14} />
                            </button>
                          )}
                          <button className="icon-btn icon-btn--danger" onClick={() => handleDeleteTemplate(t.id)} aria-label="Delete creative">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {q && !visible.length && <p className="property-card__meta">Koi project nahi mila.</p>}
      </div>
    </div>
  );
}