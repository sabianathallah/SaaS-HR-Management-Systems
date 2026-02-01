const { WorkLocationChangeRequest, User, HybridSchedule } = require('../models');
const { Op } = require('sequelize');

class WorkLocationChangeRequestController {
  
  // Employee: Create new work location change request
  static async createRequest(req, res, next) {
    try {
      const userId = req.user.id;
      const { requestDate, requestedLocationType, reason } = req.body;

      // Validasi input
      if (!requestDate || !requestedLocationType || !reason) {
        return res.status(400).json({ 
          message: 'Request date, requested location type, and reason are required' 
        });
      }

      // Validasi request date tidak boleh di masa lalu
      const reqDate = new Date(requestDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (reqDate < today) {
        return res.status(400).json({ 
          message: 'Request date cannot be in the past' 
        });
      }

      // Check apakah sudah ada request untuk tanggal yang sama
      const existingRequest = await WorkLocationChangeRequest.findOne({
        where: {
          UserId: userId,
          requestDate,
          status: {
            [Op.in]: ['PENDING', 'APPROVED']
          }
        }
      });

      if (existingRequest) {
        return res.status(400).json({ 
          message: 'You already have a pending or approved request for this date' 
        });
      }

      // Determine original location type from hybrid schedule
      const dayOfWeek = reqDate.getDay();
      const hybridSchedule = await HybridSchedule.findOne({
        where: {
          UserId: userId,
          dayOfWeek,
          isActive: true
        }
      });

      // Default location type adalah ONSITE jika tidak ada hybrid schedule
      const originalLocationType = hybridSchedule ? hybridSchedule.locationType : 'ONSITE';

      // Validasi tidak boleh request ke lokasi yang sama
      if (originalLocationType === requestedLocationType) {
        return res.status(400).json({ 
          message: `You are already scheduled for ${requestedLocationType} on this date` 
        });
      }

      // Create request
      const newRequest = await WorkLocationChangeRequest.create({
        UserId: userId,
        requestDate,
        originalLocationType,
        requestedLocationType,
        reason,
        status: 'PENDING'
      });

      const requestWithDetails = await WorkLocationChangeRequest.findByPk(newRequest.id, {
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'name', 'email', 'position', 'department']
          }
        ]
      });

      res.status(201).json({
        message: 'Work location change request created successfully',
        data: requestWithDetails
      });
    } catch (error) {
      next(error);
    }
  }

  // Employee: Get all own requests
  static async getOwnRequests(req, res, next) {
    try {
      const userId = req.user.id;
      const { status, startDate, endDate } = req.query;

      const whereClause = { UserId: userId };

      if (status) {
        whereClause.status = status;
      }

      if (startDate && endDate) {
        whereClause.requestDate = {
          [Op.between]: [startDate, endDate]
        };
      } else if (startDate) {
        whereClause.requestDate = {
          [Op.gte]: startDate
        };
      } else if (endDate) {
        whereClause.requestDate = {
          [Op.lte]: endDate
        };
      }

      const requests = await WorkLocationChangeRequest.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['requestDate', 'DESC'], ['createdAt', 'DESC']]
      });

      res.status(200).json({
        message: 'Work location change requests retrieved successfully',
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }

  // Employee: Cancel own request
  static async cancelRequest(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const request = await WorkLocationChangeRequest.findOne({
        where: {
          id,
          UserId: userId
        }
      });

      if (!request) {
        return res.status(404).json({ 
          message: 'Request not found' 
        });
      }

      if (request.status !== 'PENDING') {
        return res.status(400).json({ 
          message: 'Only pending requests can be cancelled' 
        });
      }

      await request.update({ status: 'CANCELLED' });

      res.status(200).json({
        message: 'Request cancelled successfully',
        data: request
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WorkLocationChangeRequestController;
