import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { PRODUCT_CATEGORIES } from "../constants/productCategories";
import { productDetailUrl, productUpdateUrl } from "../config/api";

const emptyForm = {
  name: "",
  description: "",
  brand: "",
  price: "",
  category: "",
  quantity: "",
  available: true,
};

/** Map product data to form data. */
function mapProductToForm(product) {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    brand: product?.brand ?? "",
    price: product?.price ?? "",
    category: product?.category ?? "",
    quantity: product?.quantity ?? "",
    available: Boolean(product?.available),
  };
}

/** Edit product page. Uses GET /api/product/detail and PUT /api/product. */
export function EditProductPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState(
    state?.product ? mapProductToForm(state.product) : emptyForm,
  );
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setErrorMessage("");
      setIsLoading(true);
      try {
        const response = await fetch(productDetailUrl(id), {
          credentials: "include",
        });
        if (response.status === 404) {
          throw new Error("Product not found.");
        }
        if (!response.ok) {
          throw new Error("Could not load product information.");
        }
        const data = await response.json();
        if (!cancelled) {
          setForm(mapProductToForm(data));
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error.message || "Could not load product information.");
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

  function handleFieldChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files && event.target.files[0];
    setImageFile(file || null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    const priceNum = Number(form.price);
    const qtyNum = Number.parseInt(String(form.quantity), 10);
    const productPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      brand: form.brand.trim(),
      price: Number.isFinite(priceNum) ? priceNum : 0,
      category: form.category.trim(),
      available: form.available,
      quantity: Number.isFinite(qtyNum) ? qtyNum : 0,
    };

    const formData = new FormData();
    formData.append(
      "product",
      new Blob([JSON.stringify(productPayload)], { type: "application/json" }),
    );
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(productUpdateUrl(id), {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Could not update product.");
      }

      navigate("/admin/inventory");
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="simplePage addProductPage">
      <h1>Edit product</h1>
      <p className="inventoryNote">
        Choose a new image only if you want to replace the current one.
      </p>

      {isLoading ? <p>Loading product information...</p> : null}

      {!isLoading && !errorMessage ? (
        <form className="addProductForm" onSubmit={handleSubmit}>
          <label className="formField">
            Name
            <input name="name" value={form.name} onChange={handleFieldChange} required />
          </label>
          <label className="formField">
            Description
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleFieldChange}
              required
            />
          </label>
          <label className="formField">
            Brand
            <input name="brand" value={form.brand} onChange={handleFieldChange} required />
          </label>
          <label className="formField">
            Price
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleFieldChange}
              required
            />
          </label>
          <label className="formField">
            Category
            <select name="category" value={form.category} onChange={handleFieldChange} required>
              <option value="" disabled>
                Select category
              </option>
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="formField">
            Quantity
            <input
              name="quantity"
              type="number"
              min="0"
              step="1"
              value={form.quantity}
              onChange={handleFieldChange}
              required
            />
          </label>
          <label className="formField formFieldRow">
            <input
              name="available"
              type="checkbox"
              checked={form.available}
              onChange={handleFieldChange}
            />
            Available for sale
          </label>

          <label className="formField">
            Product image (optional)
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>

          <div className="addProductActions">
            <button className="loginSubmit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Apply changes"}
            </button>
            <Link className="navButton" to="/admin/inventory">
              Go back to Inventory
            </Link>
          </div>
        </form>
      ) : null}

      {errorMessage ? <p className="formError">{errorMessage}</p> : null}
    </section>
  );
}
