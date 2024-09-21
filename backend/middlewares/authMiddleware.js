const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(400).json({ errors: "Token is required" });
  }

  const token = authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'
  if (!token) {
    return res.status(400).json({ errors: "Token is required" });
  }

  try {
    const tokenData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: tokenData.id,
    };
    next();
  } catch (err) {
    return res.status(401).json({ errors: "Invalid or expired token" });
  }
}

module.exports = authenticateUser;
