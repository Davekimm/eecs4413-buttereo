import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ACCOUNT_API_URL, ORDER_RECENT_API_URL } from "../../config/api";
import { normalizeOrderForCheckoutSummary } from "../../utils/orderDto";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const POST_LOGIN_REDIRECT_KEY = "buttereoPostLoginRedirect";

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return `$${amount.toFixed(2)}`;
}

export function CheckoutSummary() {
  const navigate = useNavigate();
  const { isSignedIn, role } = useAuth();
  const { cartItems, cartCount, reloadCart } = useCart();
  const [address, setAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState("");

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );
  const isGuestCheckout = !isSignedIn;
  const isCustomer = !isSignedIn || role === "USER";
  const hasCheckoutInfo = Boolean(address.trim()) && cardNumber.trim().length >= 4;

  useEffect(() => {
    if (!isSignedIn) {
      setAddress("");
      setCardNumber("");
      setProfileError("");
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setProfileError("");
      try {
        const response = await fetch(ACCOUNT_API_URL, {
          method: "GET",
          credentials: "include",
        });
        const text = await response.text();
        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setProfileError(text || "Please log in to place an order.");
          return;
        }

        const user = JSON.parse(text);
        setAddress(user?.address ?? "");
        setCardNumber(user?.cardNumber ?? "");
      } catch {
        if (!cancelled) {
          setProfileError("Could not load checkout info.");
        }
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  async function handlePlaceOrder() {
    if (cartItems.length === 0 || !isCustomer) {
      return;
    }

    if (isGuestCheckout) {
      localStorage.setItem(POST_LOGIN_REDIRECT_KEY, "/cart");
      navigate("/login");
      return;
    }

    if (!hasCheckoutInfo) {
      return;
    }

    const submittedAddress = address.trim();
    const submittedCard = cardNumber.trim();
    setPlaceOrderError("");
    setIsPlacingOrder(true);

    const orderRequest = {
      address: submittedAddress,
      cardNumber: submittedCard,
    };

    try {
      const createResponse = await fetch(ORDER_RECENT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderRequest),
      });
      const createText = await createResponse.text();

      if (!createResponse.ok) {
        throw new Error(createText || "Could not place an order. Please check the quantities of the products.");
      }
      
      let createdOrder = null;
      if (createText) {
        try {
          createdOrder = JSON.parse(createText);
        } catch {
          createdOrder = null;
        }
      }
      

      const getResponse = await fetch(ORDER_RECENT_API_URL, {
        method: "GET",
        credentials: "include",
      });
      const getText = await getResponse.text();
      let fetchedOrder = null;
      if (getText) {
        try {
          fetchedOrder = JSON.parse(getText);
        } catch {
          fetchedOrder = null;
        }
      }
      if (!getResponse.ok) {
        throw new Error(getText || "Could not load order after checkout.");
      }

      const summary =
        normalizeOrderForCheckoutSummary(createdOrder) ?? normalizeOrderForCheckoutSummary(fetchedOrder);
      if (!summary || !summary.items.length) {
        throw new Error("Order was placed but the summary could not be displayed.");
      }

      await reloadCart();
      navigate("/checkout/confirmation", { state: summary });
    } catch (error) {
      setPlaceOrderError(error.message || "Could not place order.");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  return (
    <aside className="panelBox">
      <h2 className="panelTitle">Checkout Summary</h2>
      <p>Total items: {cartCount}</p>
      <p>Subtotal: {formatCurrency(subtotal)}</p>
      {isGuestCheckout ? (
        <p>Please sign in to complete checkout.</p>
      ) : (
        <>
          <label className="formField" htmlFor="checkout-address">
            Billing address
            <input
              id="checkout-address"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              disabled={isPlacingOrder}
            />
          </label>
          <label className="formField" htmlFor="checkout-card">
            Billing card number
            <input
              id="checkout-card"
              type="text"
              value={cardNumber}
              onChange={(event) => setCardNumber(event.target.value)}
              disabled={isPlacingOrder}
            />
          </label>
        </>
      )}
      {profileError ? <p className="formError">{profileError}</p> : null}
      {placeOrderError ? <p className="formError">{placeOrderError}</p> : null}
      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={
          isPlacingOrder ||
          cartItems.length === 0 ||
          !isCustomer ||
          (!isGuestCheckout && !hasCheckoutInfo)
        }
      >
        {isPlacingOrder ? "Placing order..." : isGuestCheckout ? "Sign in to checkout" : "Place an order"}
      </button>
    </aside>
  );
}
