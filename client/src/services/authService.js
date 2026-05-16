import api from "./api.js";

const unwrap = (response) => response.data.data;

const authService = {
  register: async (payload) => unwrap(await api.post("/auth/register", payload)),
  login: async (payload) => unwrap(await api.post("/auth/login", payload)),
  logout: async () => unwrap(await api.post("/auth/logout")),
  getMe: async () => unwrap(await api.get("/auth/me")),
  forgotPassword: async (payload) =>
    unwrap(await api.post("/auth/forgot-password", payload)),
  resetPassword: async (payload) =>
    unwrap(await api.post("/auth/reset-password", payload)),
};

export default authService;
