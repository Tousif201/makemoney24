// =====================================
// File: middleware/auth.middleware.js
// =====================================

import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js"; // Import User model

/**
 * @desc Middleware to protect routes (ensure user is logged in)
 */
export const protect = async (req, res, next) => {
  let token;

  // Check if token exists in headers (Authorization: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to the request object (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error("Token verification failed (header):", error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Not authorized, token expired" });
      }
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  // If no token in header, check cookies
  else if (req.cookies && req.cookies.token) {
    try {
      token = req.cookies.token;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to the request object (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error("Token verification failed (cookie):", error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Not authorized, token expired" });
      }
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

/**
 * @desc Middleware to authorize users based on roles
 * @param {Array<string>} roles - Array of roles allowed to access the route
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ message: "Not authorized, no user roles found" });
    }

    const hasPermission = roles.some((role) => req.user.roles.includes(role));

    if (hasPermission) {
      next(); // User has the required role(s), proceed
    } else {
      res.status(403).json({ message: "Not authorized to access this route" });
    }
  };
};
