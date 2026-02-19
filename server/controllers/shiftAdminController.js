const { Shift, User, Attendance } = require('../models');
const AuditLogger = require('../helpers/auditLogger');
const response = require('../helpers/responseHelper');

/**
 * Controller untuk CRUD Shift (Admin only)
 */

class ShiftAdminController {
  /**
   * GET /api/admin/shifts
   * Get all shifts
   */
  static async getAllShifts(req, res, next) {
    try {
      const shifts = await Shift.findAll({
        order: [['id', 'ASC']],
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      return response.ok(res, 'Successfully retrieved all shifts', shifts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/shifts/:id
   * Get shift by ID
   */
  static async getShiftById(req, res, next) {
    try {
      const { id } = req.params;

      const shift = await Shift.findByPk(id, {
        include: [
          {
            model: User,
            as: 'users',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!shift) {
        return response.notFound(res, `Shift with ID ${id} not found`);
      }

      return response.ok(res, 'Successfully retrieved shift', shift);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/shifts
   * Create new shift
   */
  static async createShift(req, res, next) {
    try {
      const {
        name,
        startTime,
        endTime,
        breakDuration,
        lateTolerance,
        overtimeThreshold,
        isFlexible,
        description,
        isActive
      } = req.body;

      // Validation
      const errors = [];
      if (!name || name.trim() === '') {
        errors.push('name is required and cannot be empty');
      }
      if (!startTime || startTime.trim() === '') {
        errors.push('startTime is required and cannot be empty');
      }
      if (!endTime || endTime.trim() === '') {
        errors.push('endTime is required and cannot be empty');
      }

      if (errors.length > 0) {
        return response.badRequest(res, `Validation failed: ${errors.join(', ')}`);
      }

      const newShift = await Shift.create({
        name,
        startTime,
        endTime,
        breakDuration: breakDuration || 60,
        lateTolerance: lateTolerance || 15,
        overtimeThreshold: overtimeThreshold || 15,
        isFlexible: isFlexible || false,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true
      });

      // ===== AUDIT LOG =====
      await AuditLogger.logCreate({
        userId: req.user.id,
        tableName: 'Shifts',
        recordId: newShift.id,
        newData: newShift.toJSON(),
        req,
        description: `Created shift "${newShift.name}"`
      });

      return response.created(res, 'Shift created successfully', newShift);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/shifts/:id
   * Update shift
   */
  static async updateShift(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        startTime,
        endTime,
        breakDuration,
        lateTolerance,
        overtimeThreshold,
        isFlexible,
        description,
        isActive
      } = req.body;

      const shift = await Shift.findByPk(id);

      if (!shift) {
        return response.notFound(res, `Shift with ID ${id} not found`);
      }

      // Update fields
      if (name !== undefined) shift.name = name;
      if (startTime !== undefined) shift.startTime = startTime;
      if (endTime !== undefined) shift.endTime = endTime;
      if (breakDuration !== undefined) shift.breakDuration = breakDuration;
      if (lateTolerance !== undefined) shift.lateTolerance = lateTolerance;
      if (overtimeThreshold !== undefined) shift.overtimeThreshold = overtimeThreshold;
      if (isFlexible !== undefined) shift.isFlexible = isFlexible;
      if (description !== undefined) shift.description = description;
      if (isActive !== undefined) shift.isActive = isActive;

      const oldData = shift._previousDataValues || {};
      await shift.save();

      // ===== AUDIT LOG =====
      await AuditLogger.logUpdate({
        userId: req.user.id,
        tableName: 'Shifts',
        recordId: shift.id,
        oldData,
        newData: shift.toJSON(),
        req,
        description: `Updated shift "${shift.name}"`
      });

      return response.ok(res, 'Shift updated successfully', shift);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/shifts/:id
   * Delete shift
   */
  static async deleteShift(req, res, next) {
    try {
      const { id } = req.params;

      const shift = await Shift.findByPk(id);

      if (!shift) {
        return response.notFound(res, `Shift with ID ${id} not found`);
      }

      // Check if shift is being used by users or attendances
      const usersCount = await User.count({ where: { ShiftId: id } });
      const attendancesCount = await Attendance.count({ where: { ShiftId: id } });

      if (usersCount > 0 || attendancesCount > 0) {
        return response.badRequest(res, `Cannot delete shift. It is being used by ${usersCount} user(s) and ${attendancesCount} attendance(s). Please reassign them first.`);
      }

      // Save old data for audit log before destroying
      const oldData = shift.toJSON();

      await shift.destroy();

      // ===== AUDIT LOG =====
      await AuditLogger.logDelete({
        userId: req.user.id,
        tableName: 'Shifts',
        recordId: id,
        oldData,
        req,
        description: `Deleted shift "${oldData.name}"`
      });

      return response.ok(res, 'Shift deleted successfully', { id });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/users/:userId/shift
   * Assign shift to user
   */
  static async assignShiftToUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { shiftId } = req.body;

      if (!shiftId) {
        return response.badRequest(res, 'shiftId is required');
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return response.notFound(res, `User with ID ${userId} not found`);
      }

      const shift = await Shift.findByPk(shiftId);
      if (!shift) {
        return response.notFound(res, `Shift with ID ${shiftId} not found`);
      }

      if (!shift.isActive) {
        return response.badRequest(res, 'Cannot assign inactive shift to user');
      }

      user.ShiftId = shiftId;
      await user.save();

      const updatedUser = await User.findByPk(userId, {
        include: [{ model: Shift, as: 'shift' }]
      });

      return response.ok(res, 'Shift assigned to user successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/users/:userId/shift
   * Remove shift from user
   */
  static async removeShiftFromUser(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId);
      if (!user) {
        return response.notFound(res, `User with ID ${userId} not found`);
      }

      user.ShiftId = null;
      await user.save();

      return response.ok(res, 'Shift removed from user successfully', user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ShiftAdminController;
