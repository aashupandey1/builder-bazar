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

    window.history.replaceState({}, '', '/oauth-success');

    const redirectTo = localStorage.getItem('bb_redirect_after_login') || '/dashboard';
    localStorage.removeItem('bb_redirect_after_login');

    navigate(token ? redirectTo : '/login', { replace: true });
    if (token) window.location.href = redirectTo;
  }, [navigate]);

  return null;
}