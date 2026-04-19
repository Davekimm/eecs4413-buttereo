import { Navigate } from "react-router-dom";
import { CartItemList } from "../components/cart/CartItemList";
import { CheckoutSummary } from "../components/cart/CheckoutSummary";
import { useAuth } from "../context/AuthContext";

/** Cart page. Uses GET /api/cart/items and POST /api/cart/place-order. */
export function CartPage() {
  const { isSignedIn, isAdmin, profileLoaded } = useAuth();

  if (isSignedIn && profileLoaded && isAdmin) {
    return <Navigate to="/admin/inventory" replace />;
  }

  return (
    <section className="simplePage">
      <h1>Cart</h1>
      <div className="cartGrid">
        <CartItemList />
        <CheckoutSummary />
      </div>
    </section>
  );
}
