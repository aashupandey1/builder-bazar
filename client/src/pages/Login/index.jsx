import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { ENDPOINTS } from '../../api/endpoints';
import logo from '../../assets/logos/logo.png';
import './Login.css';

const GOOGLE_LOGIN_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
const REDIRECT_KEY = 'bb_redirect_after_login';

export default function Login() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const from = state?.from?.pathname || '/dashboard';

  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = () => {
    localStorage.setItem(REDIRECT_KEY, from);
    window.location.href = GOOGLE_LOGIN_URL;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!mobile.trim()) { setError('Mobile number required'); return; }
    setError('');
    setSending(true);
    try {
      const res = await axiosClient.post(ENDPOINTS.SEND_OTP, { mobile });
      if (res.data.devOtp) {
        alert(`Testing OTP: ${res.data.devOtp}`);
      }
      setStep('otp');
    } catch {
      setError('Could not send OTP, try again.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) { setError('Enter the OTP'); return; }
    setError('');
    setVerifying(true);
    try {
      const res = await axiosClient.post(ENDPOINTS.VERIFY_OTP, { mobile, otp, name, email });
      localStorage.setItem('bb_token', res.data.data.token);
      window.location.href = from; // full reload so AuthContext picks up the fresh token
    } catch {
      setError('Invalid or expired OTP.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="login">
      <div className="login__card">
        <img src={logo} alt="Builder Bazar" className="login__logo" />
        <h1 className="login__title">Welcome Back</h1>
        <p className="login__subtitle">Sign in to continue to your account</p>

        <button className="login__google-btn" onClick={handleGoogleLogin} type="button">
          <svg className="login__google-icon" viewBox="0 0 48 48" width="20" height="20">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.5-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 36 26.9 37 24 37c-5.3 0-9.7-3.1-11.3-7.6l-6.6 5C9.6 40.6 16.2 45 24 45z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.6 5.4C41.5 35.8 45 30.4 45 24c0-1.4-.1-2.5-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>

        <div className="login__divider"><span>OR</span></div>

        {step === 'form' ? (
          <form onSubmit={handleSendOtp}>
            <label className="login__label">Full Name</label>
            <input className="login__input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />

            <label className="login__label">Email Address</label>
            <input className="login__input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" />

            <label className="login__label">Mobile Number</label>
            <input className="login__input" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Enter your mobile number" />

            {error && <p className="login__error">{error}</p>}

            <button className="login__submit-btn" type="submit" disabled={sending}>
              {sending ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <label className="login__label">Enter OTP sent to {mobile}</label>
            <input
              className="login__input"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="6-digit code"
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
              type="tel"
            />

            {error && <p className="login__error">{error}</p>}

            <button className="login__submit-btn" type="submit" disabled={verifying}>
              {verifying ? 'Verifying...' : 'Verify & Continue'}
            </button>
            <button className="login__resend-btn" type="button" onClick={handleSendOtp}>Resend OTP</button>
          </form>
        )}

        <p className="login__footer-note">🔒 Secure login with Google</p>
        <p className="login__terms">By continuing, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
}