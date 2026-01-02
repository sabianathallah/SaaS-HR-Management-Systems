const { verifyToken } = require('../helpers/jwt')

const authentication = async (req, res, next) => {
    try {
        const { authorization } = req.headers

        if (!authorization) {
            return res.status(401).json({ 
                message: 'Unauthorized: No authorization header provided' 
            });
        }

        const token = authorization.split(' ')[1]
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Unauthorized: Invalid token format. Use: Bearer <token>' 
            });
        }

        const decoded = verifyToken(token)

        req.user = {
            id: decoded.id || decoded.userId,
            userId: decoded.id || decoded.userId,
            email: decoded.email,
            role: decoded.role
        }
        next()
    } catch (err) {
        console.error('Authentication error:', err);
        
        // Handle JWT specific errors with clear messages
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Unauthorized: Invalid token' 
            });
        }
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Unauthorized: Token has expired, please login again' 
            });
        }
        
        next(err)
    }
} 

module.exports = authentication