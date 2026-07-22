import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import SearchBar from '../../components/common/SearchBar';
import BottomNav from '../../components/layout/BottomNav';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import './Projects.css';

const PREVIEW_COUNT = 10;

export default function Projects() {
  const [properties, setProperties] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PREVIEW_COUNT);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get(ENDPOINTS.PROPERTIES)
      .then((res) => setProperties(res.data.data))
      .catch(() => setProperties([]));
  }, []);

  const locations = ['All', ...new Set(properties.map((p) => p.location).filter(Boolean))];

  const filteredProjects = properties.filter((p) => {
    const matchesFilter = activeFilter === 'All' || p.location === activeFilter;
    const matchesSearch = p.name.toLowerCase().includes(search.trim().toLowerCase());
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
        {visibleProjects.map((p) => (
          <button
            key={p.id}
            className="projects__card"
            onClick={() => navigate('/gallery', { state: { projectId: p.id, name: p.name } })}
          >
            <div
              className="projects__thumb"
              style={p.thumbnail_url ? { backgroundImage: `url(${p.thumbnail_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
            >
              {!p.thumbnail_url && p.name.charAt(0).toUpperCase()}
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
        ))}

        {filteredProjects.length === 0 && (
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