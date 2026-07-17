import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Downloads.css';

const QUALITY_OPTIONS = ['HD 1080p', 'Full HD 2K', 'Ultra HD 4K'];

export default function Downloads() {
  const [quality, setQuality] = useState('HD 1080p');
  const navigate = useNavigate();

  return (
    <div className="downloadpage">
      <div className="downloadpage__header">
        <button className="downloadpage__back" onClick={() => navigate(-1)} aria-label="Back">←</button>
        <h1 className="downloadpage__title">Download</h1>
        <span style={{ width: 36 }} />
      </div>

      <div className="downloadpage__media">
        <div className="downloadpage__logo">YOUR<br />LOGO</div>
        <p className="downloadpage__eyebrow">LIVE THE</p>
        <h2 className="downloadpage__headline">LUXURY</h2>
        <p className="downloadpage__eyebrow">YOU DESERVE</p>
        <span className="downloadpage__duration">00:30</span>
      </div>

      <p className="downloadpage__label">Choose Quality</p>
      <div className="downloadpage__options">
        {QUALITY_OPTIONS.map((q) => (
          <label key={q} className="downloadpage__option">
            <input
              type="radio"
              name="quality"
              checked={quality === q}
              onChange={() => setQuality(q)}
            />
            {q}
          </label>
        ))}
      </div>
      <div className="downloadpage__actions">
        <button className="downloadpage__submit" onClick={() => navigate('/share')}>
          Download Now
        </button>
        <button className="share__submit" onClick={() => navigate('/share')}>
          Share Now
        </button>
      </div>
    </div>
  );
}
