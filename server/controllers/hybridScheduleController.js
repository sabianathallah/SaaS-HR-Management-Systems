const { HybridSchedule, User } = require('../models');
const { Op } = require('sequelize');

class HybridScheduleController {
  
  // Employee: Get own hybrid schedule
  static async getOwnSchedule(req, res, next) {
    try {
      const userId = req.user.id;

      const schedules = await HybridSchedule.findAll({
        where: {
          UserId: userId,
          isActive: true
        },
        order: [['dayOfWeek', 'ASC']]
      });

      // Format response dengan nama hari
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const formattedSchedules = schedules.map(schedule => ({
        ...schedule.toJSON(),
        dayName: dayNames[schedule.dayOfWeek]
      }));

      res.status(200).json({
        message: 'Hybrid schedule retrieved successfully',
        data: formattedSchedules
      });
    } catch (error) {
      next(error);
    }
  }

  // Employee: Create/Update hybrid schedule
  static async upsertSchedule(req, res, next) {
    try {
      const userId = req.user.id;
      const { schedules } = req.body; // Array of { dayOfWeek, locationType }

      if (!schedules || !Array.isArray(schedules)) {
        return res.status(400).json({ 
          message: 'Schedules must be an array' 
        });
      }

      // Validasi schedules
      for (const schedule of schedules) {
        if (schedule.dayOfWeek < 0 || schedule.dayOfWeek > 6) {
          return res.status(400).json({ 
            message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' 
          });
        }

        if (!['ONSITE', 'WFH', 'REMOTE'].includes(schedule.locationType)) {
          return res.status(400).json({ 
            message: 'Location type must be ONSITE, WFH, or REMOTE' 
          });
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

      res.status(200).json({
        message: 'Hybrid schedule updated successfully',
        data: formattedSchedules
      });
    } catch (error) {
      next(error);
    }
  }

  // Employee: Delete hybrid schedule (reset to default)
  static async deleteSchedule(req, res, next) {
    try {
      const userId = req.user.id;

      await HybridSchedule.destroy({
        where: { UserId: userId }
      });

      res.status(200).json({
        message: 'Hybrid schedule deleted successfully. You will use the default onsite schedule.'
      });
    } catch (error) {
      next(error);
    }
  }

  // Helper: Get location type for a specific date
  static async getLocationTypeForDate(userId, date) {
    const dayOfWeek = new Date(date).getDay();
    
    const schedule = await HybridSchedule.findOne({
      where: {
        UserId: userId,
        dayOfWeek,
        isActive: true
      }
    });

    return schedule ? schedule.locationType : 'ONSITE';
  }
}

module.exports = HybridScheduleController;
