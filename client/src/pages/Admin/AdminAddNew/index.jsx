import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Folder, ChevronDown, Search } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import { ENDPOINTS } from '../../../api/endpoints';
import './AdminAddNew.css';

const TEMPLATE_TYPES = ['Video', 'Reel', 'Poster', 'Story', 'Banner'];
const CATEGORIES = ['Residential', 'Commercial', 'Villa', 'Plot', 'Other'];

// Search-modal field — tap opens a full search sheet, type to filter, tap a row to pick.
function PickerField({ label, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const term = search.trim().toLowerCase();
  const filtered = options.filter((o) => o.toLowerCase().includes(term));
  const exactMatch = options.some((o) => o.toLowerCase() === term);
  const pick = (val) => { onChange(val); setOpen(false); };

  return (
    <>
      <label className="upload-card__field">
        <span>{label}</span>
        <button type="button" className="upload-card__picker" onClick={() => { setSearch(''); setOpen(true); }}>
          <span className={value ? '' : 'upload-card__picker-placeholder'}>{value || placeholder}</span>
          <ChevronDown size={16} />
        </button>
      </label>
      {open && (
        <div className="picker-overlay" onClick={() => setOpen(false)}>
          <div className="picker-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="picker-sheet__search">
              <Search size={16} />
              <input autoFocus type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="picker-sheet__list">
              {filtered.map((o) => (
                <button type="button" key={o} className="picker-sheet__option" onClick={() => pick(o)}>{o}</button>
              ))}
              {term && !exactMatch && (
                <button type="button" className="picker-sheet__option picker-sheet__option--add" onClick={() => pick(search.trim())}>
                  + Add "{search.trim()}"
                </button>
              )}
              {!filtered.length && !term && <p className="picker-sheet__empty">Koi option nahi hai abhi</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminAddNew() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null); // null | 'template' | 'project'

  const [tplForm, setTplForm] = useState({ title: '', subtitle: '', type: 'Video', file: null });
  const [tplStatus, setTplStatus] = useState('');

  const [projForm, setProjForm] = useState({ name: '', location: '', secondaryName: '', category: '', subtitle: '', files: [] });
  const [projStatus, setProjStatus] = useState('');
  const [suggestions, setSuggestions] = useState({ names: [], locations: [], secondaryNames: [] });

  useEffect(() => {
    axiosClient.get(ENDPOINTS.PROPERTY_SUGGESTIONS)
      .then((res) => setSuggestions(res.data.data))
      .catch(() => { });
  }, []);

  const toggle = (section) => setOpen((prev) => (prev === section ? null : section));

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!tplForm.file) return setTplStatus('Ek file select karo');
    const data = new FormData();
    data.append('title', tplForm.title);
    data.append('subtitle', tplForm.subtitle);
    data.append('type', tplForm.type);
    data.append('files', tplForm.file);

    setTplStatus('Uploading...');
    try {
      const res = await axiosClient.post(ENDPOINTS.TEMPLATES, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setTplStatus(res.data.message);
      setTplForm({ title: '', subtitle: '', type: 'Video', file: null });
      navigate('/admin/templates');
    } catch (err) {
      setTplStatus(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projForm.name.trim()) return setProjStatus('Property name zaroori hai');
    if (!projForm.files.length) return setProjStatus('Kam se kam 1 media file zaroori hai');
    setProjStatus('Saving...');
    try {
      const propRes = await axiosClient.post(ENDPOINTS.PROPERTIES, {
        name: projForm.name,
        location: projForm.location,
        secondary_name: projForm.secondaryName,
        category: projForm.category,
      });
      const property = propRes.data.data;

      if (projForm.files.length) {
        setProjStatus('Uploading media...');
        const groups = projForm.files.reduce((acc, { file, type }) => {
          (acc[type] ??= []).push(file);
          return acc;
        }, {});
        await Promise.all(
          Object.entries(groups).map(([type, files]) => {
            const data = new FormData();
            data.append('title', projForm.name);
            data.append('subtitle', projForm.subtitle);
            data.append('type', type);
            data.append('project_id', property.id);
            files.forEach((f) => data.append('files', f));
            return axiosClient.post(ENDPOINTS.TEMPLATES, data, { headers: { 'Content-Type': 'multipart/form-data' } });
          })
        );
      }

      setProjStatus('Project created');
      setProjForm({ name: '', location: '', secondaryName: '', category: '', subtitle: '', files: [] });
      navigate('/admin/projects');
    } catch (err) {
      setProjStatus(err.response?.data?.message || 'Save failed');
    }
  };

  return (
    <div className="admin-add-new">
      <button className={`add-new__option ${open === 'template' ? 'add-new__option--open' : ''}`} onClick={() => toggle('template')}>
        <UploadCloud size={18} /> Upload New Template
        <ChevronDown size={16} className={`add-new__chevron ${open === 'template' ? 'add-new__chevron--open' : ''}`} />
      </button>
      {open === 'template' && (
        <form className="upload-card" onSubmit={handleUpload}>
          <input type="text" placeholder="Title" required value={tplForm.title} onChange={(e) => setTplForm({ ...tplForm, title: e.target.value })} />
          <select value={tplForm.type} onChange={(e) => setTplForm({ ...tplForm, type: e.target.value })}>
            {TEMPLATE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" placeholder="Subtitle (optional)" value={tplForm.subtitle} onChange={(e) => setTplForm({ ...tplForm, subtitle: e.target.value })} />
          <label className="upload-card__file">
            <UploadCloud size={18} />
            <span>{tplForm.file ? tplForm.file.name : 'Choose 1 media file'}</span>
            <input type="file" accept="image/*,video/*" hidden onChange={(e) => setTplForm({ ...tplForm, file: e.target.files[0] || null })} />
          </label>
          <button type="submit" className="upload-card__submit">Upload</button>
          {tplStatus && <p className="upload-card__status">{tplStatus}</p>}
        </form>
      )}

      <button className={`add-new__option ${open === 'project' ? 'add-new__option--open' : ''}`} onClick={() => toggle('project')}>
        <Folder size={18} /> Add New Project
        <ChevronDown size={16} className={`add-new__chevron ${open === 'project' ? 'add-new__chevron--open' : ''}`} />
      </button>
      {open === 'project' && (
        <form className="upload-card" onSubmit={handleCreateProject}>
          <div className="upload-card__grid">
            <PickerField label="Primary Name" value={projForm.name} onChange={(v) => setProjForm({ ...projForm, name: v })} options={suggestions.names} placeholder="Select primary name" />
            <PickerField label="Secondary Name" value={projForm.secondaryName} onChange={(v) => setProjForm({ ...projForm, secondaryName: v })} options={suggestions.secondaryNames} placeholder="Select secondary name" />
            <PickerField label="Location" value={projForm.location} onChange={(v) => setProjForm({ ...projForm, location: v })} options={suggestions.locations} placeholder="Select location" />
            <PickerField label="Category" value={projForm.category} onChange={(v) => setProjForm({ ...projForm, category: v })} options={CATEGORIES} placeholder="Select category" />
          </div>

          <p className="upload-card__section-label">Media — For this project</p>
          <input type="text" placeholder="Media subtitle (optional)" value={projForm.subtitle} onChange={(e) => setProjForm({ ...projForm, subtitle: e.target.value })} />
          <label className="upload-card__file">
            <UploadCloud size={18} />
            <span>{projForm.files.length ? `${projForm.files.length} file(s) selected` : 'Choose media files (required)'}</span>
            <input type="file" multiple accept="image/*,video/*" hidden onChange={(e) => {
              const chosen = Array.from(e.target.files).map((file) => ({
                file,
                type: file.type.startsWith('video/') ? 'Video' : 'Poster',
              }));
              setProjForm((p) => ({ ...p, files: [...p.files, ...chosen] }));
              e.target.value = '';
            }} />
          </label>
          {projForm.files.map((f, i) => (
            <div key={i} className="upload-card__file-row">
              <span>{f.file.name}</span>
              <select value={f.type} onChange={(e) => {
                const type = e.target.value;
                setProjForm((p) => ({ ...p, files: p.files.map((x, idx) => idx === i ? { ...x, type } : x) }));
              }}>
                {TEMPLATE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button type="button" onClick={() =>
                setProjForm((p) => ({ ...p, files: p.files.filter((_, idx) => idx !== i) }))
              }>✕</button>
            </div>
          ))}

          <button type="submit" className="upload-card__submit">Add Project</button>
          {projStatus && <p className="upload-card__status">{projStatus}</p>}
        </form>
      )}
    </div>
  );
}