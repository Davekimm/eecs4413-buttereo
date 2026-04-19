import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PRODUCT_CATEGORIES } from "../constants/productCategories";
import { PRODUCT_ADD_URL } from "../config/api";

const emptyForm = {
  name: "",
  description: "",
  brand: "",
  price: "",
  category: "",
  quantity: "",
  available: true,
};

/** Add product page. Uses POST /api/product/add and PUT /api/product/image. */
export function AddProductPage() {
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

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

    if (!imageFile) {
      setErrorMessage("Please choose an image file for this product.");
      return;
    }

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
    formData.append("imageFile", imageFile);

    setIsSubmitting(true);
    try {
      const response = await fetch(PRODUCT_ADD_URL, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Could not add product.");
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
      <h1>Add product</h1>
      <p className="inventoryNote">Must include one image file per product.</p>

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
          Product image (required)
          <input type="file" accept="image/*" onChange={handleImageChange} required />
        </label>

        <div className="addProductActions">
          <button className="loginSubmit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Register product"}
          </button>
          <Link className="navButton" to="/admin/inventory">
            Cancel
          </Link>
        </div>
      </form>

      {errorMessage ? <p className="formError">{errorMessage}</p> : null}
    </section>
  );
}
