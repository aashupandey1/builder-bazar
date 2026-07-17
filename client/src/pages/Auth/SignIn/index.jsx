import './SignIn.css';

const GOOGLE_LOGIN_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;

export default function SignIn() {
  return (
    <div className="auth">
      <h2 className="auth__welcome">Welcome! 👋</h2>
      <p className="auth__subtext">Sign in to continue</p>
      <a href={GOOGLE_LOGIN_URL} className="auth__google-btn">
        Continue with Google
      </a>
    </div>
  );
}
