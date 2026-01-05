const { User } = require('../models')

class RegisterController {
    static async register(req, res, next) {
        try {
            const { email, password, name, joinDate } = req.body
            if (!email || !password) throw { name: "BadRequest" }

            const userData = { 
                email, 
                password, 
                name, 
                role: 'Employee',
                isActive: true
            }

            // Add joinDate if provided, otherwise use current date
            if (joinDate) {
                userData.joinDate = joinDate
            } else {
                userData.joinDate = new Date()
            }

            const user = await User.create(userData)

            res.status(201).json({
                message: "Success create new user",
                email: user.email,
                name: user.name,
                joinDate: user.joinDate,
                isActive: user.isActive
            })
        } catch (error) {
            next(error)
        }
    }

}

module.exports = RegisterController