// middlewares/tenantResolver.js
import asyncHandler from '../utils/asyncHandler.js';
import { getTenantDb } from '../utils/tenantDb.js';

/**
 * Middleware to resolve tenant DB connection and attach tenant models to req.tenant
 * Expects req.user (from auth) to have company or externalCompanyId
 *
 * Usage: Place after authentication middleware
 */
export const tenantResolver = asyncHandler(async (req, res, next) => {
  // Try to get company identifier from user or request
  let externalCompanyId = null;
  if (req.user && req.user.company && req.user.company.externalCompanyId) {
    externalCompanyId = req.user.company.externalCompanyId;
  } else if (req.user && req.user.externalCompanyId) {
    externalCompanyId = req.user.externalCompanyId;
  } else if (req.headers['x-company-id']) {
    externalCompanyId = req.headers['x-company-id'];
  }

  if (!externalCompanyId) {
    return res.status(400).json({ error: 'No company context found for tenant resolution' });
  }

  const dbName = `company_${externalCompanyId}`;
  const tenantConn = await getTenantDb(dbName);

  // Attach tenant connection and models to req.tenant
  req.tenant = {
    conn: tenantConn,
    Company: tenantConn.model('Company', (await import('../models/company.js')).default.schema),
    User: tenantConn.model('User', (await import('../models/User.js')).default.schema),
    // Add more models as needed
  };
  next();
});
