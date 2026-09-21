import { verifyToken } from '../services/authService.js';

export const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ success: false, error: 'Authentication required.' });
    req.user = verifyToken(header.slice(7));
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: error.message });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({
      success: false,
      error: `Access denied. This operation requires ${roles.join(' or ')} authorization (Current role: ${req.user?.role || 'NONE'}).`
    });
  }
  next();
};
