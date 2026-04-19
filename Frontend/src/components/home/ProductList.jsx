import { useEffect, useState } from "react";
import { productFilterUrl } from "../../config/api";
import { ProductCard } from "./ProductCard";

/** Product list. Uses GET /api/product/filter. */
export function ProductList({ filters }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const keyword = filters?.keyword ?? "";
  const category = filters?.category ?? "";
  const sortNameAsc = Boolean(filters?.sortNameAsc);
  const sortPriceAsc = Boolean(filters?.sortPriceAsc);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setErrorMessage("");
      setIsLoading(true);
      try {
        const url = productFilterUrl({    // Fetech entire prodcuts by default
          keyword,
          category,
          sortNameAsc,
          sortPriceAsc,
        });
        const response = await fetch(url, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Could not load products.");
        }

        const data = await response.json();
        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message || "Could not load products.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [keyword, category, sortNameAsc, sortPriceAsc]);

  if (isLoading) {
    return <p>Loading products...</p>;
  }

  if (errorMessage) {
    return <p className="formError">{errorMessage}</p>;
  }

  if (products.length === 0) {
    const hasActiveFilter =
      (keyword && keyword.length > 0) ||
      (category && category.length > 0) ||
      sortNameAsc ||
      sortPriceAsc;
    return (
      <p>{hasActiveFilter ? "No products match." : "No products available yet."}</p>
    );
  }

  return (
    <div className="productList">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
