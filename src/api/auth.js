import api from "./axios";

export function roleFromToken(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    return payload.role || null;
  } catch {
    return null;
  }
}

export async function adminLogin(email, password) {
  let data;
  try {
    const res = await api.post("/auth/login", { email, password });
    data = res.data;
  } catch (err) {
    if (err.response?.status === 422) {
      const form = new URLSearchParams({ email, username: email, password });
      const res = await api.post("/auth/login", form);
      data = res.data;
    } else {
      throw err;
    }
  }

  const token = data.access_token;
  const role = (
    data.role ||
    data.user?.role ||
    roleFromToken(token) ||
    "USER"
  ).toUpperCase();

  if (role !== "ADMIN") {
    throw new Error(
      "Access Denied: You do not have administrator privileges to access this portal."
    );
  }

  return {
    token,
    role,
    user: {
      id: data.user_id,
      name: data.name,
      email: data.email,
      role,
    },
  };
}

export function errorMessage(err) {
  if (!err) return "An unexpected error occurred.";
  if (err.message && !err.response) return err.message;
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => e.msg || e.message).join(", ");
  }
  return "Request failed. Please verify your credentials and try again.";
}

