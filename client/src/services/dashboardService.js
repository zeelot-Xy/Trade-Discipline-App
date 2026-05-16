import api from "./api.js";

const unwrap = (response) => response.data.data;

const dashboardService = {
  getDashboardStats: async () => unwrap(await api.get("/dashboard/stats")),
  getWeeklyReview: async () => unwrap(await api.get("/dashboard/weekly-review")),
  getStrategyPerformance: async () => unwrap(await api.get("/dashboard/strategy-performance")),
  getRuleImpact: async () => unwrap(await api.get("/dashboard/rule-impact")),
};

export default dashboardService;
