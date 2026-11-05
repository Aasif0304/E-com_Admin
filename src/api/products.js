import api from "./axios";

export async function getProducts() {
  const res = await api.get("/products/");
  return res.data;
}

export async function getProduct(id) {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export async function createProduct(formData) {
  const res = await api.post("/products/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateProduct(id, formData) {
  const res = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Quick Restock: Update stock count directly
export async function updateProductStock(id, newStock) {
  const formData = new FormData();
  formData.append("stock", parseInt(newStock, 10));
  const res = await api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteProduct(id) {
  const res = await api.delete(`/products/${id}`);
  return res.data;
}
