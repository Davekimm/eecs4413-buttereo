import { useCallback, useState } from "react";
import { FilterSidebar } from "../components/home/FilterSidebar";
import { ProductSection } from "../components/home/ProductSection";
import { useAuth } from "../context/AuthContext";

const defaultFilters = {
  keyword: "",
  category: "",
  sortNameAsc: false,
  sortPriceAsc: false,
};

export function HomePage() {
  const { welcomeText } = useAuth();
  const [filters, setFilters] = useState(defaultFilters);
  const [searchDraft, setSearchDraft] = useState("");

  const setCategory = useCallback((category) => {
    setFilters((prev) => ({ ...prev, category: category || "" }));
  }, []);

  const applySearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, keyword: searchDraft.trim() }));
  }, [searchDraft]);

  const toggleSortName = useCallback(() => {
    setFilters((prev) => {
      const nextSortNameAsc = !prev.sortNameAsc;
      return {
        ...prev,
        sortNameAsc: nextSortNameAsc,
        sortPriceAsc: nextSortNameAsc ? false : prev.sortPriceAsc,
      };
    });
  }, []);

  const toggleSortPrice = useCallback(() => {
    setFilters((prev) => {
      const nextSortPriceAsc = !prev.sortPriceAsc;
      return {
        ...prev,
        sortPriceAsc: nextSortPriceAsc,
        sortNameAsc: nextSortPriceAsc ? false : prev.sortNameAsc,
      };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setSearchDraft("");
    setFilters(defaultFilters);
  }, []);

  return (
    <section className="homePage">
      <h1 className="brandTitle">Buttereo</h1>
      <br/><br/>
      <h2 className="welcomeTitle">{welcomeText}</h2>
      <br/><br/>

      <div className="homeGrid">
        <FilterSidebar
          filters={filters}
          searchDraft={searchDraft}
          onSearchDraftChange={setSearchDraft}
          onSearchSubmit={applySearch}
          onCategoryChange={setCategory}
          onToggleSortName={toggleSortName}
          onToggleSortPrice={toggleSortPrice}
          onReset={resetFilters}
        />
        <ProductSection filters={filters} />
      </div>
    </section>
  );
}
