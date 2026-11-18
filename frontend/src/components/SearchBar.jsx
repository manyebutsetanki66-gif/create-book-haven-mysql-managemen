// A controlled search box used above the book and user tables.
export default function SearchBar({ value, onChange, placeholder, label }) {
  return (
    <div className="search-bar">
      <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
      <input
        type="search"
        className="form-control"
        placeholder={placeholder}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
