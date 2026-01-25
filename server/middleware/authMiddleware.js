// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user from token to request object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      res.status(401);
      
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired, please login again');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw new Error('Not authorized');
      }
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Optional: Middleware for routes that can work with or without authentication
const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Don't throw error, just continue without user
      console.log('Optional auth failed:', error.message);
    }
  }
  
  next();
});

// Admin middleware
const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as admin');
  }
});

// Check if user owns resource or is admin
const authorizeResource = (resourceUserId) => {
  return asyncHandler(async (req, res, next) => {
    // If user is admin, allow
    if (req.user.role === 'admin') {
      return next();
    }

    // If user owns the resource, allow
    if (req.user._id.toString() === resourceUserId.toString()) {
      return next();
    }

    res.status(403);
    throw new Error('Not authorized to access this resource');
  });
};

export { protect, optionalProtect, admin, authorizeResource };