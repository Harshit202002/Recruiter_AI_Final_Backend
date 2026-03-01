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

  // Check if company already exists
  const existing = await Company.findOne({ externalCompanyId });
  if (existing) return next(new ErrorResponse('Company already exists', 400));

  // Create company
  const company = await Company.create({
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

  // Create admin user for this company
  const adminUser = await User.create({
    name: admin.name,
    email: admin.email,
    password: admin.password,
    role: 'Admin',
    company: company._id
  });

  res.status(201).json({
    message: 'Company and admin created',
    company,
    admin: { id: adminUser._id, email: adminUser.email }
  });
});