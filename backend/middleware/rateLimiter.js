const requestCounts = new Map();

export const rateLimiter = (limit = 30, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const record = requestCounts.get(ip);
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    record.count += 1;
    if (record.count > limit) {
      return res.status(429).json({
        success: false,
        error: "TOO_MANY_REQUESTS: Rate limit exceeded. Try again later.",
      });
    }

    next();
  };
};
