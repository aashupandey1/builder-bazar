import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import SearchBar from '../../components/common/SearchBar';
import BottomNav from '../../components/layout/BottomNav';
import heroVideo from '../../assets/videos/hero.mp4';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import {
  FolderIcon,
  PlayIcon,
  ImageIcon,
  PhoneIcon,
  BannerIcon,
} from "../../components/common/Icon";
import './Dashboard.css';

const QUICK_ACTIONS = [
  { label: "Projects", icon: FolderIcon },
  { label: "Videos", icon: PlayIcon },
  { label: "Posters", icon: ImageIcon },
  { label: "Stories", icon: PhoneIcon },
  { label: "Banners", icon: BannerIcon },
];

const PREVIEW_COUNT = 10;
const isVideoTag = (tag) => tag === 'Video' || tag === 'Reel';

export default function Dashboard() {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(PREVIEW_COUNT);
  const [search, setSearch] = useState('');
  const [trending, setTrending] = useState([]);
  const [hero, setHero] = useState(null);

  useEffect(() => {
    axiosClient.get(ENDPOINTS.TEMPLATES, { params: { sort: 'trending' } })
      .then((res) => setTrending(res.data.data))
      .catch(() => setTrending([]));

    axiosClient.get(ENDPOINTS.TEMPLATES, { params: { featured: true } })
      .then((res) => setHero(res.data.data[0] || null))
      .catch(() => setHero(null));
  }, []);

  const filteredTrending = trending.filter((item) =>
    item.title.toLowerCase().includes(search.trim().toLowerCase())
  );
  const visibleTrending = filteredTrending.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTrending.length;

  const handleSearchChange = (val) => {
    setSearch(val);
    setVisibleCount(PREVIEW_COUNT);
  };

  return (
    <div className="dashboard">
      <Header />
      <SearchBar value={search} onChange={handleSearchChange} />

      <div className="dashboard__hero">
        {hero && isVideoTag(hero.type) ? (
          <video className="dashboard__hero-video" src={hero.file_url} autoPlay muted loop playsInline />
        ) : hero ? (
          <img className="dashboard__hero-video" src={hero.file_url} alt={hero.title} />
        ) : (
          <video className="dashboard__hero-video" autoPlay muted loop playsInline>
            <source src={heroVideo} type="video/mp4" />
          </video>
        )}
        <div className="dashboard__hero-overlay"></div>
        <div className="dashboard__hero-content">
          {hero ? (
            <h2 className="dashboard__hero-title">{hero.title}</h2>
          ) : (
            <>
              <p className="dashboard__hero-eyebrow">LIVE THE</p>
              <h2 className="dashboard__hero-title">LUXURY</h2>
              <p className="dashboard__hero-eyebrow">YOU DESERVE</p>
            </>
          )}
          <button
            className="dashboard__hero-btn"
            onClick={() =>
              hero?.project_id
                ? navigate('/gallery', { state: { projectId: hero.project_id, name: hero.subtitle } })
                : navigate('/gallery')
            }
          >
            View Project
          </button>
        </div>
      </div>

      <div className="dashboard__actions">
        {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className="dashboard__action"
            onClick={() => label === "Projects" ? navigate("/projects") : navigate("/gallery", { state: { tab: label } })}
          >
            <div className="dashboard__action-icon">
              <Icon size={28} />
            </div>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="dashboard__section-head">
        <h3>Trending Now 🔥</h3>
      </div>

      <div className="dashboard__trending">
        {visibleTrending.map((item) => (
          <button
            key={item.id}
            className="dashboard__card"
            onClick={() => {
              axiosClient.post(`${ENDPOINTS.TEMPLATES}/${item.id}/view`).catch(() => { });
              navigate('/preview', { state: item });
            }}
          >
            <span className="dashboard__card-tag">{item.type}</span>
            <div className="dashboard__card-image">
              {isVideoTag(item.type) ? (
                <video src={item.file_url} autoPlay muted loop playsInline />
              ) : (
                <img src={item.file_url} alt={item.title} />
              )}
            </div>
            <p className="dashboard__card-title">{item.title}</p>
            <p className="dashboard__card-subtitle">{item.subtitle}</p>
          </button>
        ))}
      </div>

      {hasMore && (
        <button className="dashboard__view-more" onClick={() => setVisibleCount((c) => c + PREVIEW_COUNT)}>
          View More
        </button>
      )}

      <BottomNav />
    </div>
  );
}