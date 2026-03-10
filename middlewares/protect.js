
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';
import { config } from '../config/index.js';
import { tenantResolver } from './tenantResolver.js';

export const protects = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized', 401));
  }

  const decoded = jwt.verify(token, config.jwtSecret);

  const user = await User.findById(decoded.id);

  // ✅ Check user exists
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // ✅ IMPORTANT: Check active status
  if (!user.isActive) {
    return next(new ErrorResponse('Account is deactivated', 403));
  }

  req.user = user;

  // Attach tenant context
  await tenantResolver(req, res, next);
  if (!res.headersSent) next();
});