import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import BottomNav from '../../components/layout/BottomNav';
import { BuildingIcon, UserIcon, BellIcon } from '../../components/common/Icon';
import './Profile.css';

const MENU = [
  { id: 'branding', label: 'My Branding', sub: 'Manage your branding details', icon: BuildingIcon },
  { id: 'info', label: 'Profile Information', sub: 'Update your personal details', icon: UserIcon },
  { id: 'notifications', label: 'Notification Settings', sub: 'Manage notifications', icon: BellIcon },
];

export default function Profile() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [openMenu, setOpenMenu] = useState(null);

  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [branding, setBranding] = useState({ company_name: '', tagline: '' });
  const [notif, setNotif] = useState({ push_enabled: true, email_enabled: true, sms_enabled: false });

  useEffect(() => {
    axiosClient.get(ENDPOINTS.PROFILE).then((res) => {
      const d = res.data.data;
      setProfile({ name: d.name || '', email: d.email || '', phone: d.phone || '' });
    });
    axiosClient.get(ENDPOINTS.BRANDING).then((res) => {
      const d = res.data.data;
      if (d) setBranding({ company_name: d.company_name || '', tagline: d.tagline || '' });
    });
    axiosClient.get(ENDPOINTS.NOTIFICATION_SETTINGS).then((res) => {
      const d = res.data.data;
      setNotif({ push_enabled: d.push_enabled, email_enabled: d.email_enabled, sms_enabled: d.sms_enabled });
    });
  }, []);

  const toggleMenu = (id) => setOpenMenu((prev) => (prev === id ? null : id));

  const saveProfile = async () => {
    await axiosClient.put(ENDPOINTS.PROFILE, profile);
    setOpenMenu(null);
  };

  const saveBranding = async () => {
    await axiosClient.put(ENDPOINTS.BRANDING, branding);
    setOpenMenu(null);
  };

  const toggleNotif = async (key) => {
    const updated = { ...notif, [key]: !notif[key] };
    setNotif(updated);
    await axiosClient.put(ENDPOINTS.NOTIFICATION_SETTINGS, { [key]: updated[key] });
  };

  return (
    <div className="profile">
      <div className="profile__header">
        <h1 className="profile__page-title">Profile &amp; Branding</h1>
      </div>

      <div className="profile__card">
        <div className="profile__avatar">
          {(profile.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="profile__info">
          <p className="profile__name">{profile.name}</p>
          <p className="profile__email">{profile.email}</p>
          <p className="profile__phone">{profile.phone}</p>
        </div>
      </div>

      <div className="profile__menu">
        {MENU.map((item) => (
          <div key={item.id} className="profile__menu-block">
            <button className="profile__menu-item" onClick={() => toggleMenu(item.id)}>
              <span className="profile__menu-icon"><item.icon size={18} /></span>
              <span className="profile__menu-text">
                <span className="profile__menu-label">{item.label}</span>
                <span className="profile__menu-sub">{item.sub}</span>
              </span>
              <span className={`profile__menu-arrow ${openMenu === item.id ? 'profile__menu-arrow--open' : ''}`}>›</span>
            </button>

            {openMenu === item.id && (
              <div className="profile__panel">
                {item.id === 'branding' && (
                  <>
                    <input className="profile__input" value={branding.company_name} onChange={(e) => setBranding({ ...branding, company_name: e.target.value })} placeholder="Company name" />
                    <input className="profile__input" value={branding.tagline} onChange={(e) => setBranding({ ...branding, tagline: e.target.value })} placeholder="Tagline" />
                    <button className="profile__panel-save" onClick={saveBranding}>Save Branding</button>
                  </>
                )}

                {item.id === 'info' && (
                  <>
                    <input className="profile__input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Name" />
                    <input className="profile__input" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="Email" />
                    <input className="profile__input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="Phone" />
                    <button className="profile__panel-save" onClick={saveProfile}>Save Details</button>
                  </>
                )}

                {item.id === 'notifications' && (
                  <>
                    {[
                      { key: 'push_enabled', label: 'Push Notifications' },
                      { key: 'email_enabled', label: 'Email Alerts' },
                      { key: 'sms_enabled', label: 'SMS Alerts' },
                    ].map((row) => (
                      <label key={row.key} className="profile__toggle-row">
                        <span>{row.label}</span>
                        <input type="checkbox" checked={notif[row.key]} onChange={() => toggleNotif(row.key)} />
                      </label>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="profile__logout" onClick={async () => { navigate('/'); await logout(); }}>
        ⎋ Logout
      </button>

      <BottomNav />
    </div>
  );
}