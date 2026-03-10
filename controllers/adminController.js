// Update RMG user
export const updateRmg = asyncHandler(async (req, res, next) => {
  try {
    const rmgId = req.params.id;
    const updates = req.body;
    const rmgUser = await User.findOneAndUpdate(
      { _id: rmgId, role: 'RMG' },
      updates,
      { new: true }
    ).select('-password');
    if (!rmgUser) {
      return next(new ErrorResponse('RMG user not found', 404));
    }
    res.status(200).json({ success: true, message: 'RMG updated', data: rmgUser });
  } catch (err) {
    return next(new ErrorResponse(err.message || 'Failed to update RMG', 500));
  }
});
// Register a new RMG user
export const registerRMG = asyncHandler(async (req, res, next) => {
  const { name, phone, email, company } = req.body;
  if (!name || !phone || !email || !company) {
    return next(new ErrorResponse('Please provide name, phone, email, and company', 400));
  }
  const TenantUser = req.tenant.User;
  const existingRMG = await TenantUser.findOne({ email });
  if (existingRMG) return next(new ErrorResponse('Email already registered', 400));
  const rmgPassword = generatePassword();
  try {
    const user = await TenantUser.create({ name, phone, email, password: rmgPassword, role: 'RMG', company });
    await sendEmail({
      to: email,
      subject: 'Your RMG account has been created',
      html: buildCredentialEmail(name, phone, email, rmgPassword, 'RMG'),
    });
    res.status(201).json({ success: true, message: 'RMG created and email sent', data: { id: user._id, email } });
  } catch (err) {
    return next(new ErrorResponse(err.message || 'Failed to create RMG', 500));
  }
});

// Register a new HR user
export const registerHR = asyncHandler(async (req, res, next) => {
  const { name, phone, email, company } = req.body;
  if (!name || !phone || !email || !company) {
    return next(new ErrorResponse('Please provide name, phone, email, and company', 400));
  }
  const TenantUser = req.tenant.User;
  const existingHR = await TenantUser.findOne({ email });
  if (existingHR) return next(new ErrorResponse('Email already registered', 400));
  const hrPassword = generatePassword();
  try {
    const user = await TenantUser.create({ name, phone, email, password: hrPassword, role: 'HR', company });
    await sendEmail({
      to: email,
      subject: 'Your HR account has been created',
      html: buildCredentialEmail(name, phone, email, hrPassword, 'HR'),
    });
    res.status(201).json({ success: true, message: 'HR created and email sent', data: { id: user._id, email } });
  } catch (err) {
    return next(new ErrorResponse(err.message || 'Failed to create HR', 500));
  }
});
// Get all RMG users
export const getAllRMG = asyncHandler(async (req, res, next) => {
  try {
    const rmgs = await User.find({ role: 'RMG' }).select('-password');
    res.status(200).json({ success: true, count: rmgs.length, data: rmgs });
  } catch (err) {
    return next(new ErrorResponse(err.message || 'Failed to fetch RMG users', 500));
  }
});
// Delete RMG user
export const deleteRmg = asyncHandler(async (req, res, next) => {
  try {
    const rmgId = req.params.id;
    const rmgUser = await User.findOneAndDelete({ _id: rmgId, role: 'RMG' });
    if (!rmgUser) {
      return next(new ErrorResponse('RMG user not found', 404));
    }
    res.status(200).json({ success: true, message: 'RMG deleted' });
  } catch (err) {
    return next(new ErrorResponse(err.message || 'Failed to delete RMG', 500));
  }
});
// controllers/adminController.js
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
// import User from '../models/User.js';
import generatePassword from '../utils/generatePassword.js';
import sendEmail from '../utils/sendEmail.js';
import { roles } from '../models/User.js';

