const { WorkSchedule } = require('../models')

class WorkScheduleAdminController {
  static async getAttendanceSettings(req, res) {
    try {
      const companyId = req.user.companyId
      let schedule = await WorkSchedule.findOne({
        where: { companyId, isActive: true }
      })
      if (!schedule) {
        // Return defaults if no schedule exists yet
        return res.status(200).json({
          success: true,
          data: {
            workingHoursStart: '09:00',
            workingHoursEnd: '17:00',
            allowLateClockIn: true,
            requirePhoto: true,
            requireGPS: true
          }
        })
      }
      return res.status(200).json({
        success: true,
        data: {
          workingHoursStart: schedule.workStartTime,
          workingHoursEnd: schedule.workEndTime,
          allowLateClockIn: schedule.allowLateClockIn,
          requirePhoto: schedule.requirePhoto,
          requireGPS: schedule.requireGPS
        }
      })
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message })
    }
  }

  static async updateAttendanceSettings(req, res) {
    try {
      const companyId = req.user.companyId
      const { workingHoursStart, workingHoursEnd, allowLateClockIn, requirePhoto, requireGPS } = req.body
      let schedule = await WorkSchedule.findOne({
        where: { companyId, isActive: true }
      })
      if (!schedule) {
        schedule = await WorkSchedule.create({
          workStartTime: workingHoursStart || '09:00',
          workEndTime: workingHoursEnd || '17:00',
          autoAbsentTime: '18:00',
          allowLateClockIn: allowLateClockIn ?? true,
          requirePhoto: requirePhoto ?? true,
          requireGPS: requireGPS ?? true,
          isActive: true,
          companyId
        })
      } else {
        await schedule.update({
          workStartTime: workingHoursStart || schedule.workStartTime,
          workEndTime: workingHoursEnd || schedule.workEndTime,
          allowLateClockIn: allowLateClockIn ?? schedule.allowLateClockIn,
          requirePhoto: requirePhoto ?? schedule.requirePhoto,
          requireGPS: requireGPS ?? schedule.requireGPS
        })
      }
      return res.status(200).json({
        success: true,
        message: 'Attendance settings updated successfully',
        data: {
          workingHoursStart: schedule.workStartTime,
          workingHoursEnd: schedule.workEndTime,
          allowLateClockIn: schedule.allowLateClockIn,
          requirePhoto: schedule.requirePhoto,
          requireGPS: schedule.requireGPS
        }
      })
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message })
    }
  }
}

module.exports = WorkScheduleAdminController
