import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import { ENDPOINTS } from '../../../api/endpoints';
import logo from '../../../assets/logos/logo.png';
import { useAuth } from '../../../context/AuthContext';
import './Header.css';

export default function Header({ title = 'Marketing Studio' }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = () => {
      axiosClient.get(ENDPOINTS.NOTIFICATIONS).then((res) => {
        setUnreadCount(res.data.data.filter((n) => !n.is_read).length);
      });
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // ponytail: polling, socket.io not wired yet
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__logo">
          <img src={logo} alt="Builder Bazar" className="header__logo-img" />
        </div>
        <div className="header__text">
          <p className="header__title">BUILDER BAZAR</p>
          <p className="header__subtitle">MARKETING STUDIO</p>
        </div>
      </div>

      <div className="header__actions">
        <button className="header__bell" aria-label="Notifications" onClick={() => navigate('/notifications')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.7 21a2 2 0 01-3.4 0" strokeLinecap="round" />
          </svg>
          {unreadCount > 0 && (
            <span className="header__bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
        {user?.role === 'admin' && (
          <button className="header__admin" aria-label="Admin panel" onClick={() => navigate('/admin/dashboard')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}