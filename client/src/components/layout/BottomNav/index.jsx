import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: 'home' },
  { to: '/projects', label: 'Projects', icon: 'projects' },
  { to: '/upload', label: 'Create', icon: 'create' },
  { to: '/my-studio', label: 'My Studio', icon: 'studio' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
];

function Icon({ name }) {
  const icons = {
    home: <path d="M3 11L12 4l9 7v8a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />,
    projects: <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />,
    create: <path d="M12 5v14M5 12h14" strokeLinecap="round" />,
    studio: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0112 0M15 9a3 3 0 013 3M21 20a6 6 0 00-6-6" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20a8 8 0 0116 0" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      className="bottomnav__icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      {icons[name]}
    </svg>
  );
}

export default function BottomNav() {
  return (
    <nav className="bottomnav">
      {NAV_ITEMS.map((item) =>
        item.icon === 'create' ? (
          <button key={item.to} type="button" className="bottomnav__fab bottomnav__fab--disabled" disabled title="Coming soon">
            <Icon name={item.icon} />
          </button>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `bottomnav__item ${isActive ? 'bottomnav__item--active' : ''}`
            }
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        )
      )}
    </nav>
  );
}