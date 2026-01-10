const { User } = require('../models')
const { compare, hashPassword } = require('../helpers/bcrypt')

class ProfileController {
    // Get user profile
    static async getProfile(req, res, next) {
        try {
            const userId = req.user.id

            const user = await User.findByPk(userId, {
                attributes: { 
                    exclude: ['password', 'createdAt', 'updatedAt'] 
                }
            })

            if (!user) {
                throw { name: "NotFound", message: "User not found" }
            }

            res.status(200).json({
                message: "User profile",
                data: user
            })
        } catch (error) {
            next(error)
        }
    }

    // Update profile
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.id
            const { name } = req.body

            const user = await User.findByPk(userId)
            if (!user) {
                throw { name: "NotFound", message: "User not found" }
            }

            // Update fields if provided
            if (name) user.name = name

            await user.save()

            res.status(200).json({
                message: "Profile updated successfully",
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            })
        } catch (error) {
            next(error)
        }
    }

    // Change password
    static async changePassword(req, res, next) {
        try {
            const userId = req.user.id
            const { oldPassword, newPassword } = req.body

            // Validation
            if (!oldPassword || !newPassword) {
                throw { 
                    name: "BadRequest", 
                    message: "Old password and new password are required" 
                }
            }

            if (newPassword.length < 6) {
                throw { 
                    name: "BadRequest", 
                    message: "New password must be at least 6 characters" 
                }
            }

            // Get user
            const user = await User.findByPk(userId)
            if (!user) {
                throw { name: "NotFound", message: "User not found" }
            }

            // Verify old password
            const isPasswordValid = compare(oldPassword, user.password)
            if (!isPasswordValid) {
                throw { 
                    name: "Unauthorized", 
                    message: "Old password is incorrect" 
                }
            }

            // Update password
            user.password = hashPassword(newPassword)
            await user.save()

            res.status(200).json({
                message: "Password changed successfully"
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = ProfileController