/**
 * Admin registers a single RMG for a company.
    const rmgUser = await TenantUser.findOneAndUpdate(
      { _id: rmgId, role: 'RMG' },
      updates,
      { new: true }
    ).select('-password');
    
    if (!rmgUser) {
      return next(new ErrorResponse('RMG user not found', 404));
    }
    
  // Delete RMG user
    res.status(200).json({ success: true, message: 'RMG updated', data: rmgUser });
  }
  catch (err) {
    return next(new ErrorResponse(err.message || 'Failed to update RMG', 500));
  }
});

  try {
    const TenantUser = req.tenant.User;
    const rmgId = req.params.id;
    
    const rmgUser = await TenantUser.findOneAndDelete(
      { _id: rmgId, role: 'RMG' }
    );
    
    if (!rmgUser) {
  // Register an HR user (multiple allowed)
      return next(new ErrorResponse('RMG user not found', 404));
    }
    
    res.status(200).json({ success: true, message: 'RMG deleted' });
  }
  catch (err) {
    return next(new ErrorResponse(err.message || 'Failed to delete RMG', 500));
  }
});


  const { name: hrName, phone: hrPhone, email: hrEmail, company: hrCompany } = req.body;
  if (!hrName || !hrPhone || !hrEmail || !hrCompany) {
    return next(new ErrorResponse('Please provide name, email and company', 400));
  }
 
  const TenantUser = req.tenant.User;
  const existingHR = await TenantUser.findOne({ email: hrEmail });
  if (existingHR) return next(new ErrorResponse('Email already registered', 400));

  const hrPassword = generatePassword();

  try {
    const user = await TenantUser.create({ name: hrName, phone: hrPhone, email: hrEmail, password: hrPassword, role: 'HR', company: hrCompany });

    await sendEmail({
      to: hrEmail,
      subject: 'Your HR account has been created',
      html: buildCredentialEmail(hrName, hrPhone, hrEmail, hrPassword, 'HR'),
    });

    res.status(201).json({ success: true, message: 'HR created and email sent', data: { id: user._id, email: hrEmail } });
  } catch (err) {
    return next(new ErrorResponse(err.message || 'Failed to create HR', 500));
  }
}); 

/* Helper to build HTML credential email */
const buildCredentialEmail = (name, number, email, password, role) => {
  const loginUrl = 'https://recruterai.netfotech.in/login';
  return `
  <div style="font-family: Inter, Arial, sans-serif; color: #0f172a; line-height:1.5;">
    <div style="max-width:600px;margin:0 auto;border:1px solid #e6eef8;padding:28px;border-radius:8px;">
      <h2 style="margin-top:0;color:#0b5fff">Welcome to Recruiter Portal</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your account has been created by your Company Admin. Use the credentials below to sign in:</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px;border:1px solid #f1f5f9;width:30%">Email</td>
          <td style="padding:8px;border:1px solid #f1f5f9">${email}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #f1f5f9;width:30%">Number</td>
          <td style="padding:8px;border:1px solid #f1f5f9">${number}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #f1f5f9">Password</td>
          <td style="padding:8px;border:1px solid #f1f5f9">${password}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #f1f5f9">Role</td>
          <td style="padding:8px;border:1px solid #f1f5f9">${role}</td>
        </tr>
      </table>
      <p style="margin-top:18px">For security, please change your password after first login. You can login here:</p>
      <p style="text-align:center;margin:20px 0">
        <a href="${loginUrl}" style="display:inline-block;padding:10px 18px;border-radius:6px;background:#0b5fff;color:#fff;text-decoration:none">Go to Login</a>
      </p>
      <hr style="border:none;border-top:1px solid #eef2ff;margin:18px 0"/>
      <p style="color:#475569;font-size:13px;margin:0">If you didn’t expect this email, please contact your company administrator.</p>
      <p style="color:#94a3b8;font-size:12px;margin:12px 0 0">© ${new Date().getFullYear()} Recruiter Portal</p>
    </div>
  </div>
  `;
};

