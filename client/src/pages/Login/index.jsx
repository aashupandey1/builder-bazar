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
      await axiosClient.post(ENDPOINTS.SEND_OTP, { mobile });
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
          <span className="login__google-icon">G</span>
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
            <input className="login__input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6} />

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