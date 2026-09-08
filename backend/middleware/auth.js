export const authenticate = (req, res, next) => {
  // Demo Mode: Pull user identity from header or default to mock customer
  const userId = req.headers["x-user-id"] || "customer_demo_101";
  const role = req.headers["x-user-role"] || "CUSTOMER";

  req.user = { id: userId, role };
  next();
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "ACCESS_DENIED: Insufficient permissions",
      });
    }
    next();
  };
};
