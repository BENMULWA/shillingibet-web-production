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
      options.body = JSON.stringify(data);
    }

    const fullUrl = `${API_URL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;

    const response = await fetch(fullUrl, options);

    const contentType = response.headers.get("content-type") || "";
    const result = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    // On 401 with an authenticated request, clear the stale user session.
    // Keep backend-provided messages for login/register style requests.
    if (response.status === 401 && token) {
      localStorage.removeItem("user");
    }

    const providerError =
      Number.isFinite(Number(result?.status_code)) &&
      Number(result.status_code) >= 400;

    if (
      !response.ok ||
      result?.success === false ||
      result?.status === false ||
      providerError
    ) {
      const fallbackMessage =
        response.status === 401 && token
          ? "Session expired. Please log in again."
          : "Something went wrong";

      throw new Error(
        result?.message ||
          result?.status_description ||
          result?.error ||
          fallbackMessage
      );
    }

    return result;
  } catch (error) {
    throw new Error(error?.message || error?.error || "Something went wrong");
  }
};
