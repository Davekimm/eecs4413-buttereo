export const ADMIN_INVENTORY_API = "http://localhost:8080/admin/inventory";

export const ACCOUNT_API_URL = "http://localhost:8080/api/account";
export const ACCOUNT_ADMIN_ALL_USERS_API_URL = `${ACCOUNT_API_URL}/admin/all`;
export const accountAdminUpdateUserApiUrl = (username) =>
  `${ACCOUNT_API_URL}/admin/update/${encodeURIComponent(username)}`;
export const accountAdminDeleteUserApiUrl = (username) =>
  `${ACCOUNT_API_URL}/admin/delete/${encodeURIComponent(username)}`;

export const PRODUCT_API_BASE = "http://localhost:8080/api/product";
export const PRODUCT_ADD_URL = `${PRODUCT_API_BASE}/add`;
export const PRODUCT_LIST_URL = `${PRODUCT_API_BASE}/all`;
export const CART_API_BASE = "http://localhost:8080/api/cart";


// GET /api/product/filter with optional keyword, category, and sort flags.
// Params:{ keyword?: string; category?: string; sortNameAsc?: boolean; sortPriceAsc?: boolean }
export function productFilterUrl({
  keyword = "",
  category = "",
  sortNameAsc = false,
  sortPriceAsc = false,
} = {}) {
  const params = new URLSearchParams();
  if (keyword.trim()) {
    params.set("keyword", keyword.trim());
  }
  if (category) {
    params.set("category", category);
  }
  if (sortNameAsc) {
    params.set("sortName", "ascend");
  }
  if (sortPriceAsc) {
    params.set("sortPrice", "ascend");
  }
  const query = params.toString();
  return query ? `${PRODUCT_API_BASE}/filter?${query}` : `${PRODUCT_API_BASE}/filter`;
}

export function productDetailUrl(id) {
  return `${PRODUCT_API_BASE}/${id}`;
}

export function productUpdateUrl(id) {
  return `${PRODUCT_API_BASE}/update/${id}`;
}

export function productImageUrl(id) {
  return `${PRODUCT_API_BASE}/${id}/image`;
}

export function productDeleteUrl(id) {
  return `${PRODUCT_API_BASE}/delete/${id}`;
}

export function productCheckAvailabilityUrl(productId, quantity) {
  const params = new URLSearchParams({
    quantity: String(quantity),
  });
  return `${PRODUCT_API_BASE}/${productId}/check-availability?${params.toString()}`;
}

export const cartItemsUrl = `${CART_API_BASE}/items`;

export function cartAddUrl({ productId, quantity }) {
  const params = new URLSearchParams({
    productId: String(productId),
    quantity: String(quantity),
  });
  return `${CART_API_BASE}/add?${params.toString()}`;
}

export function cartUpdateUrl({ productId, newQuantity }) {
  const params = new URLSearchParams({
    productId: String(productId),
    newQuantity: String(newQuantity),
  });
  return `${CART_API_BASE}/update?${params.toString()}`;
}

export function cartRemoveUrl(productId) {
  const params = new URLSearchParams({
    productId: String(productId),
  });
  return `${CART_API_BASE}/remove?${params.toString()}`;
}

export const cartClearUrl = `${CART_API_BASE}/clear`;

export const ORDER_API_BASE = "http://localhost:8080/api/order";
export const ORDER_RECENT_API_URL = ORDER_API_BASE;
export const ORDER_ALL_API_URL = `${ORDER_API_BASE}/all`;
export const orderAdminAllByUsernameApiUrl = (username) =>
  `${ORDER_API_BASE}/admin/all/${encodeURIComponent(username)}`;

/** GET /api/order/admin/sales-history — no params returns 10 most recent (backend). */
export function orderAdminSalesHistoryUrl({
  startDate = "",
  endDate = "",
  productName = "",
  categoryName = "",
} = {}) {
  const params = new URLSearchParams();
  if (String(startDate).trim()) params.set("startDate", String(startDate).trim());
  if (String(endDate).trim()) params.set("endDate", String(endDate).trim());
  if (String(productName).trim()) params.set("productName", String(productName).trim());
  if (String(categoryName).trim()) params.set("categoryName", String(categoryName).trim());
  const query = params.toString();
  return query ? `${ORDER_API_BASE}/admin/sales-history?${query}` : `${ORDER_API_BASE}/admin/sales-history`;
}
