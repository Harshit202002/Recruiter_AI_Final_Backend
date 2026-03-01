import Company from '../models/company.js';
import errorResponse from '../utils/errorResponse.js';

// Middleware to check subscription status and restrict access
export const checkSubscription = async (req, res, next) => {
  try {
    if (!req.user || !req.user.company) {
      return next(new errorResponse('No company context', 403));
    }
    const company = await Company.findById(req.user.company);
    if (!company) return next(new errorResponse('Company not found', 404));
    if (!company.isActive) return next(new errorResponse('Company is deactivated', 403));
    if (company.subscription === 'trial') {
      if (!company.isTrialActive || (company.subscriptionEnd && new Date() > company.subscriptionEnd)) {
        return next(new errorResponse('Trial expired. Please upgrade your subscription.', 403));
      }
    }
    // Optionally restrict features by plan here
    req.company = company;
    next();
  } catch (err) {
    next(new errorResponse('Subscription check failed', 500));
  }
};
