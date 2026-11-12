import api, { getAssetUrl } from "./axios";

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/**
 * Return raw relative/absolute image paths for a product, preferring `image_urls`
 * and falling back to single `image_url` when present.
 */
export function getProductImagePaths(product) {
  if (!product) return [];
  if (Array.isArray(product.image_urls) && product.image_urls.length > 0) {
    return product.image_urls.filter(Boolean);
  }
  if (product.image_url) {
    return [product.image_url];
  }
  return [];
}

/**
 * Return full asset URLs for all images of a product.
 */
export function getProductImageUrls(product) {
  return getProductImagePaths(product).map(getAssetUrl);
}

/**
 * Return the resolved primary thumbnail URL for a product, or "" if none.
 */
export function getPrimaryProductImageUrl(product) {
  const paths = getProductImagePaths(product);
  return paths.length > 0 ? getAssetUrl(paths[0]) : "";
}

/**
 * Validate selected image files against allowed extensions (.jpg, .jpeg, .png, .webp).
 */
export function validateImageFiles(files) {
  const validFiles = [];
  const invalidNames = [];

  for (const file of files) {
    const name = file?.name || "";
    const dotIndex = name.lastIndexOf(".");
    const ext = dotIndex >= 0 ? name.slice(dotIndex).toLowerCase() : "";
    if (ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
      validFiles.push(file);
    } else {
      invalidNames.push(name || "unknown file");
    }
  }

  return { validFiles, invalidNames };
}

const MIME_TO_EXT = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

/**
 * Fetch an existing saved image URL and convert it to a File object so it can
 * be preserved alongside newly added images during PUT /products/{id}.
 */
export async function urlToImageFile(url, rawPath = "") {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch saved image (${response.status})`);
  }
  const blob = await response.blob();
  const cleanPath = (rawPath || url).split("?")[0].split("#")[0];
  let fileName =
    cleanPath.substring(cleanPath.lastIndexOf("/") + 1) || "product-image.jpg";
  const dotIdx = fileName.lastIndexOf(".");
  const ext = dotIdx >= 0 ? fileName.slice(dotIdx).toLowerCase() : "";

  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    const fallbackExt = MIME_TO_EXT[blob.type] || ".jpg";
    fileName = `${fileName}${fallbackExt}`;
  }

  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
}

/**
 * Format FastAPI 400/422 error responses into a readable string.
 */
export function formatProductApiError(err, fallback = "Failed to save product. Check inputs.") {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const field = Array.isArray(item.loc)
            ? item.loc.filter((part) => part !== "body").join(".")
            : "";
          const msg = item.msg || "Invalid value";
          return field ? `${field}: ${msg}` : msg;
        }
        return String(item);
      })
      .join(" | ");
  }
  if (detail && typeof detail === "object") {
    return detail.message || detail.msg || fallback;
  }
  return err?.response?.data?.message || fallback;
}

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
