import { ProductList } from "./ProductList";

/** Product section. Uses GET /api/product/filter. */
export function ProductSection({ filters }) {
  return (
    <section className="panelBox productPanel">
      <ProductList filters={filters} />
    </section>
  );
}
