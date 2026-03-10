import Company from '../models/company.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// Register company and admin (for SuperAdmin integration)
export const registerCompanyAndAdmin = asyncHandler(async (req, res, next) => {
  const {
    externalCompanyId,
    companyName,
    email,
    companyType,
    gstNumber,
    typeOfStaffing,
    panNumber,
    phoneNo,
    numberOfEmployees,
    address1,
    address2,
    city,
    state,
    logo,
    admin
  } = req.body;

  if (!externalCompanyId || !companyName || !email || !admin) {
    return next(new ErrorResponse('Missing required fields', 400));
  }

  // Standard DB name: company_{externalCompanyId}
  const dbName = `company_${externalCompanyId}`;

  // Check if company DB already exists (by trying to connect)
  const { getTenantDb } = await import('../utils/tenantDb.js');
  let tenantConn;
  try {
    tenantConn = await getTenantDb(dbName);
  } catch (err) {
    return next(new ErrorResponse('Failed to create/connect to company DB', 500));
  }

  // Dynamically get models from tenant connection
  let TenantCompany, TenantUser;
  try {
    TenantCompany = tenantConn.model('Company', (await import('../models/company.js')).default.schema);
    TenantUser = tenantConn.model('User', (await import('../models/User.js')).default.schema);
  } catch (err) {
    return next(new ErrorResponse('Failed to load tenant models', 500));
  }

  // Check if company already exists in tenant DB
  const existing = await TenantCompany.findOne({ externalCompanyId });
  if (existing) return next(new ErrorResponse('Company already exists in tenant DB', 400));

  // Create company in tenant DB
  const company = await TenantCompany.create({
    externalCompanyId,
    companyName,
    email,
    companyType,
    gstNumber,
    typeOfStaffing,
    panNumber,
    phoneNo,
    numberOfEmployees,
    address1,
    address2,
    city,
    state,
    logo
  });

  // Create admin user for this company in tenant DB
  const adminUser = await TenantUser.create({
    name: admin.name,
    email: admin.email,
    password: admin.password,
    role: 'Admin',
    company: company._id
  });

  res.status(201).json({
    message: 'Company and admin created in tenant DB',
    company,
    admin: { id: adminUser._id, email: adminUser.email },
    dbName
  });
});