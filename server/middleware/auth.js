const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'super_secret_jwt_token_for_professional_news_portal';
      const decoded = jwt.verify(token, secret);

      // 1. Attempt to retrieve user profile by ID
      let user = null;
      if (decoded.id) {
        try {
          user = await User.findById(decoded.id);
        } catch (e) {
          // Ignore invalid ObjectId format
        }
      }

      // 2. If not found by ID, attempt lookup by email
      if (!user && decoded.email) {
        try {
          user = await User.findOne({ email: decoded.email });
        } catch (e) {
          // Ignore
        }
      }

      // 3. If user found in database, attach real user record
      if (user) {
        req.user = {
          id: user._id ? user._id.toString() : user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
        return next();
      }

      // 4. If token is verified and has role (e.g. valid session after DB reset/restart), allow gracefully
      if (decoded.role) {
        req.user = {
          id: decoded.id || 'admin_id',
          name: decoded.name || 'Admin',
          email: decoded.email || 'admin@news.com',
          role: decoded.role
        };
        return next();
      }

      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
