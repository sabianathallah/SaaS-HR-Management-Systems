const { User } = require('../models')
const { compare } = require('../helpers/bcrypt')
const { signToken } = require('../helpers/jwt')

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

            res.status(200).json({ access_token })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = LoginController