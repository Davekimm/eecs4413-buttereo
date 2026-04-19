import { useEffect, useState } from "react";
import { ORDER_ALL_API_URL } from "../../config/api";
import { normalizeOrderForDisplay } from "../../utils/orderDto";
import { OrderRow } from "./OrderRow";

/** Order history. Uses GET /api/order/admin/all. */
export function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetch(ORDER_ALL_API_URL, {
          method: "GET",
          credentials: "include",
        });
        const text = await response.text();
        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setLoadError(text || "Could not load order history.");
          return;
        }

        if (!text.trim()) {
          setOrders([]);
          return;
        }

        let payload;
        try {
          payload = JSON.parse(text);
        } catch {
          setLoadError("Unexpected response while loading order history.");
          return;
        }

        const rawOrders = Array.isArray(payload) ? payload : payload ? [payload] : [];
        const normalizedOrders = rawOrders
          .map(normalizeOrderForDisplay)
          .filter(Boolean)
          .sort((left, right) => right.placedAtMs - left.placedAtMs);

        setOrders(normalizedOrders);
      } catch {
        if (!cancelled) {
          setLoadError("Network error while loading order history.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="panelBox">
      <p className="panelTitle">Orders</p>
      {isLoading ? <p className="profileInfoStatus">Loading order history...</p> : null}
      {!isLoading && loadError ? <p className="profileInfoError">{loadError}</p> : null}
      {!isLoading && !loadError && orders.length === 0 ? <p>No orders yet.</p> : null}
      {!isLoading && !loadError ? (
        <div className="orderHistoryList">
          {orders.map((order) => (
            <OrderRow key={order.id ?? order.placedAtMs} order={order} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
