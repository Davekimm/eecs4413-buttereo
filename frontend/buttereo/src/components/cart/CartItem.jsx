import { useEffect, useRef, useState } from "react";
import { productCheckAvailabilityUrl, productImageUrl } from "../../config/api";
import { useCart } from "../../context/CartContext";

function formatPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return `$${amount.toFixed(2)}`;
}

export function CartItem({ item }) {
  const { updateCartItemQuantity, removeFromCart } = useCart();
  const [draftQuantity, setDraftQuantity] = useState(item.quantity);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrlRef = useRef(null);

  useEffect(() => {
    setDraftQuantity(item.quantity);
  }, [item.quantity]);

  useEffect(() => {
    let cancelled = false;

    async function loadImage() {
      setHasImageError(false);
      setImageUrl(null);

      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = null;
      }

      try {
        const response = await fetch(productImageUrl(item.productId), {
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

        imageUrlRef.current = nextUrl;
        setImageUrl(nextUrl);
      } catch {
        if (!cancelled) {
          setHasImageError(true);
        }
      }
    }

    loadImage();

    return () => {
      cancelled = true;
      if (imageUrlRef.current) {
        URL.revokeObjectURL(imageUrlRef.current);
        imageUrlRef.current = null;
      }
    };
  }, [item.productId]);

  async function handleUpdateQuantity() {
    const quantity = Number(draftQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setErrorMessage("Quantity must be at least 1.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const availabilityResponse = await fetch(productCheckAvailabilityUrl(item.productId, quantity), {
        method: "GET",
        credentials: "include",
      });

      if (!availabilityResponse.ok) {
        setDraftQuantity(item.quantity);
        setErrorMessage("Quantity exceeds current inventory. Please choose a lower quantity.");
        return;
      }

      await updateCartItemQuantity(item.productId, quantity);
    } catch (error) {
      setErrorMessage(error.message || "Could not update quantity.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveItem() {
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await removeFromCart(item.productId);
    } catch (error) {
      setErrorMessage(error.message || "Could not remove item.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className="cartItem">
      <div className="cartItemMain">
        {imageUrl ? (
          <img className="cartItemImage" src={imageUrl} alt={item.name || "Product image"} />
        ) : (
          <div className="cartItemImageFallback">{hasImageError ? "No image" : "Loading..."}</div>
        )}
        <strong>{item.name}</strong>
        <span>Brand: {item.brand || "N/A"}</span>
        <span>Price: {formatPrice(item.price)}</span>
      </div>

      <div className="cartItemActions">
        <label htmlFor={`cart-qty-${item.productId}`}>Qty</label>
        <input
          id={`cart-qty-${item.productId}`}
          type="number"
          min="1"
          value={draftQuantity}
          onChange={(event) => setDraftQuantity(event.target.value)}
          disabled={isSubmitting}
        />
        <button type="button" onClick={handleUpdateQuantity} disabled={isSubmitting}>
          Update
        </button>
        <button type="button" onClick={handleRemoveItem} disabled={isSubmitting}>
          Remove
        </button>
      </div>

      {errorMessage ? <p className="formError">{errorMessage}</p> : null}
    </article>
  );
}
