import { useEffect, useRef, useState } from "react";
import { productImageUrl } from "../../config/api";

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return `$${amount.toFixed(2)}`;
}

function OrderItemImage({ productId, productName }) {
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
    return <div className="orderItemImageFallback">No image</div>;
  }

  if (imageUrl) {
    return <img className="orderItemImage" src={imageUrl} alt={productName || "Ordered product"} />;
  }

  return <div className="orderItemImageFallback">{hasError ? "No image" : "Loading..."}</div>;
}

export function OrderRow({ order }) {
  return (
    <article className="orderRow">
      <div className="orderMetaGrid">
        {order.username ? (
          <p>
            <strong>Customer:</strong> {order.username}
          </p>
        ) : null}
        <p>
          <strong>Order #:</strong> {order.id ?? order.orderId ?? "N/A"}
        </p>
        <p>
          <strong>Total amount:</strong> {formatCurrency(order.totalAmount)}
        </p>
        <p>
          <strong>Placed at:</strong> {order.placedAtLabel}
        </p>
        <p>
          <strong>Address:</strong> {order.address}
        </p>
        <p>
          <strong>Card number:</strong> {order.cardNumber}
        </p>
      </div>

      <div className="orderItemsList">
        {order.items.length === 0 ? <p>No order items available.</p> : null}
        {order.items.map((item) => (
          <div
            className="orderItemInfo"
            key={`${order.id ?? "order"}-${item.productId ?? "np"}-${item.orderedItemId ?? item.name}`}
          >
            <OrderItemImage productId={item.productId} productName={item.name} />
            <p>
              <strong>Name:</strong> {item.name}
            </p>
            <p>
              <strong>Brand:</strong> {item.brand}
            </p>
            <p>
              <strong>Price:</strong> {formatCurrency(item.price)}
            </p>
            <p>
              <strong>Qty:</strong> {item.quantity}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
