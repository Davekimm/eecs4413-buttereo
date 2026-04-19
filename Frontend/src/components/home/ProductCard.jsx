import { ProductCardImage } from "./ProductCardImage";
import { Link } from "react-router-dom";

/** Product card. Uses GET /api/product/image. */
export function ProductCard({ product }) {
  const priceText = Number.isFinite(Number(product.price))
    ? `$${Number(product.price).toFixed(2)}`
    : "$0.00";

  return (
    <article className="productCard">
      <ProductCardImage productId={product.id} />
      <p>{product.brand}</p>
      <h3 className="productCardTitle">{product.name}</h3>
      <p>{priceText}</p>
      <Link className="smallButton" to={`/product/${product.id}`} state={{ product }} >
        View Details
      </Link>
    </article>
  );
}
