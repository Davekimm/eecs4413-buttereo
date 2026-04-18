import { ProductList } from "./ProductList";

export function ProductSection({ filters }) {
  return (
    <section className="panelBox productPanel">
      <ProductList filters={filters} />
    </section>
  );
}
