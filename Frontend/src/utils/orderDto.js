export function parseOrderDate(rawValue) {
  if (rawValue == null || rawValue === "") {
    return null;
  }
  if (Array.isArray(rawValue) && rawValue.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = rawValue;
    const parsed = new Date(year, month - 1, day, hour, minute, second);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  const parsed = new Date(rawValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function mapOrderLineItem(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const product = item.product ?? {};
  const nestedProductId = Number(product.id);
  if (Number.isFinite(nestedProductId)) {
    const price = Number.isFinite(Number(item.price)) ? Number(item.price) : Number(product.price) || 0;
    return {
      productId: nestedProductId,
      orderedItemId: Number.isFinite(Number(item.id)) ? Number(item.id) : null,
      name: product.name || "Product",
      brand: product.brand || "N/A",
      price,
      quantity: Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 0,
    };
  }

  const flatProductId = Number(item.productId);
  const productId = Number.isFinite(flatProductId) ? flatProductId : null;
  const orderedItemIdRaw = item.orderedItemId;
  const orderedItemId = Number.isFinite(Number(orderedItemIdRaw)) ? Number(orderedItemIdRaw) : null;

  const name = item.name || "Product";
  const brand = item.brand || "N/A";
  const price = Number.isFinite(Number(item.price)) ? Number(item.price) : 0;
  const quantity = Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 0;

  return {
    productId,
    orderedItemId,
    name,
    brand,
    price,
    quantity,
  };
}

export function normalizeOrderForDisplay(order) {
  if (!order || typeof order !== "object") {
    return null;
  }

  const rawItems = Array.isArray(order.orderItems) ? order.orderItems : [];
  const items = rawItems.map(mapOrderLineItem).filter(Boolean);
  const placedDate = parseOrderDate(order.orderDate);
  const id = order.orderId ?? order.id;

  return {
    id,
    username: String(order.username ?? "").trim(),
    totalAmount: Number.isFinite(Number(order.totalAmount)) ? Number(order.totalAmount) : 0,
    address: String(order.address ?? "").trim() || "N/A",
    cardNumber: String(order.cardNumber ?? "").trim() || "N/A",
    placedAtLabel: placedDate ? placedDate.toLocaleString() : "N/A",
    placedAtMs: placedDate ? placedDate.getTime() : 0,
    items,
  };
}

export function normalizeOrderForCheckoutSummary(order) {
  const row = normalizeOrderForDisplay(order);
  if (!row) {
    return null;
  }
  const totalItems = row.items.reduce((sum, line) => sum + line.quantity, 0);
  const digits = String(order.cardNumber ?? "").replace(/\s+/g, "");
  const cardLastFour = digits.length >= 4 ? digits.slice(-4) : "";

  return {
    orderId: order.orderId ?? order.id,
    totalItems,
    totalAmount: row.totalAmount,
    subtotal: row.totalAmount,
    address: String(order.address ?? "").trim(),
    cardLastFour,
    placedAt: order.orderDate,
    items: row.items,
  };
}
