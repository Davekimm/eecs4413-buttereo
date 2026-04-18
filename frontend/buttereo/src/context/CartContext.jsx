/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { cartAddUrl, cartClearUrl, cartItemsUrl, cartRemoveUrl, cartUpdateUrl } from "../config/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const GUEST_CART_KEY = "buttereoGuestCart";

function normalizeCartItem(item) {
  const product = item?.product ?? {};
  const rawQuantity = Number(item?.quantity);
  const quantity = Number.isFinite(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1;
  const productId = Number(product?.id ?? item?.productId);

  if (!Number.isFinite(productId)) {
    return null;
  }

  const name = product?.name || item?.name || "Unnamed Product";
  const brand = product?.brand || item?.brand || "N/A";
  const price = Number.isFinite(Number(product?.price))
    ? Number(product.price)
    : Number.isFinite(Number(item?.price))
      ? Number(item.price)
      : 0;

  return {
    id: Number(item?.id ?? productId),
    productId,
    name,
    brand,
    price,
    quantity,
  };
}

function normalizeGuestCartItem(item) {
  const productId = Number(item?.productId);
  const quantity = Number(item?.quantity);
  if (!Number.isFinite(productId) || !Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }

  return {
    id: Number(item?.id ?? productId),
    productId,
    name: item?.name || "Unnamed Product",
    brand: item?.brand || "N/A",
    price: Number.isFinite(Number(item?.price)) ? Number(item.price) : 0,
    quantity,
  };
}

function readGuestCartItems() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeGuestCartItem).filter(Boolean);
  } catch {
    return [];
  }
}

function writeGuestCartItems(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const { isSignedIn, profileLoaded, role } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");
  const isBackendCartEnabled = isSignedIn && profileLoaded && role === "USER";

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  async function loadCartItems() {
    setCartError("");
    setIsCartLoading(true);
    try {
      const response = await fetch(cartItemsUrl, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 404) {
        setCartItems([]);
        return;
      }

      if (!response.ok) {
        throw new Error("Could not load cart items.");
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        setCartItems([]);
        return;
      }

      const normalized = data.map(normalizeCartItem).filter(Boolean);
      setCartItems(normalized);
    } catch (error) {
      setCartError(error.message || "Could not load cart items.");
    } finally {
      setIsCartLoading(false);
    }
  }

  async function addToCart(product, quantity) {
    const productId = Number(product?.id);
    const amount = Number(quantity);

    if (!Number.isFinite(productId) || !Number.isFinite(amount) || amount <= 0) {
      throw new Error("Please choose a valid product and quantity.");
    }

    if (isBackendCartEnabled) {
      const response = await fetch(cartAddUrl({ productId, quantity: amount }), {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Could not add product to cart.");
      }
    }

    setCartItems((previousItems) => {
      const existingItem = previousItems.find((item) => item.productId === productId);
      const nextItems = !existingItem
        ? [
          ...previousItems,
          {
            id: productId,
            productId,
            name: product?.name || "Unnamed Product",
            brand: product?.brand || "N/A",
            price: Number.isFinite(Number(product?.price)) ? Number(product.price) : 0,
            quantity: amount,
          },
        ]
        : previousItems.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + amount } : item,
          );

      if (!isBackendCartEnabled) {
        writeGuestCartItems(nextItems);
      }
      return nextItems;
    });
  }

  async function updateCartItemQuantity(productId, nextQuantity) {
    const id = Number(productId);
    const quantity = Number(nextQuantity);
    if (!Number.isFinite(id) || !Number.isFinite(quantity) || quantity <= 0) {
      throw new Error("Quantity must be at least 1.");
    }

    if (isBackendCartEnabled) {
      const response = await fetch(cartUpdateUrl({ productId: id, newQuantity: quantity }), {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Could not update cart quantity.");
      }
    }

    setCartItems((previousItems) => {
      const nextItems = previousItems.map((item) => (item.productId === id ? { ...item, quantity } : item));
      if (!isBackendCartEnabled) {
        writeGuestCartItems(nextItems);
      }
      return nextItems;
    });
  }

  async function removeFromCart(productId) {
    const id = Number(productId);
    if (!Number.isFinite(id)) {
      throw new Error("Invalid product.");
    }

    if (isBackendCartEnabled) {
      const response = await fetch(cartRemoveUrl(id), {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Could not remove product from cart.");
      }
    }

    setCartItems((previousItems) => {
      const nextItems = previousItems.filter((item) => item.productId !== id);
      if (!isBackendCartEnabled) {
        writeGuestCartItems(nextItems);
      }
      return nextItems;
    });
  }

  async function clearCart() {
    if (isBackendCartEnabled) {
      const response = await fetch(cartClearUrl, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Could not place order right now.");
      }
    }

    setCartItems([]);
    if (!isBackendCartEnabled) {
      writeGuestCartItems([]);
    }
  }

  async function syncGuestCartToBackend() {
    const guestItems = readGuestCartItems();
    if (!guestItems.length) {
      return 0;
    }

    // Clear local storage immediately to prevent duplicate items being added to the cart.
    // idk why but it happened...
    writeGuestCartItems([]);

    const failedItems = [];
    for (const guestItem of guestItems) {
      try {
        const response = await fetch(
          cartAddUrl({
            productId: guestItem.productId,
            quantity: guestItem.quantity,
          }),
          {
            method: "POST",
            credentials: "include",
          },
        );

        if (!response.ok) {
          failedItems.push(guestItem);
        }
      } catch {
        failedItems.push(guestItem);
      }
    }

    if (failedItems.length) {
      writeGuestCartItems(failedItems);
    }
    return failedItems.length;
  }

  function loadGuestCartItems() {
    const guestItems = readGuestCartItems();
    setCartItems(guestItems);
    setCartError("");
    setIsCartLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadBackendCartWithGuestSync() {
      const failedSyncCount = await syncGuestCartToBackend();
      if (cancelled) {
        return;
      }

      await loadCartItems();
      if (!cancelled && failedSyncCount > 0) {
        setCartError("Some guest cart items could not be synced. Please review your cart.");
      }
    }

    if (!isSignedIn) {
      loadGuestCartItems();
    } else if (isBackendCartEnabled) {
      loadBackendCartWithGuestSync();
    } else {
      setCartItems([]);
      setCartError("");
      setIsCartLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, isBackendCartEnabled]);

  async function reloadCart() {
    if (isBackendCartEnabled) {
      await loadCartItems();
      return;
    }

    loadGuestCartItems();
  }

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      setCartItems,
      isCartLoading,
      cartError,
      addToCart,
      updateCartItemQuantity,
      removeFromCart,
      clearCart,
      reloadCart,
    }),
    [cartItems, cartCount, isCartLoading, cartError, isBackendCartEnabled],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
