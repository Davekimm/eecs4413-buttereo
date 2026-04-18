import { useEffect, useRef, useState } from "react";
import { productImageUrl } from "../../config/api";

/**
 * Loads the product image with the session cookie (cross-origin), then shows it as a blob URL.
 */
export function ProductThumb({ productId }) {
  const [objectUrl, setObjectUrl] = useState(null);
  const [failed, setFailed] = useState(false);
  const urlRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadImage() {
      setFailed(false);
      setObjectUrl(null);

      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }

      try {
        const response = await fetch(productImageUrl(productId), {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("bad response");
        }
        const blob = await response.blob();
        const nextUrl = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(nextUrl);
          return;
        }
        urlRef.current = nextUrl;
        setObjectUrl(nextUrl);
      } catch {
        if (!cancelled) setFailed(true);
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

  if (failed) {
    return <span className="thumbFallback">No image</span>;
  }

  if (!objectUrl) {
    return <span className="thumbFallback">…</span>;
  }

  return <img className="inventoryThumb" src={objectUrl} alt="" width="56" height="56" />;
}
