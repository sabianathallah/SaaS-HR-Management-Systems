const { User, Attendance } = require('../models');
const AuditLogger = require('../helpers/auditLogger');
const response = require('../helpers/responseHelper');
const { hashPassword } = require('../helpers/bcrypt');

class UserAdminController {
    /**
     * Admin can edit user data
     * PUT /users/admin/:id
     */
    static async editUser(req, res, next) {
        try {
            const { id } = req.params;
            const { name, email, role, annualLeaveQuota, joinDate, leaveDate, isActive, password } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                throw { name: "NotFound", message: "User not found" };
            }

            // Multi-tenant isolation: company admins can only edit users in their own company
            if (req.user.role !== 'SUPER_ADMIN' && user.companyId !== req.user.companyId) {
                throw { name: "Forbidden", message: "Access denied: user does not belong to your company" };
            }

            // Validate dates if both are provided or one is being updated
            const newJoinDate = joinDate !== undefined ? new Date(joinDate) : (user.joinDate ? new Date(user.joinDate) : null);
            const newLeaveDate = leaveDate !== undefined ? (leaveDate ? new Date(leaveDate) : null) : (user.leaveDate ? new Date(user.leaveDate) : null);

            if (newJoinDate && newLeaveDate && newLeaveDate <= newJoinDate) {
                throw { name: "BadRequest", message: "Leave date must be after join date" };
            }

            // Validate and hash password if provided
            if (password !== undefined) {
                if (password.length < 6) {
                    throw { name: "BadRequest", message: "Password must be at least 6 characters" };
                }
            }

            // Prepare update data
            const updateData = {};
            if (name !== undefined) updateData.name = name;
            if (email !== undefined) updateData.email = email;
            if (role !== undefined) updateData.role = role;
            if (annualLeaveQuota !== undefined) updateData.annualLeaveQuota = annualLeaveQuota;
            if (joinDate !== undefined) updateData.joinDate = joinDate ? new Date(joinDate) : null;
            if (leaveDate !== undefined) updateData.leaveDate = leaveDate ? new Date(leaveDate) : null;
            if (isActive !== undefined) updateData.isActive = isActive;
            if (password !== undefined) updateData.password = hashPassword(password);

            const oldData = user.toJSON();
            await user.update(updateData);

            // ===== AUDIT LOG =====
            await AuditLogger.logUpdate({
                userId: req.user.id,
                tableName: 'Users',
                recordId: user.id,
                oldData,
                newData: user.toJSON(),
                req,
                description: `Updated user "${user.name}"`
            });

            return response.ok(res, 'User updated successfully', {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                joinDate: user.joinDate,
                leaveDate: user.leaveDate,
                annualLeaveQuota: user.annualLeaveQuota,
                usedLeaveQuota: user.usedLeaveQuota,
                remainingLeaveQuota: user.remainingLeaveQuota
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin can toggle user active/inactive status
     * PATCH /users/admin/:id/status
     */
    static async toggleUserStatus(req, res, next) {
        try {
            const { id } = req.params;
            let { isActive } = req.body;

            // Handle different input formats
            if (isActive === undefined || isActive === null) {
                throw { name: "BadRequest", message: "isActive field is required" };
            }

            // Convert string to boolean if needed
            if (typeof isActive === 'string') {
                if (isActive.toLowerCase() === 'true') {
                    isActive = true;
                } else if (isActive.toLowerCase() === 'false') {
                    isActive = false;
                } else {
                    throw { name: "BadRequest", message: "isActive must be a boolean value (true or false)" };
                }
            } else if (typeof isActive !== 'boolean') {
                throw { name: "BadRequest", message: "isActive must be a boolean value (true or false)" };
            }

            const user = await User.findByPk(id);
            if (!user) {
                throw { name: "NotFound", message: "User not found" };
            }

            // Multi-tenant isolation: company admins can only toggle users in their own company
            if (req.user.role !== 'SUPER_ADMIN' && user.companyId !== req.user.companyId) {
                throw { name: "Forbidden", message: "Access denied: user does not belong to your company" };
            }

            const oldData = user.toJSON();
            await user.update({ isActive });

            // ===== AUDIT LOG =====
            await AuditLogger.logUpdate({
                userId: req.user.id,
                tableName: 'Users',
                recordId: user.id,
                oldData,
                newData: user.toJSON(),
                req,
                description: `${isActive ? 'Activated' : 'Deactivated'} user "${user.name}"`
            });

            return response.ok(res, `User ${isActive ? 'activated' : 'deactivated'} successfully`, {
                id: user.id,
                name: user.name,
                email: user.email,
                isActive: user.isActive
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin can set join date and leave date
     * PATCH /users/admin/:id/employment-dates
     */
    static async updateEmploymentDates(req, res, next) {
        try {
            const { id } = req.params;
            const { joinDate, leaveDate } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                throw { name: "NotFound", message: "User not found" };
            }

            // Determine the final join and leave dates
            const finalJoinDate = joinDate !== undefined ? (joinDate ? new Date(joinDate) : null) : (user.joinDate ? new Date(user.joinDate) : null);
            const finalLeaveDate = leaveDate !== undefined ? (leaveDate ? new Date(leaveDate) : null) : (user.leaveDate ? new Date(user.leaveDate) : null);

            // Validate that leave date is after join date
            if (finalJoinDate && finalLeaveDate && finalLeaveDate <= finalJoinDate) {
                throw { name: "BadRequest", message: "Leave date must be after join date" };
            }

            const updateData = {};
            if (joinDate !== undefined) updateData.joinDate = joinDate ? new Date(joinDate) : null;
            if (leaveDate !== undefined) updateData.leaveDate = leaveDate ? new Date(leaveDate) : null;

            // If leave date is set, automatically deactivate the user
            if (leaveDate) {
                updateData.isActive = false;
            }

            await user.update(updateData);

            return response.ok(res, 'Employment dates updated successfully', {
                id: user.id,
                name: user.name,
                email: user.email,
                joinDate: user.joinDate,
                leaveDate: user.leaveDate,
                isActive: user.isActive
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin can view all users
     * GET /users/admin
     */
    static async getAllUsers(req, res, next) {
        try {
            // Pagination
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            // Multi-tenant isolation: only filter by companyId for non-SUPER_ADMIN callers
            const whereClause = {};
            if (req.user.role !== 'SUPER_ADMIN') {
                whereClause.companyId = req.user.companyId;
            }

            const { count, rows: users } = await User.findAndCountAll({
                where: whereClause,
                attributes: {
                    exclude: ['password']
                },
                order: [['createdAt', 'DESC']],
                limit,
                offset
            });

            const totalPages = Math.ceil(count / limit);

            return response.ok(
                res,
                'Success fetch all users',
                users.map(user => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    companyId: user.companyId,
                    phoneNumber: user.phoneNumber,
                    position: user.position,
                    department: user.department,
                    ShiftId: user.ShiftId,
                    isActive: user.isActive,
                    joinDate: user.joinDate,
                    leaveDate: user.leaveDate,
                    annualLeaveQuota: user.annualLeaveQuota,
                    usedLeaveQuota: user.usedLeaveQuota,
                    remainingLeaveQuota: user.remainingLeaveQuota,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                })),
                {
                    total: count,
                    page,
                    limit,
                    totalPages
                }
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin can view user detail
     * GET /users/admin/:id
     */
    static async getUserDetail(req, res, next) {
        try {
            const { id } = req.params;

            const user = await User.findByPk(id, {
                attributes: {
                    exclude: ['password']
                }
            });

            if (!user) {
                throw { name: "NotFound", message: "User not found" };
            }

            // Multi-tenant isolation: company admins can only view users in their own company
            if (req.user.role !== 'SUPER_ADMIN' && user.companyId !== req.user.companyId) {
                throw { name: "Forbidden", message: "Access denied: user does not belong to your company" };
            }

            return response.ok(res, 'Success fetch user detail', {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
                phoneNumber: user.phoneNumber,
                position: user.position,
                department: user.department,
                ShiftId: user.ShiftId,
                isActive: user.isActive,
                joinDate: user.joinDate,
                leaveDate: user.leaveDate,
                annualLeaveQuota: user.annualLeaveQuota,
                usedLeaveQuota: user.usedLeaveQuota,
                remainingLeaveQuota: user.remainingLeaveQuota,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Admin can reset an employee's password
     * PUT /users/admin/:id/reset-password
     */
    static async resetPassword(req, res, next) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            if (!newPassword) {
                throw { name: "BadRequest", message: "newPassword is required" };
            }

            if (newPassword.length < 6) {
                throw { name: "BadRequest", message: "Password must be at least 6 characters" };
            }

            const user = await User.findByPk(id);
            if (!user) {
                throw { name: "NotFound", message: "User not found" };
            }

            // Multi-tenant isolation: company admins can only reset passwords for users in their own company
            if (req.user.role !== 'SUPER_ADMIN' && user.companyId !== req.user.companyId) {
                throw { name: "Forbidden", message: "Access denied: user does not belong to your company" };
            }

            const hashedPassword = hashPassword(newPassword);
            await user.update({ password: hashedPassword });

            // ===== AUDIT LOG =====
            await AuditLogger.log({
                userId: req.user.id,
                action: 'UPDATE',
                tableName: 'Users',
                recordId: user.id,
                ipAddress: AuditLogger.getIpAddress(req),
                userAgent: AuditLogger.getUserAgent(req),
                description: `Admin reset password for user ${user.name} (${user.email})`
            });

            return response.ok(res, 'Password reset successfully', {
                id: user.id,
                name: user.name,
                email: user.email
            });
        } catch (error) {
            next(error);
        }
    }

    // ENDPOINT: Sync leave quota with actual attendance count
    static async syncLeaveQuota(req, res, next) {
        try {
            const { userId } = req.params;

            // Multi-tenant isolation: build company filter for non-SUPER_ADMIN callers
            const companyFilter = (req.user.role !== 'SUPER_ADMIN' && req.user.companyId)
                ? { companyId: req.user.companyId }
                : {};

            if (userId) {
                // Sync specific user
                const user = await User.findByPk(userId);
                if (!user) {
                    return response.notFound(res, 'User not found');
                }

                // Count actual LEAVE attendances
                const actualLeaveCount = await Attendance.count({
                    where: {
                        UserId: userId,
                        status: 'LEAVE'
                    }
                });

                const oldQuota = user.usedLeaveQuota;
                user.usedLeaveQuota = actualLeaveCount;
                await user.save();

                return response.ok(res, 'Leave quota synced successfully', {
                    userId: user.id,
                    name: user.name,
                    email: user.email,
                    oldUsedQuota: oldQuota,
                    newUsedQuota: actualLeaveCount,
                    difference: actualLeaveCount - oldQuota,
                    remainingQuota: user.annualLeaveQuota - actualLeaveCount
                });
            } else {
                // Sync ALL users (filtered by company for non-SUPER_ADMIN)
                const users = await User.findAll({ where: companyFilter });
                const results = [];

                for (const user of users) {
                    const actualLeaveCount = await Attendance.count({
                        where: {
                            UserId: user.id,
                            status: 'LEAVE'
                        }
                    });

                    const oldQuota = user.usedLeaveQuota;
                    if (oldQuota !== actualLeaveCount) {
                        user.usedLeaveQuota = actualLeaveCount;
                        await user.save();

                        results.push({
                            userId: user.id,
                            name: user.name,
                            email: user.email,
                            oldUsedQuota: oldQuota,
                            newUsedQuota: actualLeaveCount,
                            difference: actualLeaveCount - oldQuota
                        });
                    }
                }

                return response.ok(res, `Leave quota synced for ${results.length} users`, results);
            }
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserAdminController;
