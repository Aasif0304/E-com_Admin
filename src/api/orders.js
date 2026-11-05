import api from "./axios";

// Fetch all customer orders across the platform
export async function getAllOrders() {
  const res = await api.get("/admin/orders/");
  return res.data;
}

// Fetch single customer order details with line items
export async function getOrderDetails(orderId) {
  const res = await api.get(`/admin/orders/${orderId}`);
  return res.data;
}

// Update order status through the pipeline
export async function updateOrderStatus(orderId, status) {
  const res = await api.patch(`/admin/orders/${orderId}/status`, {
    status,
  });
  return res.data;
}