const buildCredentialEmails = (name, email, password, role) => {
  const loginUrl = 'https://recruterai.netfotech.in/login';
  return `
  <div style="font-family: Inter, Arial, sans-serif; color: #0f172a; line-height:1.5;">
    <div style="max-width:600px;margin:0 auto;border:1px solid #e6eef8;padding:28px;border-radius:8px;">
      <h2 style="margin-top:0;color:#0b5fff">Welcome to Recruiter Portal</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>Your account has been created by your Company Admin. Use the credentials below to sign in:</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px;border:1px solid #f1f5f9;width:30%">Email</td>
          <td style="padding:8px;border:1px solid #f1f5f9">${email}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #f1f5f9">Password</td>
          <td style="padding:8px;border:1px solid #f1f5f9">${password}</td>
        </tr>
        <tr>
          <td style="padding:8px;border:1px solid #f1f5f9">Role</td>
          <td style="padding:8px;border:1px solid #f1f5f9">${role}</td>
        </tr>
      </table>
      <p style="margin-top:18px">For security, please change your password after first login. You can login here:</p>
      <p style="text-align:center;margin:20px 0">
        <a href="${loginUrl}" style="display:inline-block;padding:10px 18px;border-radius:6px;background:#0b5fff;color:#fff;text-decoration:none">Go to Login</a>
      </p>
      <hr style="border:none;border-top:1px solid #eef2ff;margin:18px 0"/>
      <p style="color:#475569;font-size:13px;margin:0">If you didn’t expect this email, please contact your company administrator.</p>
      <p style="color:#94a3b8;font-size:12px;margin:12px 0 0">© ${new Date().getFullYear()} Recruiter Portal</p>
    </div>
  </div>
  `;
};

export const getAllHR = asyncHandler(async (req, res, next) => {
  try {
    const recruiters = await User.find({ role: { $in: ['HR'] } }).select('-password');
    res.status(200).json({ success: true, count: recruiters.length, data: recruiters });
  } catch (err) {
    return next(new ErrorResponse(err.message || 'Failed to fetch recruiters', 500));
  }
});
export const getRecruiterById = asyncHandler(async (req, res, next) => {
  try { 
    const recruiterId = req.params.id;
    const recruiter = await User.findById(recruiterId).select('-password');

    if (!recruiter || !['HR'].includes(recruiter.role)) {
      return next(new ErrorResponse('Recruiter not found', 404));
    }

    res.status(200).json({ success: true, data: recruiter });
  } catch (err) {
    return next(new ErrorResponse(err.message || 'Failed to fetch recruiter', 500));
  }
});


export const deleteHR = asyncHandler(async (req, res, next) => {
  try {
    const hrId = req.params.id;

    const hrUser = await User.findOneAndDelete(
      { _id: hrId, role: 'HR' }
    );

    if (!hrUser) {
      return next(new ErrorResponse('HR user not found', 404));
    }

    res.status(200).json({ success: true, message: 'HR deleted' });
  } catch (err) {
    return next(new ErrorResponse(err.message || 'Failed to delete HR', 500));
  }
});

export const updateHR = asyncHandler(async (req, res, next) => {
  try {
    const hrId = req.params.id;
    const updates = req.body;

    const hrUser = await User.findOneAndUpdate(
      { _id: hrId, role: 'HR' },
      updates,
      { new: true }
    ).select('-password'); 
    if (!hrUser) {
      return next(new ErrorResponse('HR user not found', 404));
    }

    res.status(200).json({ success: true, message: 'HR updated', data: hrUser });
  } catch (err) {
    return next(new ErrorResponse(err.message || 'Failed to update HR', 500));
  }
});


export const getHrCreatedByRmg = asyncHandler(async (req, res, next) => {
  try {
    const rmgId = req.user._id;
    const hrUsers = await User.find({ role: 'HR', createdBy: rmgId }).select('-password');
    res.status(200).json({ success: true, count: hrUsers.length, data: hrUsers });
  } catch (err) {
    return next(new ErrorResponse(err.message || 'Failed to fetch HR users', 500));
  }
});  


