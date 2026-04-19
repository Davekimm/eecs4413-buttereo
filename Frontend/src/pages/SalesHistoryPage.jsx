import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderAdminSalesHistoryUrl } from "../config/api";
import { PRODUCT_CATEGORIES } from "../constants/productCategories";
import { OrderRow } from "../components/account/OrderRow";
import { normalizeOrderForDisplay } from "../utils/orderDto";

function createEmptyFilters() {
  return {
    startDate: "",
    endDate: "",
    productName: "",
    categoryName: "",
  };
}

/** Admin sales history page. Uses GET /api/order/admin/sales-history. */
export function SalesHistoryPage() {
  const [filters, setFilters] = useState(createEmptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(createEmptyFilters);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadSalesHistory = useCallback(async (nextApplied) => {
    setIsLoading(true);
    setLoadError("");
    try {
      const url = orderAdminSalesHistoryUrl({
        startDate: nextApplied.startDate,
        endDate: nextApplied.endDate,
        productName: nextApplied.productName,
        categoryName: nextApplied.categoryName,
      });
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(text || "Could not load sales history.");
      }
      let payload;
      try {
        payload = text.trim() ? JSON.parse(text) : [];
      } catch {
        throw new Error("Unexpected response from server.");
      }
      const raw = Array.isArray(payload) ? payload : payload ? [payload] : [];
      const normalized = raw
        .map(normalizeOrderForDisplay)
        .filter(Boolean)
        .sort((a, b) => b.placedAtMs - a.placedAtMs);
      setOrders(normalized);
    } catch (err) {
      setOrders([]);
      setLoadError(err.message || "Could not load sales history.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSalesHistory(appliedFilters);
  }, [appliedFilters, loadSalesHistory]);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }

  function handleApply(event) {
    event.preventDefault();
    setAppliedFilters({ ...filters });
  }

  function handleClear() {
    const next = createEmptyFilters();
    setFilters(next);
    setAppliedFilters({ ...next });
  }

  const hasActiveFilters = Boolean(
    appliedFilters.startDate.trim() ||
      appliedFilters.endDate.trim() ||
      appliedFilters.productName.trim() ||
      appliedFilters.categoryName.trim(),
  );

  return (
    <section className="simplePage inventoryPage">
      <div className="salesHistoryHeader">
        <h1>Sales history</h1>
      </div>
      
      <form className="panelBox salesHistoryFilters" onSubmit={handleApply}>
        <p className="panelTitle">Filters</p>
        <div className="salesHistoryFilterGrid">
          <label className="formField">
            Start date
            <input
              type="datetime-local"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </label>
          <label className="formField">
            End date
            <input type="datetime-local" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </label>
          <label className="formField">
            Product name contains
            <input
              type="text"
              name="productName"
              value={filters.productName}
              onChange={handleFilterChange}
              placeholder="e.g. laptop"
            />
          </label>
          <label className="formField">
            Category (exact match)
            <select name="categoryName" value={filters.categoryName} onChange={handleFilterChange}>
              <option value="">Any category</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="salesHistoryFilterActions">
          <button className="loginSubmit" type="submit" disabled={isLoading}>
            Apply filters
          </button>
          <button type="button" className="navButton" onClick={handleClear} disabled={isLoading}>
            Clear filters
          </button>
        </div>
      </form>

      <section className="panelBox">
        <p className="panelTitle">Orders</p>
        {isLoading ? <p className="profileInfoStatus">Loading…</p> : null}
        {!isLoading && loadError ? <p className="profileInfoError">{loadError}</p> : null}
        {!isLoading && !loadError && !hasActiveFilters ? (
          <p className="profileInfoStatus">Recent orders</p>
        ) : null}
        {/* {!isLoading && !loadError && hasActiveFilters ? (
          <p className="profileInfoStatus">Filtered results.</p>
        ) : null} */}
        {!isLoading && !loadError && orders.length === 0 ? <p>No orders match the current criteria.</p> : null}
        {!isLoading && !loadError && orders.length > 0 ? (
          <div className="orderHistoryList">
            <p className="profileInfoStatus">Showing {orders.length} orders.</p>
            {orders.map((order) => (
              <OrderRow key={order.id ?? order.placedAtMs} order={order} />
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}
