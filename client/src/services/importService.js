import api from "./api.js";

const unwrap = (response) => response.data.data;

const importService = {
  previewCsv: async (payload) => unwrap(await api.post("/imports/csv/preview", payload)),
  confirmCsv: async (payload) => unwrap(await api.post("/imports/csv/confirm", payload)),
  previewMt: async (payload) => unwrap(await api.post("/imports/mt/preview", payload)),
  confirmMt: async (payload) => unwrap(await api.post("/imports/mt/confirm", payload)),
};

export default importService;
