import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include decoded user payload
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    department?: string | null;
  };
}

/**
 * Middleware to authenticate JWT token from Authorization header
 */
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied. Authorization token missing.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Malformed authorization token.' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'blockcert_jwt_secret_key_2026_academic_viva';
    const decoded = jwt.verify(token, secret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      department: decoded.department
    };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
};

/**
 * Middleware to restrict route access to specific roles
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access forbidden. This action requires one of the following roles: ${allowedRoles.join(', ')}.` 
      });
    }

    next();
  };
};
