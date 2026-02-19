const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const signToken = (payload) => {
    return jwt.sign(payload, secretKey, { expiresIn: '24h' })
}

const verifyToken = (token) => {
    return jwt.verify(token, secretKey)
}


module.exports = { signToken, verifyToken }