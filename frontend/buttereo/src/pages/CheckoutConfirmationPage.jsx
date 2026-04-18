import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { productImageUrl } from "../config/api";

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "$0.00";
  }
  return `$${amount.toFixed(2)}`;
}

function formatPlacedAt(value) {
  if (value == null || value === "") {
    return "";
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [y, month, day, hour = 0, minute = 0, second = 0] = value;
    const date = new Date(y, month - 1, day, hour, minute, second);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString();
    }
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString();
}

function CheckoutProductImage({ productId, productName }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [hasError, setHasError] = useState(false);
  const urlRef = useRef(null);

  const numericProductId = Number(productId);
  const shouldLoadImage = Number.isFinite(numericProductId);

  useEffect(() => {
    let cancelled = false;

    async function loadImage() {
      setImageUrl(null);
      setHasError(false);

      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }

      if (!shouldLoadImage) {
        return;
      }

      try {
        const response = await fetch(productImageUrl(numericProductId), {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Image request failed");
        }

        const blob = await response.blob();
        const nextUrl = URL.createObjectURL(blob);

        if (cancelled) {
          URL.revokeObjectURL(nextUrl);
          return;
        }

        urlRef.current = nextUrl;
        setImageUrl(nextUrl);
      } catch {
        if (!cancelled) {
          setHasError(true);
        }
      }
    }

    loadImage();

    return () => {
      cancelled = true;
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, [numericProductId, shouldLoadImage]);

  if (!shouldLoadImage) {
    return <div className="checkoutItemImageFallback">No image</div>;
  }

  if (imageUrl) {
    return <img className="checkoutItemImage" src={imageUrl} alt={productName || "Ordered product"} />;
  }

  return <div className="checkoutItemImageFallback">{hasError ? "No image" : "Loading..."}</div>;
}

export function CheckoutConfirmationPage() {
  const { state } = useLocation();

  if (!state || !Array.isArray(state.items)) {
    return <Navigate to="/cart" replace />;
  }

  const totalAmount = Number.isFinite(Number(state.totalAmount))
    ? Number(state.totalAmount)
    : Number(state.subtotal) || 0;

  return (
    <section className="simplePage checkoutPage">
      <h1>Order Confirmed</h1>
      <div className="panelBox checkoutPanel">
        <h3>Thank you. Your order has been placed successfully.</h3>
        {state.orderId != null ? <p>Order number: {state.orderId}</p> : null}
        <p>Total items: {state.totalItems ?? 0}</p>
        <p>Total: {formatCurrency(totalAmount)}</p>
        <p>Shipping address: {state.address || "N/A"}</p>
        <p>Card ending: {state.cardLastFour || "N/A"}</p>
        <p>Placed at: {formatPlacedAt(state.placedAt) || "N/A"}</p>
      </div>

      <section className="panelBox checkoutPanel">
        <h2 className="panelTitle">Ordered Items</h2>
        <div className="checkoutItemsList">
          {state.items.map((item, index) => (
            <article
              className="checkoutItemRow"
              key={`${item.productId ?? "np"}-${item.orderedItemId ?? index}-${item.name}`}
            >
              <CheckoutProductImage productId={item.productId} productName={item.name} />
              <strong>{item.name}</strong>
              <span>Brand: {item.brand || "N/A"}</span>
              <span>Qty: {item.quantity}</span>
              <span>Price: {formatCurrency(item.price)}</span>
            </article>
          ))}
        </div>
      </section>

      <Link className="smallButton checkoutHomeButton" to="/">
        Back to Home
      </Link>
    </section>
  );
}
