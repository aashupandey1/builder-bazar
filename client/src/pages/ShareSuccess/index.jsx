import { useNavigate } from 'react-router-dom';
import './ShareSuccess.css';

export default function ShareSuccess() {
  const navigate = useNavigate();

  return (
    <div className="sharesuccess">
      <div className="sharesuccess__check">✓</div>
      <h1 className="sharesuccess__title">Shared Successfully!</h1>
      <p className="sharesuccess__subtitle">
        Your content has been shared
        <br />
        and is ready to grow your business.
      </p>

      <div className="sharesuccess__actions">
        <button className="sharesuccess__btn sharesuccess__btn--primary" onClick={() => navigate('/my-studio')}>
          View in My Studio
        </button>
        <button className="sharesuccess__btn sharesuccess__btn--outline" onClick={() => navigate('/dashboard')}>
          Share Another
        </button>
      </div>
    </div>
  );
}
