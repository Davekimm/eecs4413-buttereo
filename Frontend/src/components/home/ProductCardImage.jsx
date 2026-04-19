import { useEffect, useRef, useState } from "react";
import { productImageUrl } from "../../config/api";

/** Product card image. Uses GET /api/product/image. */
export function ProductCardImage({ productId }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [hasError, setHasError] = useState(false);
  const urlRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadImage() {
      setHasError(false);
      setImageUrl(null);

      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }

      try {
        const response = await fetch(productImageUrl(productId), {
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
  }, [productId]);

  if (hasError) {
    return <div className="productCardImageFallback">No image</div>;
  }

  if (!imageUrl) {
    return <div className="productCardImageFallback">Loading...</div>;
  }

  return <img className="productCardImage" src={imageUrl} alt="" />;
}
