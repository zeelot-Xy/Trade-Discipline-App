import api from "./api.js";

const unwrap = (response) => response.data.data;

const billingService = {
  createCheckoutSession: async () =>
    unwrap(await api.post("/billing/create-checkout-session")),
  createCustomerPortalSession: async () =>
    unwrap(await api.post("/billing/create-customer-portal-session")),
};

export default billingService;
