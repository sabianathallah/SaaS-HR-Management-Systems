const { HybridSchedule, User } = require('../models');
const { Op } = require('sequelize');
const response = require('../helpers/responseHelper');

class HybridScheduleAdminController {

  // Admin: Get all hybrid schedules
  static async getAllSchedules(req, res, next) {
    try {
      const { userId, department, page = 1, limit = 10 } = req.query;

      const whereClause = {};
      const userWhereClause = {};

      if (userId) {
        whereClause.UserId = userId;
      }

      if (department) {
        userWhereClause.department = department;
      }

      const offset = (page - 1) * limit;

      // Get unique users with hybrid schedules
      const { count, rows: schedules } = await HybridSchedule.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'name', 'email', 'position', 'department'],
            where: Object.keys(userWhereClause).length > 0 ? userWhereClause : undefined
          }
        ],
        distinct: true,
        order: [['UserId', 'ASC'], ['dayOfWeek', 'ASC']]
      });

      // Group schedules by user
      const groupedSchedules = schedules.reduce((acc, schedule) => {
        const userId = schedule.UserId;

        if (!acc[userId]) {
          acc[userId] = {
            user: schedule.employee,
            schedules: []
          };
        }

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        acc[userId].schedules.push({
          id: schedule.id,
          dayOfWeek: schedule.dayOfWeek,
          dayName: dayNames[schedule.dayOfWeek],
          locationType: schedule.locationType,
          isActive: schedule.isActive,
          createdAt: schedule.createdAt,
          updatedAt: schedule.updatedAt
        });

        return acc;
      }, {});

      const result = Object.values(groupedSchedules);

      return response.ok(res, 'Hybrid schedules retrieved successfully', result, {
        totalItems: Object.keys(groupedSchedules).length,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get hybrid schedule by user ID
  static async getScheduleByUserId(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId, {
        attributes: ['id', 'name', 'email', 'position', 'department']
      });

      if (!user) {
        return response.notFound(res, 'User not found');
      }

      const schedules = await HybridSchedule.findAll({
        where: {
          UserId: userId,
          isActive: true
        },
        order: [['dayOfWeek', 'ASC']]
      });

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const formattedSchedules = schedules.map(schedule => ({
        ...schedule.toJSON(),
        dayName: dayNames[schedule.dayOfWeek]
      }));

      return response.ok(res, 'Hybrid schedule retrieved successfully', {
        user,
        schedules: formattedSchedules
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Create/Update hybrid schedule for a user
  static async upsertScheduleForUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { schedules } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return response.notFound(res, 'User not found');
      }

      if (!schedules || !Array.isArray(schedules)) {
        return response.badRequest(res, 'Schedules must be an array');
      }

      // Validasi schedules
      for (const schedule of schedules) {
        if (schedule.dayOfWeek < 0 || schedule.dayOfWeek > 6) {
          return response.badRequest(res, 'Day of week must be between 0 (Sunday) and 6 (Saturday)');
        }

        if (!['ONSITE', 'WFH', 'REMOTE'].includes(schedule.locationType)) {
          return response.badRequest(res, 'Location type must be ONSITE, WFH, or REMOTE');
        }
      }

      // Delete existing schedules
      await HybridSchedule.destroy({
        where: { UserId: userId }
      });

      // Create new schedules
      const newSchedules = await Promise.all(
        schedules.map(schedule =>
          HybridSchedule.create({
            UserId: userId,
            dayOfWeek: schedule.dayOfWeek,
            locationType: schedule.locationType,
            isActive: true
          })
        )
      );

      // Format response
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const formattedSchedules = newSchedules.map(schedule => ({
        ...schedule.toJSON(),
        dayName: dayNames[schedule.dayOfWeek]
      }));

      return response.ok(res, 'Hybrid schedule updated successfully', {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          position: user.position,
          department: user.department
        },
        schedules: formattedSchedules
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Delete hybrid schedule for a user
  static async deleteScheduleForUser(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId);
      if (!user) {
        return response.notFound(res, 'User not found');
      }

      await HybridSchedule.destroy({
        where: { UserId: userId }
      });

      return response.ok(res, `Hybrid schedule deleted successfully for ${user.name}. User will use the default onsite schedule.`);
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get statistics
  static async getStatistics(req, res, next) {
    try {
      const totalUsersWithHybrid = await HybridSchedule.count({
        distinct: true,
        col: 'UserId'
      });

      // Get breakdown by location type per day
      const locationTypeBreakdown = await HybridSchedule.findAll({
        attributes: [
          'dayOfWeek',
          'locationType',
          [require('sequelize').fn('COUNT', require('sequelize').col('locationType')), 'count']
        ],
        where: {
          isActive: true
        },
        group: ['dayOfWeek', 'locationType'],
        raw: true,
        order: [['dayOfWeek', 'ASC']]
      });

      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      // Format breakdown
      const formattedBreakdown = {};
      for (let i = 0; i < 7; i++) {
        formattedBreakdown[dayNames[i]] = {
          ONSITE: 0,
          WFH: 0,
          REMOTE: 0
        };
      }

      locationTypeBreakdown.forEach(item => {
        const dayName = dayNames[item.dayOfWeek];
        formattedBreakdown[dayName][item.locationType] = parseInt(item.count);
      });

      return response.ok(res, 'Statistics retrieved successfully', {
        totalUsersWithHybridSchedule: totalUsersWithHybrid,
        breakdownByDay: formattedBreakdown
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HybridScheduleAdminController;
