import { tenantId } from "./configs";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchAPI = async (
  url,
  method = "GET",
  data = null,
  token = null
) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      // Strip any existing 'Bearer ' prefix to avoid double-Bearer headers
      const cleanToken = token.replace(/^Bearer\s+/i, "");
      headers["Authorization"] = `Bearer ${cleanToken}`;
    }

    const options = { method, headers };

    if (data) {
      // POST/PUT — tenantId already included in body by each service method
      options.body = JSON.stringify(data);
    }

    // For GET requests, append tenantId as a query param so the backend
    // can identify the tenant without requiring a custom header (avoids CORS preflight block)
    let fullUrl = `${API_URL}/${url}`;
    if (method === "GET" && tenantId) {
      const separator = fullUrl.includes("?") ? "&" : "?";
      fullUrl = `${fullUrl}${separator}tenantId=${tenantId}`;
    }

    const response = await fetch(fullUrl, options);

    // On 401: silently clear the stale token — do NOT redirect (causes reload loop)
    if (response.status === 401) {
      localStorage.removeItem("user");
      throw new Error("Session expired. Please log in again.");
    }

    const result = await response.json();

    if (!response.ok || result?.status === false) {
      throw new Error(
        result?.message || result?.error || "Something went wrong"
      );
    }

    return result;
  } catch (error) {
    throw new Error(error?.message || error?.error || "Something went wrong");
  }
};
