const { User } = require('../models');
const AuditLogger = require('../helpers/auditLogger');

class UserAdminController {
    /**
     * Admin can edit user data
     * PUT /users/admin/:id
     */
    static async editUser(req, res, next) {
        try {
            const { id } = req.params;
            const { name, email, role, annualLeaveQuota, joinDate, leaveDate, isActive } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                throw { name: "NotFound", message: "User not found" };
            }

            // Validate dates if both are provided or one is being updated
            const newJoinDate = joinDate !== undefined ? new Date(joinDate) : (user.joinDate ? new Date(user.joinDate) : null);
            const newLeaveDate = leaveDate !== undefined ? (leaveDate ? new Date(leaveDate) : null) : (user.leaveDate ? new Date(user.leaveDate) : null);

            if (newJoinDate && newLeaveDate && newLeaveDate <= newJoinDate) {
                throw { name: "BadRequest", message: "Leave date must be after join date" };
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

            res.status(200).json({
                message: "User updated successfully",
                user: {
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
                }
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

            await user.update({ isActive });

            res.status(200).json({
                message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    isActive: user.isActive
                }
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

            res.status(200).json({
                message: "Employment dates updated successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    joinDate: user.joinDate,
                    leaveDate: user.leaveDate,
                    isActive: user.isActive
                }
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
            const users = await User.findAll({
                attributes: {
                    exclude: ['password']
                },
                order: [['createdAt', 'DESC']]
            });

            res.status(200).json({
                message: "Success fetch all users",
                data: users.map(user => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
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
                }))
            });
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

            res.status(200).json({
                message: "Success fetch user detail",
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
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
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // ENDPOINT: Sync leave quota with actual attendance count
    static async syncLeaveQuota(req, res, next) {
        try {
            const { userId } = req.params;

            if (userId) {
                // Sync specific user
                const user = await User.findByPk(userId);
                if (!user) {
                    return res.status(404).json({
                        message: "User not found"
                    });
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

                return res.status(200).json({
                    message: "Leave quota synced successfully",
                    data: {
                        userId: user.id,
                        name: user.name,
                        email: user.email,
                        oldUsedQuota: oldQuota,
                        newUsedQuota: actualLeaveCount,
                        difference: actualLeaveCount - oldQuota,
                        remainingQuota: user.annualLeaveQuota - actualLeaveCount
                    }
                });
            } else {
                // Sync ALL users
                const users = await User.findAll();
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

                return res.status(200).json({
                    message: `Leave quota synced for ${results.length} users`,
                    data: results
                });
            }
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserAdminController;
