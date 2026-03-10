// @desc   Get current logged-in user (tenant-aware, for /meAll route)
// @route  GET /api/auth/meAll
// @access Private
export const getUserMe = asyncHandler(async (req, res) => {
  const user = await req.tenant.User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});
// controllers/authController.js
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import errorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';
import { config } from '../config/index.js';
import Candidate from '../models/candidate.js';
import axios from "axios";
import Company from "../models/company.js";
import { superAdminBaseUrl } from '../utils/ApiConstants.js';


// @desc   Register user
// @route  POST /api/auth/register
// @access Public (you may change)
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, company } = req.body;
  if (!name || !email || !password) return next(new errorResponse('Please provide name, email and password', 400));

  // If company is provided, use tenant-specific User model
  let user;
  let existingUser;
  
  if (company) {
    const { getTenantDb } = await import('../utils/tenantDb.js');
    const dbName = `company_${company}`;
    const tenantConn = await getTenantDb(dbName);
    const TenantUser = tenantConn.model('User', User.schema);
    
    existingUser = await TenantUser.findOne({ email });
    if (existingUser) return next(new errorResponse('Email already exists', 400));
    
    user = await TenantUser.create({ name, email, password, role, company });
  } else {
    // Fallback for non-tenant registration
    existingUser = await User.findOne({ email });
    if (existingUser) return next(new errorResponse('Email already exists', 400));
    
    user = await User.create({ name, email, password, role });
  }
  
  sendTokenResponse(user, 201, res);
});

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
// export const login = asyncHandler(async (req, res, next) => {
//   const { email, password } = req.body;
//   if (!email || !password) return next(new errorResponse('Please provide email and password', 400));

//   const user = await User.findOne({ email }).select('+password');
//   if (!user) return next(new errorResponse('Invalid credentials', 401));

//   const isMatch = await user.matchPassword(password);
//   if (!isMatch) return next(new errorResponse('Invalid credentials', 401));
  
  

//   sendTokenResponse(user, 200, res);
// });
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new errorResponse('Please provide email and password', 400));
  }

  let user;

  try {
    const host = req.headers.host;
    const company = host.split('.')[0]; // extract subdomain

    const { getTenantDb } = await import('../utils/tenantDb.js');
    const dbName = `company_${company}`;
    const tenantConn = await getTenantDb(dbName);
    const TenantUser = tenantConn.model('User', User.schema);

    user = await TenantUser.findOne({ email }).select('+password');

  } catch (err) {
    return next(new errorResponse('Invalid tenant configuration', 400));
  }

  if (!user) {
    return next(new errorResponse('Invalid credentials', 401));
  }

  if (!user.isActive) {
    return next(new errorResponse('Account is deactivated. Contact admin.', 403));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new errorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc   Get current user
// @route  GET /api/auth/me
// @access Private
export const getCandidateMe = asyncHandler(async (req, res) => {
  const user = await Candidate.findById(req.candidate.id);
  res.status(200).json({ success: true, data: user });
});


// @desc   Get current logged-in user (tenant-aware)
// @route  GET /api/auth/me
// @access Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await req.tenant.User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

// helper 
const sendTokenResponse = (user, statusCode, res) => {
  const payload = { id: user._id, role: user.role  };
  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpire });

  // option: set httpOnly cookie
  const options = {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
  };

  const userObj = user.toObject();
  delete userObj.password;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token, user });
};

// @desc    Fetch company from external DB and save to local DB
// @route   POST /api/auth/sync-company
// @access  Private (SuperAdmin / Admin)
export const syncCompanyFromExternalDB = asyncHandler(async (req, res, next) => {
  const { companyId } = req.body;

  if (!companyId) {
    return next(new errorResponse("Company ID is required", 400));
  }

  try {
    // 🔗 External backend URL
    const EXTERNAL_API = `${superAdminBaseUrl}/superadmin/companies/${companyId}`;

    // 🌐 Fetch company details from other DB
    const response = await axios.get(EXTERNAL_API);

    if (!response.data || !response.data.data) {
      return next(new errorResponse("Company not found in external database", 404));
    }

    const companyData = response.data.data;

    if (!companyData) {
    return next(new errorResponse("Invalid company data received", 400));
  }


    // 💾 Save / Update company in your DB
  const savedCompany = await Company.findOneAndUpdate(
    { externalCompanyId: companyData._id }, // unique identifier
    {
      externalCompanyId: companyData._id,
      companyName: companyData.companyName,
      email: companyData.email,
      companyType: companyData.companyType,
      gstNumber: companyData.gstNumber,
      typeOfStaffing: companyData.typeOfStaffing,
      panNumber: companyData.panNumber,
      phoneNo: companyData.phoneNo,
      numberOfEmployees: companyData.numberOfEmployees,
      address1: companyData.address1,
      address2: companyData.address2,
      city: companyData.city,
      state: companyData.state,
      logo: companyData.logo,
    },
    { new: true, upsert: true }
  );

    res.status(200).json({
      success: true,
      message: "Company fetched and saved successfully",
      data: savedCompany,
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    return next(
      new errorResponse(
        error.response?.data?.message || "Failed to fetch company data",
        error.response?.status || 500
      )
    );
  }
});

// export const getCompanyMe = asyncHandler(async (req, res) => {
//   const company = await Company.findById(companyId); 
//   if (!company) {
//     return res.status(404).json({ success: false, message: "Company not found" });
//   }
//   res.status(200).json({ success: true, data: company });
// });
// @desc    Get company by ID (for sync)

export const getAllCompanies = asyncHandler(async (req, res) => {
  try {
    const companies = await req.tenant.Company.find();
    res.status(200).json({ success: true, count: companies.length, data: companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @desc    Toggle HR Active/Inactive (Admin only)
// @route   PUT /api/auth/toggle-user/:id
// @access  Private (Admin only)

export const toggleUserStatus = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  // Find user
  const user = await User.findById(userId);
  if (!user) {
    return next(new errorResponse("User not found", 404));
  }

  // Only HR can be toggled (optional restriction)
  if (user.role !== "HR") {
    return next(new errorResponse("Only HR accounts can be updated", 400));
  }

  // Toggle status
  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User is now ${user.isActive ? "Active" : "Inactive"}`,
    data: user,
  });
});