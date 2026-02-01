const { WorkLocationChangeRequest, User } = require('../models');
const { Op } = require('sequelize');

class WorkLocationChangeRequestAdminController {
  
  // Admin: Get all requests
  static async getAllRequests(req, res, next) {
    try {
      const { status, userId, startDate, endDate, page = 1, limit = 10 } = req.query;

      const whereClause = {};

      if (status) {
        whereClause.status = status;
      }

      if (userId) {
        whereClause.UserId = userId;
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

      const offset = (page - 1) * limit;

      const { count, rows: requests } = await WorkLocationChangeRequest.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'name', 'email', 'position', 'department']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'name', 'email']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['requestDate', 'DESC'], ['createdAt', 'DESC']]
      });

      res.status(200).json({
        message: 'Work location change requests retrieved successfully',
        data: requests,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get pending requests
  static async getPendingRequests(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: requests } = await WorkLocationChangeRequest.findAndCountAll({
        where: {
          status: 'PENDING'
        },
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'name', 'email', 'position', 'department']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['requestDate', 'ASC'], ['createdAt', 'ASC']]
      });

      res.status(200).json({
        message: 'Pending work location change requests retrieved successfully',
        data: requests,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Approve request
  static async approveRequest(req, res, next) {
    try {
      const adminId = req.user.id;
      const { id } = req.params;

      const request = await WorkLocationChangeRequest.findByPk(id, {
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      if (!request) {
        return res.status(404).json({ 
          message: 'Request not found' 
        });
      }

      if (request.status !== 'PENDING') {
        return res.status(400).json({ 
          message: 'Only pending requests can be approved' 
        });
      }

      await request.update({
        status: 'APPROVED',
        approvedBy: adminId,
        approvalDate: new Date()
      });

      const updatedRequest = await WorkLocationChangeRequest.findByPk(id, {
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'name', 'email', 'position', 'department']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      res.status(200).json({
        message: 'Work location change request approved successfully',
        data: updatedRequest
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Reject request
  static async rejectRequest(req, res, next) {
    try {
      const adminId = req.user.id;
      const { id } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        return res.status(400).json({ 
          message: 'Rejection reason is required' 
        });
      }

      const request = await WorkLocationChangeRequest.findByPk(id);

      if (!request) {
        return res.status(404).json({ 
          message: 'Request not found' 
        });
      }

      if (request.status !== 'PENDING') {
        return res.status(400).json({ 
          message: 'Only pending requests can be rejected' 
        });
      }

      await request.update({
        status: 'REJECTED',
        approvedBy: adminId,
        approvalDate: new Date(),
        rejectionReason
      });

      const updatedRequest = await WorkLocationChangeRequest.findByPk(id, {
        include: [
          {
            model: User,
            as: 'employee',
            attributes: ['id', 'name', 'email', 'position', 'department']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      res.status(200).json({
        message: 'Work location change request rejected successfully',
        data: updatedRequest
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get statistics
  static async getStatistics(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const whereClause = {};

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

      const [total, pending, approved, rejected, cancelled] = await Promise.all([
        WorkLocationChangeRequest.count({ where: whereClause }),
        WorkLocationChangeRequest.count({ where: { ...whereClause, status: 'PENDING' } }),
        WorkLocationChangeRequest.count({ where: { ...whereClause, status: 'APPROVED' } }),
        WorkLocationChangeRequest.count({ where: { ...whereClause, status: 'REJECTED' } }),
        WorkLocationChangeRequest.count({ where: { ...whereClause, status: 'CANCELLED' } })
      ]);

      // Get breakdown by requested location type
      const locationTypeBreakdown = await WorkLocationChangeRequest.findAll({
        where: whereClause,
        attributes: [
          'requestedLocationType',
          [require('sequelize').fn('COUNT', require('sequelize').col('requestedLocationType')), 'count']
        ],
        group: ['requestedLocationType'],
        raw: true
      });

      res.status(200).json({
        message: 'Statistics retrieved successfully',
        data: {
          total,
          byStatus: {
            pending,
            approved,
            rejected,
            cancelled
          },
          byLocationType: locationTypeBreakdown.reduce((acc, item) => {
            acc[item.requestedLocationType] = parseInt(item.count);
            return acc;
          }, {})
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WorkLocationChangeRequestAdminController;
