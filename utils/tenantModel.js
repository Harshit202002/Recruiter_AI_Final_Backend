// utils/tenantModel.js
/**
 * Helper to get a model from req.tenant or fallback to default
 * Usage: const User = getTenantModel(req, 'User');
 */
export function getTenantModel(req, modelName) {
  if (req.tenant && req.tenant[modelName]) return req.tenant[modelName];
  // fallback to default import if needed
  return (async () => (await import(`../models/${modelName}.js`)).default)();
}
