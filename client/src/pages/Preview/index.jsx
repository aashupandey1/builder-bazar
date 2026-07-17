import { useNavigate, useLocation } from 'react-router-dom';
import './Preview.css';


const isVideoTag = (tag) => tag === 'Video' || tag === 'Reel';
export default function Preview() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="preview">
        <div className="preview__header">
          <button
            className="preview__icon-btn"
            onClick={() => navigate(-1)}
          >
            ←
          </button>

          <h1 className="preview__title">Content Preview</h1>
        </div>

        <div
          style={{
            padding: "40px",
            textAlign: "center",
          }}
        >
          No content selected.
        </div>
      </div>
    );
  }

  return (
    <div className="preview">
      <div className="preview__header">
        <button
          className="preview__icon-btn"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          ←
        </button>

        <h1 className="preview__title">
          {state.title}
        </h1>

        <button
          className="preview__icon-btn"
          aria-label="Favorite"
        >
          ♡
        </button>
      </div>

      <div className="preview__media">

        <span className="preview__badge">
          {state.type}
        </span>

        {isVideoTag(state.type) ? (
          <video className="preview__video" src={state.file_url} controls autoPlay loop muted playsInline />
        ) : (
          <img className="preview__image" src={state.file_url} alt={state.title} />
        )}

      </div>

      <div className="preview__actions">
        <button className="preview__btn preview__btn--outline preview__btn--disabled" disabled title="Coming soon">
          Customize
        </button>

        <button
          className="preview__btn preview__btn--primary"
          onClick={() => navigate('/share', { state })}
        >
          Share Now
        </button>
      </div>
    </div>
  );
}