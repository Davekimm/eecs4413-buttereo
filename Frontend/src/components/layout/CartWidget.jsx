import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

/** Cart widget. Uses GET /api/cart/items. */
export function CartWidget() {
  const { cartCount } = useCart();

  return (
    <Link className="navButton" to="/cart">
      Cart ({cartCount})
    </Link>
  );
}
