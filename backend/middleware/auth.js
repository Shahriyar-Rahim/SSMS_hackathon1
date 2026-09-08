import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-smartservice-secret";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "AUTH_REQUIRED: Missing bearer token.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      email: decoded.email,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "TOKEN_INVALID: Authentication token expired or invalid.",
    });
  }
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
