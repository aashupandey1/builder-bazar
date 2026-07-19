import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, LayoutGrid, Layers, Folder, MoreHorizontal, Plus } from 'lucide-react';
import { ADMIN_NAV } from '../../../constants/adminNav';
import logo from '../../../assets/logos/logo.png';
import './AdminLayout.css';

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header__brand">
          <img src={logo} alt="Builder Bazar" className="admin-header__logo" />
          <div>
            <p className="admin-header__title">BUILDER BAZAR</p>
            <p className="admin-header__subtitle">MARKETING STUDIO</p>
          </div>
        </div>
        <button className="admin-header__bell" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="admin-header__menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Menu">
          <Menu size={20} />
        </button>
      </header>

      {drawerOpen && (
        <div className="admin-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <nav className="admin-drawer" onClick={(e) => e.stopPropagation()}>
            <button className="admin-drawer__close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
              <X size={18} />
            </button>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-drawer__link admin-drawer__link--top ${isActive ? 'active' : ''}`} onClick={() => setDrawerOpen(false)}>
              <LayoutGrid size={16} /> Dashboard
            </NavLink>
            {ADMIN_NAV.map((section) => (
              <div className="admin-drawer__group" key={section.group}>
                <p className="admin-drawer__group-title">{section.group}</p>
                {section.items.map(({ label, path, icon: Icon }) => (
                  <NavLink key={path} to={path} className={({ isActive }) => `admin-drawer__link ${isActive ? 'active' : ''}`} onClick={() => setDrawerOpen(false)}>
                    <Icon size={16} /> {label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>
      )}

      <main className="admin-main">
        <Outlet />
      </main>

      <nav className="admin-bottomnav">
        <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-bottomnav__item ${isActive ? 'active' : ''}`}>
          <LayoutGrid size={20} /><span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/templates" className={({ isActive }) => `admin-bottomnav__item ${isActive ? 'active' : ''}`}>
          <Layers size={20} /><span>Templates</span>
        </NavLink>
        <button className="admin-bottomnav__fab" onClick={() => navigate('/admin/add-new')} aria-label="Quick add">
          <Plus size={22} />
        </button>
        <NavLink to="/admin/projects" className={({ isActive }) => `admin-bottomnav__item ${isActive ? 'active' : ''}`}>
          <Folder size={20} /><span>Projects</span>
        </NavLink>
        <button type="button" className="admin-bottomnav__item" onClick={() => setDrawerOpen(true)}>
          <MoreHorizontal size={20} /><span>More</span>
        </button>
      </nav>
    </div>
  );
}