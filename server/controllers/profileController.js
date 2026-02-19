const { User } = require('../models')
const { compare, hashPassword } = require('../helpers/bcrypt')
const AuditLogger = require('../helpers/auditLogger')
const response = require('../helpers/responseHelper')

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

            return response.ok(res, 'User profile', user)
        } catch (error) {
            next(error)
        }
    }

    // Update profile
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.id
            const { name } = req.body

            // Validate name
            if (name !== undefined && name.trim() === '') {
                throw { name: "BadRequest", message: "Name cannot be empty" }
            }

            const user = await User.findByPk(userId)
            if (!user) {
                throw { name: "NotFound", message: "User not found" }
            }

            // Capture old data before update
            const oldData = { name: user.name }

            // Update fields if provided
            if (name) user.name = name

            await user.save()

            // Log to audit
            await AuditLogger.logUpdate(
                userId,
                'Users',
                user.id,
                oldData,
                { name: user.name },
                req.ip,
                req.get('user-agent'),
                `Profile updated: name changed to ${user.name}`
            )

            return response.ok(res, 'Profile updated successfully', {
                id: user.id,
                name: user.name,
                email: user.email
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

            return response.ok(res, 'Password changed successfully')
        } catch (error) {
            next(error)
        }
    }
}

module.exports = ProfileController
