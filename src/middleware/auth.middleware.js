import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';

export const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required', 
        message: 'No token provided' 
      });
    }

    const decoded = jwttoken.verify(token);
    req.user = decoded;
        
    logger.info(`User ${decoded.email} authenticated`);
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Authentication failed', 
      message: 'Invalid or expired token' 
    });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required', 
          message: 'User not authenticated' 
        });
      }

      if (roles.length && !roles.includes(req.user.role)) {
        logger.warn(`User ${req.user.email} attempted unauthorized access. Required roles: ${roles}, User role: ${req.user.role}`);
        return res.status(403).json({ 
          error: 'Authorization failed', 
          message: 'Insufficient permissions' 
        });
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      return res.status(500).json({ 
        error: 'Authorization error', 
        message: 'Internal server error' 
      });
    }
  };
};