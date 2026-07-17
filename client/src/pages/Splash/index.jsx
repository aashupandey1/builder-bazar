import logo from '../../assets/logos/logo.png';
import skyline from '../../assets/images/splash-skyline.png';
import "./splash.css";

const GOOGLE_LOGIN_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;

export default function Splash() {

  return (
    <div className="splash">
      <div className="splash__inner">

        <div className="splash__content">
          <div className="splash__logo-icon">
            <img src={logo} alt="Builder Bazar" className="splash__logo-img" />
          </div>

          <h1 className="splash__title">Builder Bazar</h1>

          <p className="splash__subtitle">Marketing Studio</p>

          <h2 className="splash__tagline">
            Create. Brand. Share.
            <br />
            All in One Place.
          </h2>

          <p className="splash__description">
            Marketing content made simple
            <br />
            for real estate professionals.
          </p>
        </div>

        <div className="splash__skyline">
          <img src={skyline} alt="Skyline" className="splash__skyline-img" />
        </div>

        <div className="splash__actions">
          <div className="splash__actions">
            <button
              className="splash__btn splash__btn--primary"
              onClick={() => { window.location.href = GOOGLE_LOGIN_URL; }}
            >
              Get Started
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}