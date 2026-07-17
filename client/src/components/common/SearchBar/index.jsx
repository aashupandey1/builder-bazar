import './SearchBar.css';

export default function SearchBar({
  placeholder = 'Search projects, content, etc...',
  value = '',
  onChange,
}) {
  return (
    <div className="searchbar">
      <svg viewBox="0 0 24 24" className="searchbar__icon" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        className="searchbar__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
      {/* <button className="searchbar__filter" aria-label="Filter">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
        </svg>
      </button> */}
    </div>
  );
}