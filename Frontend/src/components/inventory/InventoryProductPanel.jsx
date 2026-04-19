import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productDeleteUrl } from "../../config/api";
import { ProductThumb } from "./ProductThumb";

/** Admin inventory product panel. Uses DELETE /api/product/delete. */
export function InventoryProductPanel({ products, onReload }) {
  const rows = products.length > 0 ? products : [];
  const [deleteError, setDeleteError] = useState("");
  const navigate = useNavigate();

  function handleEdit(productId) {
    const product = rows.find((item) => item.id === productId);
    navigate(`/admin/inventory/edit/${productId}`, {
      state: product ? { product } : undefined,
    });
  }

  async function handleDelete(productId) {
    setDeleteError("");
    if (!window.confirm("Delete this product? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(productDeleteUrl(productId), {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Delete failed.");
      }

      if (onReload) await onReload();
    } catch (err) {
      setDeleteError(err.message || "Could not delete product.");
    }
  }

  return (
    <div className="inventoryPanel">
      <div className="inventoryToolbar">
        <Link className="navButton" to="/admin/inventory/add">
          Add product
        </Link>
      </div>

      {deleteError ? <p className="formError">{deleteError}</p> : null}

      {rows.length === 0 ? (
        <p className="inventoryEmpty">No products yet. Add one with a photo.</p>
      ) : (
        <table className="inventoryTable">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>price</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td className="inventoryThumbCell">
                  <ProductThumb productId={row.id} />
                </td>
                <td>{row.name}</td>
                <td>${Number(row.price ?? 0).toFixed(2)}</td>
                <td>{row.brand || "-"}</td>
                <td>{row.category || "-"}</td>
                <td>{row.quantity}</td>
                <td className="inventoryStatusCell">{row.available ? "O" : "X"}</td>
                <td className="inventoryActionsCell">
                  <div className="inventoryActions">
                    <button type="button" className="navButton" onClick={() => handleEdit(row.id)}>
                      Edit
                    </button>
                    <button type="button" className="navButton" onClick={() => handleDelete(row.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
