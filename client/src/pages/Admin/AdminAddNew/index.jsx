import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Folder, ChevronDown, Search } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import { ENDPOINTS } from '../../../api/endpoints';
import './AdminAddNew.css';

const TEMPLATE_TYPES = ['Video', 'Reel', 'Poster', 'Story', 'Banner'];
const CATEGORIES = ['Residential', 'Commercial', 'Villa', 'Plot', 'Other'];

// Search-modal field — tap opens a full search sheet, type to filter, tap a row to pick.
// onAddOption(val):    optional — parent adds new value to suggestions state.
// onRemoveOption(val): optional — parent removes value from suggestions state.
function PickerField({ label, value, onChange, options, placeholder, onAddOption, onRemoveOption }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const term = search.trim().toLowerCase();
  const filtered = options.filter((o) => o.toLowerCase().includes(term));
  // Exact match check is case-insensitive so we never show Add for something already in list
  const exactMatch = options.some((o) => o.toLowerCase() === term);
  const pick = (val) => { onChange(val); setOpen(false); };

  const handleAdd = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    // Tell parent to persist this new value into suggestions (parent handles dedup)
    if (onAddOption) onAddOption(trimmed);
    pick(trimmed);
  };

  const handleDelete = (e, val) => {
    // Stop click from bubbling up to the option row (which would select the value)
    e.stopPropagation();
    if (onRemoveOption) onRemoveOption(val);
    // Dropdown intentionally stays open so user can continue working
  };

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
                <div key={o} className="picker-sheet__option-row">
                  <button
                    type="button"
                    className="picker-sheet__option picker-sheet__option--fill"
                    onClick={() => pick(o)}
                  >
                    {o}
                  </button>
                  {onRemoveOption && (
                    <button
                      type="button"
                      className="picker-sheet__option-delete"
                      onClick={(e) => handleDelete(e, o)}
                      aria-label={`Remove ${o}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {term && !exactMatch && (
                <button type="button" className="picker-sheet__option picker-sheet__option--add" onClick={handleAdd}>
                  + Add "{search.trim()}"
                </button>
              )}
              {!filtered.length && !term && <p className="picker-sheet__empty">There is no option right now</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



// Group/Builder entity picker — fetches real groups from API (id + logo_url + name).
// "+Add" immediately POSTs to /api/v1/groups and resolves the new group's id inline.
// Props:
//   groups        — array of { id, name, logo_url } from GET /api/v1/groups
//   selectedId    — currently selected group id (or null)
//   selectedName  — display name of selected group
//   onSelect(id, name, logoUrl) — called when user picks an existing group
//   onCreateGroup(name, logoFile) → Promise<{ id, name, logo_url }> — called on "+ Add"
//   onRemoveGroup(id) — optional callback to remove group from suggestion list / API
function GroupPickerField({ label, groups, selectedId, selectedName, onSelect, onCreateGroup, onRemoveGroup, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const term = search.trim().toLowerCase();
  const filtered = groups.filter((g) => g.name.toLowerCase().includes(term));
  const exactMatch = groups.some((g) => g.name.toLowerCase() === term);

  const pick = (g) => { onSelect(g.id, g.name, g.logo_url); setOpen(false); };

  const handleLogoChange = (e) => {
    const file = e.target.files[0] || null;
    setLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  const resetCreateState = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setSearch('');
    setCreateError('');
  };

  const handleAdd = async () => {
    const trimmed = search.trim();
    if (!trimmed || creating) return;
    setCreating(true);
    setCreateError('');
    try {
      const newGroup = await onCreateGroup(trimmed, logoFile);
      pick(newGroup);
      resetCreateState();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (onRemoveGroup) onRemoveGroup(id);
  };

  const displayLabel = selectedId ? selectedName : null;

  return (
    <>
      <label className="upload-card__field">
        <span>{label}</span>
        <button type="button" className="upload-card__picker" onClick={() => { resetCreateState(); setOpen(true); }}>
          <span className={displayLabel ? '' : 'upload-card__picker-placeholder'}>{displayLabel || placeholder}</span>
          <ChevronDown size={16} />
        </button>
      </label>
      {open && (
        <div className="picker-overlay" onClick={() => setOpen(false)}>
          <div className="picker-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="picker-sheet__search">
              <Search size={16} />
              <input
                autoFocus
                type="text"
                placeholder="Search or type new builder name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCreateError(''); }}
              />
            </div>
            <div className="picker-sheet__list">
              {filtered.map((g) => (
                <div key={g.id} className="picker-sheet__option-row">
                  <button
                    type="button"
                    className="picker-sheet__option picker-sheet__option--fill"
                    onClick={() => pick(g)}
                  >
                    {g.logo_url && <img src={g.logo_url} alt="" className="picker-sheet__group-logo" />}
                    {g.name}
                  </button>
                  {onRemoveGroup && (
                    <button
                      type="button"
                      className="picker-sheet__option-delete"
                      onClick={(e) => handleDelete(e, g.id)}
                      aria-label={`Remove ${g.name}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {term && !exactMatch && (
                <div className="picker-sheet__add-section" style={{ padding: '14px', borderBottom: '1px solid #f1f4f9' }}>
                  <label className="upload-card__file" style={{ margin: '0 0 10px 0', padding: '10px', fontSize: '13px' }}>
                    <UploadCloud size={16} />
                    <span>{logoFile ? logoFile.name : 'Upload logo (optional)'}</span>
                    <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
                  </label>
                  {logoPreview && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <img src={logoPreview} alt="Preview" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                      <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null); }} style={{ border: 'none', background: 'none', color: '#e0433f', fontSize: '12px', cursor: 'pointer' }}>Remove Logo</button>
                    </div>
                  )}
                  <button
                    type="button"
                    className="picker-sheet__option picker-sheet__option--add"
                    onClick={handleAdd}
                    disabled={creating}
                    style={{ padding: '10px 0', width: '100%', borderBottom: 'none' }}
                  >
                    {creating ? 'Creating...' : `+ Add "${search.trim()}"`}
                  </button>
                </div>
              )}

              {createError && <p className="picker-sheet__empty" style={{ color: '#e0433f' }}>{createError}</p>}
              {!filtered.length && !term && (
                <p className="picker-sheet__empty">No builders yet. Type a name to create one.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const makeGroup = () => ({
  key: Date.now() + Math.random(),
  groupId: null,    // integer FK to groups.id — replaces old free-text 'group' field
  groupName: '',    // display only, not sent to API
  name: '',
  secondaryName: '',
  location: '',
  category: '',
  files: [],
  status: 'idle',   // 'idle' | 'uploading' | 'done' | 'failed'
  statusMessage: '',
});

export default function AdminAddNew() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null); // null | 'template' | 'project'

  const [tplForm, setTplForm] = useState({ title: '', subtitle: '', type: 'Video', file: null });
  const [tplStatus, setTplStatus] = useState('');

  const [projGroups, setProjGroups] = useState([makeGroup()]);
  const [projStatus, setProjStatus] = useState('');
  const [groups, setGroups] = useState([]); // Builder/Group entities from API
  const [suggestions, setSuggestions] = useState({ names: [], locations: [], secondaryNames: [] });
  const [categories, setCategories] = useState(CATEGORIES);

  useEffect(() => {
    // Fetch real group entities (id + name + logo_url) for GroupPickerField
    axiosClient.get(ENDPOINTS.GROUPS)
      .then((res) => setGroups(res.data.data))
      .catch(() => { });
    // Fetch listing-field suggestions (names, locations, secondaryNames)
    axiosClient.get(ENDPOINTS.LISTING_SUGGESTIONS)
      .then((res) => setSuggestions((prev) => ({ ...prev, ...res.data.data })))
      .catch(() => { });
  }, []);

  const toggle = (section) => setOpen((prev) => (prev === section ? null : section));
  const addGroup = () => setProjGroups((g) => [...g, makeGroup()]);
  const removeGroup = (key) => setProjGroups((g) => g.filter((x) => x.key !== key));
  const updateGroup = (key, patch) => setProjGroups((g) => g.map((x) => (x.key === key ? { ...x, ...patch } : x)));

  // Add a brand-new value to a suggestions list (case-insensitive dedup, trim whitespace).
  // listKey must be one of: 'names' | 'secondaryNames' | 'locations'
  const addSuggestion = (listKey, val) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    setSuggestions((prev) => {
      const list = prev[listKey] ?? [];
      const alreadyExists = list.some((o) => o.toLowerCase() === trimmed.toLowerCase());
      if (alreadyExists) return prev; // no duplicate, no re-render
      return { ...prev, [listKey]: [...list, trimmed] };
    });
  };

  // Remove a value from a suggestions list.
  // Selected values in form inputs are NOT cleared — only future suggestions are affected.
  const removeSuggestion = (listKey, val) => {
    setSuggestions((prev) => ({
      ...prev,
      [listKey]: (prev[listKey] ?? []).filter(
        (o) => o.toLowerCase() !== val.toLowerCase()
      ),
    }));
  };

  // Create a brand-new Builder/Group via API, add it to local groups list, return it.
  // Called by GroupPickerField when user clicks "+ Add [name]".
  const createGroup = async (name, logoFile) => {
    const formData = new FormData();
    formData.append('name', name);
    if (logoFile) formData.append('logo', logoFile);

    const res = await axiosClient.post(ENDPOINTS.GROUPS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const newGroup = res.data.data;
    setGroups((prev) => [...prev, newGroup].sort((a, b) => a.name.localeCompare(b.name)));
    return newGroup;
  };

  const deleteGroup = async (id) => {
    await axiosClient.delete(`${ENDPOINTS.GROUPS}/${id}`);
    setGroups((prev) => prev.filter((g) => g.id !== id));
    // Also clear selection in projGroups if deleted group was selected
    setProjGroups((prev) =>
      prev.map((x) =>
        x.groupId === id ? { ...x, groupId: null, groupName: '' } : x
      )
    );
  };


  const handleUpload = async (e) => {
    e.preventDefault();
    if (!tplForm.file) return setTplStatus('Please select a file');
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

    // Every group must have a Builder/Group selected (entity id, not free text)
    const missingGroup = projGroups.find((g) => !g.groupId);
    if (missingGroup) return setProjStatus('Please select a Builder/Group for every entry');

    // Every group must have a Primary Name
    const missingName = projGroups.find((g) => !g.name.trim());
    if (missingName) return setProjStatus('Primary Name is required for every entry');

    // Every group must have at least one file
    const missingFiles = projGroups.find((g) => g.files.length === 0);
    if (missingFiles) return setProjStatus('At least 1 media file is required for every entry');

    setProjStatus('Saving...');
    let anyFailed = false;
    for (const grp of projGroups) {
      updateGroup(grp.key, { status: 'uploading', statusMessage: '' });
      try {
        // Create a separate listing for each group, now with group_id FK
        const propRes = await axiosClient.post(ENDPOINTS.LISTINGS, {
          name: grp.name,
          location: grp.location,
          secondary_name: grp.secondaryName,
          category: grp.category,
          group_id: grp.groupId,  // ← entity id, replaces old subtitle text
        });
        const property = propRes.data.data;

        // Upload this group's media, batched by type
        setProjStatus(`Uploading media for "${grp.name}"...`);
        const byType = grp.files.reduce((acc, { file, type }) => {
          (acc[type] ??= []).push(file);
          return acc;
        }, {});
        await Promise.all(
          Object.entries(byType).map(([type, files]) => {
            const data = new FormData();
            data.append('title', grp.name);
            // subtitle no longer carries group text — group is tracked via group_id on property
            data.append('type', type);
            data.append('listing_id', property.id);
            files.forEach((f) => data.append('files', f));
            return axiosClient.post(ENDPOINTS.TEMPLATES, data, { headers: { 'Content-Type': 'multipart/form-data' } });
          })
        );
        updateGroup(grp.key, { status: 'done' });
      } catch (err) {
        anyFailed = true;
        updateGroup(grp.key, { status: 'failed', statusMessage: err.response?.data?.message || 'Upload failed' });
      }
    }

    if (!anyFailed) {
      setProjStatus('Project created!');
      setProjGroups([makeGroup()]);
      navigate('/admin/projects');
    } else {
      setProjStatus('Some groups failed to upload — see badges above.');
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
          {projGroups.map((grp, idx) => (
            <div key={grp.key} className="upload-card__group">

              {/* Card header: label on left, status badge + remove on right */}
              <div className="upload-card__group-header">
                <p className="upload-card__group-title">Project Group {idx + 1}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {grp.status === 'uploading' && <span style={{ fontSize: 12, color: '#9aa4b2' }}>⏳ Uploading...</span>}
                  {grp.status === 'done' && <span style={{ fontSize: 12, color: '#16a34a' }}>✅ Done</span>}
                  {grp.status === 'failed' && <span style={{ fontSize: 12, color: '#e0433f' }}>❌ Failed — {grp.statusMessage}</span>}
                  {projGroups.length > 1 && (
                    <button
                      type="button"
                      className="upload-card__remove-group"
                      onClick={() => removeGroup(grp.key)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Builder / Group — entity picker (id + optional logo), above property grid */}
              <GroupPickerField
                label="Builder / Group"
                groups={groups}
                selectedId={grp.groupId}
                selectedName={grp.groupName}
                placeholder="Select or create a builder"
                onSelect={(id, name) => updateGroup(grp.key, { groupId: id, groupName: name })}
                onCreateGroup={createGroup}
                onRemoveGroup={deleteGroup}
              />


              {/* Property fields — 2×2 grid */}
              <div className="upload-card__grid">
                <PickerField
                  label="Primary Name"
                  value={grp.name}
                  onChange={(v) => updateGroup(grp.key, { name: v })}
                  options={suggestions.names}
                  placeholder="Select primary name"
                  onAddOption={(v) => addSuggestion('names', v)}
                  onRemoveOption={(v) => removeSuggestion('names', v)}
                />
                <PickerField
                  label="Secondary Name"
                  value={grp.secondaryName}
                  onChange={(v) => updateGroup(grp.key, { secondaryName: v })}
                  options={suggestions.secondaryNames}
                  placeholder="Select secondary name"
                  onAddOption={(v) => addSuggestion('secondaryNames', v)}
                  onRemoveOption={(v) => removeSuggestion('secondaryNames', v)}
                />
                <PickerField
                  label="Location"
                  value={grp.location}
                  onChange={(v) => updateGroup(grp.key, { location: v })}
                  options={suggestions.locations}
                  placeholder="Select location"
                  onAddOption={(v) => addSuggestion('locations', v)}
                  onRemoveOption={(v) => removeSuggestion('locations', v)}
                />
                <PickerField
                  label="Category"
                  value={grp.category}
                  onChange={(v) => updateGroup(grp.key, { category: v })}
                  options={categories}
                  placeholder="Select category"
                  onAddOption={(v) => {
                    const trimmed = v.trim();
                    if (!trimmed) return;
                    setCategories((prev) => {
                      const alreadyExists = prev.some((o) => o.toLowerCase() === trimmed.toLowerCase());
                      if (alreadyExists) return prev;
                      return [...prev, trimmed];
                    });
                  }}
                  onRemoveOption={(v) => {
                    setCategories((prev) => prev.filter((o) => o.toLowerCase() !== v.toLowerCase()));
                  }}
                />
              </div>

              {/* Files */}
              <p className="upload-card__section-label">Media — For this group</p>
              <label className="upload-card__file">
                <UploadCloud size={18} />
                <span>{grp.files.length ? `${grp.files.length} file(s) selected` : 'Choose media files (required)'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  hidden
                  onChange={(e) => {
                    const chosen = Array.from(e.target.files).map((file) => ({
                      file,
                      type: file.type.startsWith('video/') ? 'Video' : 'Poster',
                    }));
                    updateGroup(grp.key, { files: [...grp.files, ...chosen] });
                    e.target.value = '';
                  }}
                />
              </label>
              {grp.files.map((f, i) => (
                <div key={i} className="upload-card__file-row">
                  <span>{f.file.name}</span>
                  <select
                    value={f.type}
                    onChange={(e) => {
                      const type = e.target.value;
                      updateGroup(grp.key, { files: grp.files.map((x, idx) => idx === i ? { ...x, type } : x) });
                    }}
                  >
                    {TEMPLATE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => updateGroup(grp.key, { files: grp.files.filter((_, idx) => idx !== i) })}
                  >✕</button>
                </div>
              ))}

            </div>
          ))}

          <button type="button" className="upload-card__add-group" onClick={addGroup}>
            + Add one more project group
          </button>

          <button type="submit" className="upload-card__submit">Add Projects</button>
          {projStatus && <p className="upload-card__status">{projStatus}</p>}
        </form>
      )}
    </div>
  );
}