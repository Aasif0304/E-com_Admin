import api from "./axios";

export async function getCategories() {
  const res = await api.get("/categories/");
  return res.data;
}

export async function getCategory(id) {
  const res = await api.get(`/categories/${id}`);
  return res.data;
}

export async function createCategory(categoryData) {
  const res = await api.post("/categories/", categoryData);
  return res.data;
}

export async function updateCategory(id, categoryData) {
  const res = await api.put(`/categories/${id}`, categoryData);
  return res.data;
}

export async function deleteCategory(id) {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
}

