// Check if user has admin role
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next(); // User is admin, continue to the route
    } else {
      res.status(403).json({ message: 'Not authorized as an admin' });
    }
  };
  
  module.exports = admin;
  