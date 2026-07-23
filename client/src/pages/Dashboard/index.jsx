import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import Header from '../../components/layout/Header';
import SearchBar from '../../components/common/SearchBar';
import BottomNav from '../../components/layout/BottomNav';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import {
  FolderIcon,
  PlayIcon,
  ImageIcon,
  PhoneIcon,
  BannerIcon,
} from "../../components/common/Icon";
import Skeleton from '../../components/common/Skeleton/Skeleton';
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
  const [search, setSearch] = useState('');
  const [trending, setTrending] = useState([]);
  const [trendingOffset, setTrendingOffset] = useState(0);
  const [hasMoreTrending, setHasMoreTrending] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [hero, setHero] = useState(null);
  const [heroMuted, setHeroMuted] = useState(true);
  const heroVideoRef = useRef(null);

  const loadTrending = (currentOffset, replace = false) => {
    if (replace) setTrendingLoading(true);
    axiosClient.get(ENDPOINTS.TEMPLATES, { params: { sort: 'trending', limit: PREVIEW_COUNT, offset: currentOffset } })
      .then((res) => {
        const rows = res.data.data;
        setTrending((prev) => (replace ? rows : [...prev, ...rows]));
        setHasMoreTrending(rows.length === PREVIEW_COUNT);
        setTrendingOffset(currentOffset + rows.length);
      })
      .catch(() => setHasMoreTrending(false))
      .finally(() => { if (replace) setTrendingLoading(false); });
  };

  useEffect(() => {
    loadTrending(0, true);

    axiosClient.get(ENDPOINTS.TEMPLATES, { params: { featured: true } })
      .then((res) => setHero(res.data.data[0] || null))
      .catch(() => setHero(null));
  }, []);

  useEffect(() => {
    const term = search.trim();
    if (!term) {
      loadTrending(0, true);
      return;
    }
    const timer = setTimeout(() => {
      axiosClient.get(ENDPOINTS.TEMPLATES, { params: { search: term, limit: 50 } })
        .then((res) => {
          setTrending(res.data.data);
          setHasMoreTrending(false);
        })
        .catch(() => setTrending([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (val) => setSearch(val);

  return (
    <div className="dashboard">
      <Header />
      <SearchBar value={search} onChange={handleSearchChange} />

      <div
        className="dashboard__hero"
        onClick={() => hero && navigate('/preview', { state: hero })}
      >
        {hero && isVideoTag(hero.type) ? (
          <video
            className="dashboard__hero-video"
            src={hero.file_url}
            autoPlay loop playsInline
            muted={heroMuted}
            ref={heroVideoRef}
          />
        ) : hero ? (
          <img className="dashboard__hero-video" src={hero.file_url} alt={hero.title} />
        ) : null}
        <div className="dashboard__hero-overlay"></div>
        <div className="dashboard__hero-content">
          {hero && <h2 className="dashboard__hero-title">{hero.title}</h2>}
          {hero && (
            <button
              className="dashboard__hero-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/gallery', { state: { projectId: hero.project_id, name: hero.subtitle } });
              }}
            >
              View Project
            </button>
          )}
        </div>
        {hero && isVideoTag(hero.type) && (
          <button
            className="dashboard__hero-mute"
            onClick={(e) => {
              e.stopPropagation();
              setHeroMuted((prev) => !prev);
            }}
          >
            {heroMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        )}
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
        {trendingLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="dashboard__card" style={{ pointerEvents: 'none' }}>
                <Skeleton width="100%" height="160px" radius="10px" />
                <Skeleton width="65%" height="13px" radius="6px" style={{ marginTop: 8 }} />
                <Skeleton width="40%" height="11px" radius="6px" style={{ marginTop: 4 }} />
              </div>
            ))
          : trending.map((item, index) => (
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
                    <>
                      <video
                        src={item.file_url}
                        loop playsInline
                        preload="metadata"
                        ref={(node) => { if (node) node.muted = true; }}
                      />
                      <span className="dashboard__card-play">
                        <PlayIcon size={22} />
                      </span>
                    </>
                  ) : (
                    <img src={item.file_url} alt={item.title} />
                  )}
                </div>
                <p className="dashboard__card-title">{item.title}</p>
                <p className="dashboard__card-subtitle">{item.subtitle}</p>
              </button>
            ))
        }
      </div>

      {hasMoreTrending && (
        <button className="dashboard__view-more" onClick={() => loadTrending(trendingOffset)}>
          View More
        </button>
      )}

      <BottomNav />
    </div>
  );
}