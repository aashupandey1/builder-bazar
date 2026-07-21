import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('bb_token', token);
    }

    // URL se token hata do taaki history/address bar me na dikhe
    window.history.replaceState({}, '', '/oauth-success');

    navigate(token ? '/dashboard' : '/login', { replace: true });
    // reload zaroori hai taaki AuthContext naye token ke saath /me call kare
    if (token) window.location.href = '/dashboard';
  }, [navigate]);

  return null;
}