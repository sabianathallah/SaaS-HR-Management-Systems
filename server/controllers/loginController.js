const { User, Company } = require('../models')
const { compare } = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt')
const AuditLogger = require('../helpers/auditLogger')

class LoginController {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body
            if (!email || !password) throw { name: "BadRequest" }  

            const user = await User.findOne({ 
                where: { email },
                include: [{
                    model: Company,
                    as: 'company',
                    required: false
                }]
            })
            if (!user) throw { name: "LoginError" }

            if (!compare(password, user.password)) throw { name: "LoginError" }

            // Check if user is not super admin and has no company
            if (user.role !== 'SUPER_ADMIN' && !user.companyId) {
                return res.status(403).json({
                    success: false,
                    message: 'User is not associated with any company. Please contact support.'
                })
            }

            // Check if company is active (for non-super admin)
            if (user.company && user.company.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: `Company is ${user.company.status}. Please contact support.`
                })
            }

            // Check subscription expiry
            if (user.company && user.company.subscriptionExpiresAt) {
                const now = new Date()
                const expiryDate = new Date(user.company.subscriptionExpiresAt)
                
                if (now > expiryDate) {
                    return res.status(403).json({
                        success: false,
                        message: 'Company subscription has expired. Please renew to continue.'
                    })
                }
            }

            const payload = {
                id: user.id,
                email: user.email,
                role: user.role,
                companyId: user.companyId
            }

            const access_token = signToken(payload)

            // 📌 Log login activity
            await AuditLogger.logLogin({
                userId: user.id,
                req,
                description: `User ${user.name} (${user.email}) logged in successfully`
            });

            res.status(200).json({ 
                access_token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    companyId: user.companyId,
                    company: user.company ? {
                        id: user.company.id,
                        name: user.company.name,
                        slug: user.company.slug,
                        logo: user.company.logo
                    } : null
                }
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = LoginController