import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import Header from '../../components/layout/Header';
import SearchBar from '../../components/common/SearchBar';
import BottomNav from '../../components/layout/BottomNav';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import { useHlsVideo } from '../../hooks/useHlsVideo';
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

let dashboardCache = null; // { trending, trendingOffset, hasMoreTrending, hero, scrollY }

export default function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [suggestionPool, setSuggestionPool] = useState([]); // flat deduped array from /properties/suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trending, setTrending] = useState([]);
  const [trendingOffset, setTrendingOffset] = useState(0);
  const [hasMoreTrending, setHasMoreTrending] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [hero, setHero] = useState(null);
  const [heroLoading, setHeroLoading] = useState(true);
  const [heroMuted, setHeroMuted] = useState(true);
  const heroVideoRef = useRef(null);
  useHlsVideo(heroVideoRef, hero?.file_url);

  const loadTrending = (currentOffset, replace = false) => {
    if (replace) setTrendingLoading(true); else setMoreLoading(true);
    axiosClient.get(ENDPOINTS.TEMPLATES, { params: { sort: 'trending', limit: PREVIEW_COUNT, offset: currentOffset } })
      .then((res) => {
        const rows = res.data.data;
        setTrending((prev) => (replace ? rows : [...prev, ...rows]));
        setHasMoreTrending(rows.length === PREVIEW_COUNT);
        setTrendingOffset(currentOffset + rows.length);
      })
      .catch(() => setHasMoreTrending(false))
      .finally(() => {
        if (replace) setTrendingLoading(false);
        setMoreLoading(false);
      });
  };

  useEffect(() => {
    if (dashboardCache) {
      setTrending(dashboardCache.trending);
      setTrendingOffset(dashboardCache.trendingOffset);
      setHasMoreTrending(dashboardCache.hasMoreTrending);
      setHero(dashboardCache.hero);
      setTrendingLoading(false);
      setHeroLoading(false);
    } else {
      loadTrending(0, true);
      axiosClient.get(ENDPOINTS.TEMPLATES, { params: { featured: true } })
        .then((res) => setHero(res.data.data[0] || null))
        .catch(() => setHero(null))
        .finally(() => setHeroLoading(false));
    }
    // Fetch suggestion pool once — names + secondaryNames + locations combined into one flat deduped list
    axiosClient.get(ENDPOINTS.PROPERTY_SUGGESTIONS)
      .then((res) => {
        const { names = [], secondaryNames = [], locations = [] } = res.data.data;
        const all = [...new Set([...names, ...secondaryNames, ...locations].filter(Boolean))];
        setSuggestionPool(all);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    dashboardCache = { trending, trendingOffset, hasMoreTrending, hero, scrollY: dashboardCache?.scrollY };
  }, [trending, trendingOffset, hasMoreTrending, hero]);

  useEffect(() => {
    return () => {
      if (dashboardCache) dashboardCache.scrollY = window.scrollY;
    };
  }, []);

  useLayoutEffect(() => {
    if (!trendingLoading && dashboardCache?.scrollY) {
      window.scrollTo(0, dashboardCache.scrollY);
    }
  }, [trendingLoading]);

  const [isSearching, setIsSearching] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const searchAbortRef = useRef(null);

  const skipFirstSearch = useRef(true);
  useEffect(() => {
    if (skipFirstSearch.current) { skipFirstSearch.current = false; return; }
    searchAbortRef.current?.abort();
    const term = search.trim();
    if (!term) {
      setSearchActive(false);
      setIsSearching(false);
      loadTrending(0, true);
      return;
    }
    setSearchActive(true);
    setIsSearching(true);
    const controller = new AbortController();
    searchAbortRef.current = controller;
    const timer = setTimeout(() => {
      axiosClient.get(ENDPOINTS.TEMPLATES, { params: { search: term, limit: 50 }, signal: controller.signal })
        .then((res) => {
          setTrending(res.data.data);
          setHasMoreTrending(false);
        })
        .catch((err) => {
          if (err.name === 'CanceledError' || err.name === 'AbortError') return;
          setTrending([]);
        })
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (val) => setSearch(val);

  const handleSearchKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    const term = search.trim();
    if (!term) return;
    searchAbortRef.current?.abort();
    setShowSuggestions(false);
    setSearchActive(true);
    setIsSearching(true);
    const controller = new AbortController();
    searchAbortRef.current = controller;
    axiosClient.get(ENDPOINTS.TEMPLATES, { params: { search: term, limit: 50 }, signal: controller.signal })
      .then((res) => {
        setTrending(res.data.data);
        setHasMoreTrending(false);
      })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.name === 'AbortError') return;
        setTrending([]);
      })
      .finally(() => setIsSearching(false));
  };

  // Client-side filter: case-insensitive prefix match across the pooled names/locations
  const blurTimerRef = useRef(null);
  const filteredSuggestions = showSuggestions && search.trim().length > 0
    ? suggestionPool.filter((s) => s.toLowerCase().startsWith(search.trim().toLowerCase())).slice(0, 8)
    : [];

  const handleSuggestionClick = (val) => {
    setSearch(val);
    setShowSuggestions(false);
  };

  const handleSearchFocus = () => {
    clearTimeout(blurTimerRef.current);
    setShowSuggestions(true);
  };

  const handleSearchBlur = () => {
    // Small delay so a suggestion click fires before the dropdown disappears
    blurTimerRef.current = setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard__search-wrap">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onKeyDown={handleSearchKeyDown}
        />
        {filteredSuggestions.length > 0 && (
          <ul className="dashboard__suggestions">
            {filteredSuggestions.map((s) => (
              <li key={s}>
                <button
                  className="dashboard__suggestion-item"
                  onMouseDown={(e) => e.preventDefault()} // keep input focused so blur delay doesn't race
                  onClick={() => handleSuggestionClick(s)}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        className="dashboard__hero"
        onClick={() => hero && navigate('/preview', { state: hero })}
      >
        {heroLoading ? (
          <Skeleton width="100%" height="100%" radius="0px" />
        ) : hero && isVideoTag(hero.type) ? (
          <video
            className="dashboard__hero-video"
            autoPlay loop playsInline
            preload="auto"
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
        <h3>{searchActive ? 'Search Results' : 'Trending Now 🔥'}</h3>
      </div>

      {searchActive && !isSearching && trending.length === 0 ? (
        <p className="dashboard__no-results">No results found for "{search.trim()}"</p>
      ) : (
        <div className="dashboard__trending">
          {trendingLoading || isSearching
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
                <p className="dashboard__card-title">{item.property_name || item.title}</p>
                <p className="dashboard__card-subtitle">
                  {[item.property_secondary_name, item.property_location].filter(Boolean).join(', ') || item.subtitle}
                </p>
              </button>
            ))
          }
        </div>
      )}

      {hasMoreTrending && !searchActive && (
        <button className="dashboard__view-more" onClick={() => loadTrending(trendingOffset)} disabled={moreLoading}>
          {moreLoading ? 'Loading...' : 'View More'}
        </button>
      )}

      <BottomNav />
    </div>
  );
}