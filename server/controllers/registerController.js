const { User } = require('../models')

class RegisterController {
    static async register(req, res, next) {
        try {
            const { email, password, name } = req.body
            if (!email || !password) throw { name: "BadRequest" }

            const user = await User.create({ email, password, name, role: 'Employee' })

            res.status(201).json({
                message: "Success create new user",
                email: user.email
            })
        } catch (error) {
            next(error)
        }
    }

}

module.exports = RegisterController