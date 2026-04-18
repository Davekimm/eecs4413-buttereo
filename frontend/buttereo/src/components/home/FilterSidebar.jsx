import { SearchBar } from "../layout/SearchBar";
import { PRODUCT_CATEGORIES } from "../../constants/productCategories";

export function FilterSidebar({
  filters,
  searchDraft,
  onSearchDraftChange,
  onSearchSubmit,
  onCategoryChange,
  onToggleSortName,
  onToggleSortPrice,
  onReset,
}) {
  const { category, sortNameAsc, sortPriceAsc } = filters;

  return (
    <aside className="panelBox filterPanel">

      <div className="filterPanelSearch">
        <p className="filterGroupTitle">Search</p>
        <form
          className="filterSearchForm"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
        >
          <SearchBar value={searchDraft} onChange={onSearchDraftChange} />
          <button type="submit" className="filterOptionButton filterSearchSubmitButton">
            Search
          </button>
        </form>
      </div>
      
      <div className="filterGroup">
        <p className="filterGroupTitle">Category</p>
        <div className="filterButtonStack">
          <button
            type="button"
            className={`filterOptionButton${category === "" ? " filterOptionButtonActive" : ""}`}
            onClick={() => onCategoryChange("")}
          >
            All
          </button>
          {PRODUCT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filterOptionButton${category === cat ? " filterOptionButtonActive" : ""}`}
              onClick={() => onCategoryChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="filterGroup">
        <p className="filterGroupTitle">Sort</p>
        <div className="filterButtonStack filterButtonStackRow">
          <button
            type="button"
            className={`filterOptionButton${sortNameAsc ? " filterOptionButtonActive" : ""}`}
            onClick={onToggleSortName}
          >
            Sort by name (A–Z)
          </button>
          <button
            type="button"
            className={`filterOptionButton${sortPriceAsc ? " filterOptionButtonActive" : ""}`}
            onClick={onToggleSortPrice}
          >
            Sort by price (low–high)
          </button>
        </div>
      </div>

      <button type="button" className="filterResetButton" onClick={onReset}>
        Reset filters
      </button>
    </aside>
  );
}
