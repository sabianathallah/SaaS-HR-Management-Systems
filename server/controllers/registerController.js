const { User } = require('../models')
const AuditLogger = require('../helpers/auditLogger')

class RegisterController {
    static async register(req, res, next) {
        try {
            const { 
                email, 
                password, 
                name, 
                phoneNumber, 
                role, 
                position, 
                department, 
                joinDate,
                isActive 
            } = req.body
            
            if (!email || !password || !name) {
                throw { name: "BadRequest", message: "Email, password, and name are required" }
            }

            const userData = { 
                email, 
                password, 
                name, 
                phoneNumber: phoneNumber || null,
                role: role || 'EMPLOYEE',
                position: position || null,
                department: department || null,
                isActive: isActive !== undefined ? isActive : true
            }

            // Add joinDate if provided, otherwise use current date
            if (joinDate) {
                userData.joinDate = joinDate
            } else {
                userData.joinDate = new Date()
            }

            const user = await User.create(userData)

            // Log to audit (if req.user exists, meaning admin is creating user)
            if (req.user) {
                await AuditLogger.logCreate(
                    req.user.id,
                    'Users',
                    user.id,
                    {
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        position: user.position,
                        department: user.department
                    },
                    req.ip,
                    req.get('user-agent'),
                    `User registered: ${user.name} (${user.email})`
                )
            }

            res.status(201).json({
                message: "Employee created successfully",
                data: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    position: user.position,
                    department: user.department,
                    joinDate: user.joinDate,
                    isActive: user.isActive
                }
            })
        } catch (error) {
            next(error)
        }
    }

}

module.exports = RegisterController