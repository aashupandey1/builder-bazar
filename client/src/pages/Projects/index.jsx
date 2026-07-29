import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import SearchBar from '../../components/common/SearchBar';
import BottomNav from '../../components/layout/BottomNav';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import Skeleton from '../../components/common/Skeleton/Skeleton';
import './Projects.css';

const PREVIEW_COUNT = 10;

export default function Projects() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PREVIEW_COUNT);
  const navigate = useNavigate();
  const location = useLocation();

  const groupId = location.state?.groupId;
  const groupName = location.state?.groupName;

  useEffect(() => {
    setLoading(true);
    setActiveFilter('All');
    setSearch('');
    setVisibleCount(PREVIEW_COUNT);
    const params = groupId ? { group_id: groupId } : { grouped: true };
    axiosClient.get(ENDPOINTS.LISTINGS, { params })
      .then((res) => setListings(res.data.data))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [groupId]);

  const locations = ['All', ...new Set(listings.map((p) => p.location).filter(Boolean))];

  const filteredProjects = listings.filter((p) => {
    const matchesFilter = activeFilter === 'All' || p.location === activeFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      p.name.toLowerCase().startsWith(q) ||
      (p.secondary_name && p.secondary_name.toLowerCase().includes(q)) ||
      (p.location && p.location.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });
  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;

  const handleFilterClick = (f) => {
    setActiveFilter(f);
    setVisibleCount(PREVIEW_COUNT);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setVisibleCount(PREVIEW_COUNT);
  };

  return (
    <div className="projects">
      <Header title="All Projects" />
      
      {groupId && (
        <div className="projects__group-bar">
          <button type="button" className="projects__back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h2 className="projects__group-title">{groupName}</h2>
        </div>
      )}

      <SearchBar placeholder="Search projects..." value={search} onChange={handleSearchChange} />

      <div className="projects__filters">
        {locations.map((f) => (
          <button
            key={f}
            className={`projects__filter ${activeFilter === f ? 'projects__filter--active' : ''}`}
            onClick={() => handleFilterClick(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="projects__list">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="projects__card" style={{ pointerEvents: 'none' }}>
              <Skeleton width="56px" height="56px" radius="10px" />
              <div style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width="60%" height="14px" radius="6px" />
                <Skeleton width="40%" height="11px" radius="6px" style={{ marginTop: 6 }} />
              </div>
            </div>
          ))
          : visibleProjects.map((p) => (
            <button
              key={p.id}
              className="projects__card"
              onClick={() => {
                if (groupId) {
                  navigate('/gallery', { state: { listingId: p.id, name: p.name } });
                } else {
                  navigate('/projects', { state: { groupId: p.id, groupName: p.name } });
                }
              }}
            >
              <div
                className="projects__thumb"
                style={(p.logo_url || p.thumbnail_url) ? { backgroundImage: `url(${p.logo_url || p.thumbnail_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
              >
                {!(p.logo_url || p.thumbnail_url) && p.name.charAt(0).toUpperCase()}
              </div>
              <div className="projects__info">
                <p className="projects__name">{p.name}</p>
                {(p.secondary_name || p.location) && (
                  <p className="projects__location">
                    {[p.secondary_name, p.location].filter(Boolean).join(' — ')}
                  </p>
                )}
                <p className="projects__count">{p.template_count}+ Creatives</p>
              </div>
            </button>
          ))
        }

        {!loading && filteredProjects.length === 0 && (
          <p className="projects__empty">Didn't get any project.</p>
        )}
      </div>

      {hasMore && (
        <button className="projects__view-more" onClick={() => setVisibleCount((c) => c + PREVIEW_COUNT)}>
          View More
        </button>
      )}

      <BottomNav />
    </div>
  );
}