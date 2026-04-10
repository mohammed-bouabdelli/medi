export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8001/api";

export const getAuthToken = () => localStorage.getItem("token");

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }

    // Handle Laravel validation errors (422)
    if (response.status === 422 && errorData.errors) {
      const firstError = Object.values(errorData.errors)[0][0];
      throw new Error(firstError);
    }

    throw new Error(errorData.message || "An error occurred");
  }

  // If response is empty (e.g. 204 No Content), return null
  if (response.status === 204) {
    return null;
  }

  return response.json();
};
