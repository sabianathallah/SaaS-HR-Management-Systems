const { User } = require('../models')
const { compare } = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt')
const AuditLogger = require('../helpers/auditLogger')

class LoginController {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body
            if (!email || !password) throw { name: "BadRequest" }  

            const user = await User.findOne({ where: { email } })
            if (!user) throw { name: "LoginError" }

            if (!compare(password, user.password)) throw { name: "LoginError" }

            const payload = {
                id: user.id,
                email: user.email,
                role: user.role
                
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
                    role: user.role
                }
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = LoginController