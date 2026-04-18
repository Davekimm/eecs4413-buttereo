import { useCallback, useEffect, useState } from "react";
import { ADMIN_INVENTORY_API, PRODUCT_LIST_URL } from "../config/api";
import { InventoryProductPanel } from "../components/inventory/InventoryProductPanel";

/** Admin inventory hub. Product list uses GET /api/product/all. */
export function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loadError, setLoadError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoadError("");
    try {
      const response = await fetch(PRODUCT_LIST_URL, { credentials: "include" });
      if (!response.ok) {
        throw new Error("Could not load products.");
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setLoadError("Could not load products. Is the server running?");
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <section className="simplePage inventoryPage">
      <h1>Inventory</h1>
      
      {loadError ? <p className="formError">{loadError}</p> : null}
      <InventoryProductPanel products={products} onReload={loadProducts} />
    </section>
  );
}
