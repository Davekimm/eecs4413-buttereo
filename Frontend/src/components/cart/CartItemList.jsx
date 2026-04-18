import { CartItem } from "./CartItem";
import { useCart } from "../../context/CartContext";

export function CartItemList() {
  const { cartItems, isCartLoading, cartError } = useCart();

  return (
    <section className="panelBox">
      <p className="panelTitle">Cart Items</p>
      {isCartLoading ? <p>Loading cart...</p> : null}
      {cartError ? <p className="formError">{cartError}</p> : null}
      {!isCartLoading && !cartError && cartItems.length === 0 ? (
        <p>Your cart is currently empty.</p>
      ) : null}
      {!isCartLoading && cartItems.length > 0
        ? cartItems.map((item) => <CartItem key={item.productId} item={item} />)
        : null}
    </section>
  );
}
