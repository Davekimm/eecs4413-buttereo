export function SearchBar({ value, onChange }) {
  return (
    <div className="searchWrap">
      <input
        id="global-search"
        className="searchInput"
        type="search"
        placeholder="Search products..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
