import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const responseData = error.response?.data;
    const message =
      responseData?.message ||
      error.message ||
      "Something went wrong while reaching the server.";

    if (status === 401) {
      window.dispatchEvent(new CustomEvent("perfect-trade:unauthorized"));
    }

    const nextError = new Error(message);
    nextError.status = status;
    nextError.code = responseData?.code;
    nextError.data = responseData?.data;

    return Promise.reject(nextError);
  },
);

export default api;
