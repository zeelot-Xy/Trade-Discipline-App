export const serializeUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  planType: user.planType,
  subscriptionStatus: user.subscriptionStatus,
  currentPeriodEnd: user.currentPeriodEnd,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
