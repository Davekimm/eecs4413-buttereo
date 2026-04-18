import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { productCheckAvailabilityUrl, productDetailUrl, productImageUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export function ProductDetailsPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const { isAdmin } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(state?.product ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartFeedback, setCartFeedback] = useState("");
  const imageRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setErrorMessage("");
      setNotFound(false);
      setIsLoading(true);
      try {
        const response = await fetch(productDetailUrl(id), {
          credentials: "include",
        });

        if (response.status === 404) {
          if (!cancelled) {
            setNotFound(true);
            setProduct(null);
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Could not load product details.");
        }

        const data = await response.json();
        if (!cancelled) {
          setProduct(data ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message || "Could not load product details.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadImage() {
      setImageError(false);
      setImageUrl(null);

      if (imageRef.current) {
        URL.revokeObjectURL(imageRef.current);
        imageRef.current = null;
      }

      if (!id || notFound) {
        return;
      }

      try {
        const response = await fetch(productImageUrl(id), {
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

        imageRef.current = nextUrl;
        setImageUrl(nextUrl);
      } catch {
        if (!cancelled) {
          setImageError(true);
        }
      }
    }

    loadImage();
    return () => {
      cancelled = true;
      if (imageRef.current) {
        URL.revokeObjectURL(imageRef.current);
        imageRef.current = null;
      }
    };
  }, [id, notFound]);

  useEffect(() => {
    setSelectedQuantity(1);
    setCartFeedback("");
  }, [id]);

  if (isLoading) {
    return (
      <section className="simplePage productDetailsPage">
        <p>Loading product details...</p>
      </section>
    );
  }

  if (notFound) {
    return (
      <section className="simplePage productDetailsPage">
        <h1>Product not found</h1>
        <Link className="smallButton" to="/">
          Back to Home
        </Link>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="simplePage productDetailsPage">
        <p className="formError">{errorMessage}</p>
        <Link className="smallButton" to="/">
          Back to Home
        </Link>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="simplePage productDetailsPage">
        <p className="formError">No product details available.</p>
      </section>
    );
  }

  const priceText = Number.isFinite(Number(product.price))
    ? `$${Number(product.price).toFixed(2)}`
    : "$0.00";
  const stockText = product.available
    ? `In stock (${product.quantity ?? 0})`
    : "Out of stock";
  const details = [
    { label: "Brand", value: product.brand || "N/A" },
    { label: "Category", value: product.category || "N/A" },
    { label: "Availability", value: stockText },
  ];
  // Guests and USER accounts use the cart (guest = localStorage; USER = API). Do not require
  // role === "USER" here — stale sessionStorage or a failed /api/account call leaves role ""
  // while isSignedIn is true, which wrongly blocked the old !isSignedIn || role === "USER" check.
  const canAddToCart = !isAdmin;
  const maxSelectableQuantity = Number.isFinite(Number(product.quantity))
    ? Math.max(1, Number(product.quantity))
    : 1;
  const availableQuantity = Number.isFinite(Number(product.quantity)) ? Number(product.quantity) : 0;
  const isOutOfStock = !product.available || availableQuantity <= 0;

  async function handleAddToCart() {
    const quantity = Number(selectedQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setCartFeedback("Please enter a valid quantity.");
      return;
    }
    if (isOutOfStock) {
      setCartFeedback("This product is currently out of stock.");
      return;
    }

    setCartFeedback("");
    setIsAddingToCart(true);
    try {
      const availabilityResponse = await fetch(productCheckAvailabilityUrl(id, quantity), {
        method: "GET",
        credentials: "include",
      });
      if (!availabilityResponse.ok) {
        setCartFeedback("Please choose a lower quantity due to limited inventory.");
        return;
      }

      await addToCart(product, quantity);
      setCartFeedback("Added to cart.");
    } catch (error) {
      setCartFeedback(error.message || "Could not add this product to cart.");
    } finally {
      setIsAddingToCart(false);
    }
  }

  return (
    <section className="simplePage productDetailsPage">
      <div className="productDetailsCard">
        <Link className="smallButton productDetailsBackButton" to="/">
          Back to Home
        </Link>
        
        <h1>{product.name || "Product Details"}</h1>
        <p className="productDetailsPrice">{priceText}</p>

        {imageUrl ? (
          <img className="productDetailsImage" src={imageUrl} alt={product.name || "Product image"} />
        ) : (
          <div className="productDetailsImageFallback">
            {imageError ? "No image available" : "Loading image..."}
          </div>
        )}

        <div className="productDetailsMetaGrid">
          {details.map((item) => (
            <p key={item.label}>
              <strong>{item.label}:</strong> {item.value}
            </p>
          ))}
        </div>

        <section className="productDetailsDescription">
          <h2>Description</h2>
          <p>{product.description || "No description available."}</p>
        </section>
      </div>

      <section className="panelBox productDetailCartPanel">
        <p className="panelTitle">Add To Cart</p>
        {!canAddToCart ? (
          <p className="formError">Administrator accounts cannot add items to the cart.</p>
        ) : (
          <>
            <label className="formField" htmlFor="productQuantity">
              Quantity
              <input
                id="productQuantity"
                type="number"
                min="1"
                max={maxSelectableQuantity}
                value={selectedQuantity}
                onChange={(event) => {
                  const nextQuantity = Number(event.target.value);
                  if (Number.isFinite(nextQuantity) && nextQuantity > maxSelectableQuantity) {
                    setSelectedQuantity(maxSelectableQuantity);
                  } else {
                    setSelectedQuantity(event.target.value);
                  }
                  if (cartFeedback) {
                    setCartFeedback("");
                  }
                }}
              />
            </label>
            <button type="button" onClick={handleAddToCart} disabled={isAddingToCart || isOutOfStock}>
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </button>
          </>
        )}
        {cartFeedback ? <p>{cartFeedback}</p> : null}
      </section>
    </section>
  );
}
