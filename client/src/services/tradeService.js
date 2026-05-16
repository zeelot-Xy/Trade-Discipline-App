import api from "./api.js";

const unwrap = (response) => response.data.data;

const tradeService = {
  createTrade: async (payload) => unwrap(await api.post("/trades", payload)),
  getTrades: async () => unwrap(await api.get("/trades")),
  getTrade: async (id) => unwrap(await api.get(`/trades/${id}`)),
  updateTrade: async (id, payload) => unwrap(await api.patch(`/trades/${id}`, payload)),
  deleteTrade: async (id) => unwrap(await api.delete(`/trades/${id}`)),
};

export default tradeService;
