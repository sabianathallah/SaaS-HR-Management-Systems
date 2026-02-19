const { OfficeLocation, Attendance } = require('../models');
const { Op } = require('sequelize');
const { isValidGPSCoordinates, formatGPSCoordinates, generateMapsLink } = require('../helpers/geolocation');
const AuditLogger = require('../helpers/auditLogger');
const tenantIsolation = require('../middlewares/tenantIsolation');

/**
 * ========================================
 * OFFICE LOCATION ADMIN CONTROLLER
 * ========================================
 * Controller untuk admin manage lokasi kantor
 * - Create, Read, Update, Delete office locations
 * - Set radius untuk geo-fencing
 * - Activate/deactivate locations
 */

class OfficeLocationAdminController {
  /**
   * Get all office locations
   * GET /api/admin/office-locations
   */
  static async getAllLocations(req, res, next) {
    try {
      const { is_active, search } = req.query;

      let whereClause = tenantIsolation.addCompanyFilter({}, req);

      // Filter by active status
      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      }

      // Search by name or address
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { address: { [Op.like]: `%${search}%` } }
        ];
      }

      const locations = await OfficeLocation.findAll({
        where: whereClause,
        order: [
          ['is_active', 'DESC'],
          ['name', 'ASC']
        ]
      });

      // Add formatted info
      const locationsWithInfo = locations.map(loc => ({
        ...loc.toJSON(),
        coordinatesFormatted: formatGPSCoordinates(loc.latitude, loc.longitude),
        mapsLink: generateMapsLink(loc.latitude, loc.longitude)
      }));

      res.status(200).json({
        message: 'Office locations retrieved successfully',
        data: locationsWithInfo,
        count: locationsWithInfo.length
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single office location by ID
   * GET /api/admin/office-locations/:id
   */
  static async getLocationById(req, res, next) {
    try {
      const { id } = req.params;

      const location = await OfficeLocation.findByPk(id, {
        include: [{
          model: Attendance,
          as: 'attendances',
          limit: 5,
          order: [['date', 'DESC']],
          attributes: ['id', 'date', 'clockIn', 'status', 'distanceFromOffice']
        }]
      });

      if (!location) {
        return res.status(404).json({
          message: 'Office location not found'
        });
      }

      const locationData = {
        ...location.toJSON(),
        coordinatesFormatted: formatGPSCoordinates(location.latitude, location.longitude),
        mapsLink: generateMapsLink(location.latitude, location.longitude),
        usageStats: {
          totalAttendances: location.attendances?.length || 0
        }
      };

      res.status(200).json({
        message: 'Office location retrieved successfully',
        data: locationData
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new office location
   * POST /api/admin/office-locations
   */
  static async createLocation(req, res, next) {
    try {
      const { name, address, latitude, longitude, radius, is_active } = req.body;

      // Validasi required fields
      if (!name || !latitude || !longitude) {
        return res.status(400).json({
          message: 'Name, latitude, and longitude are required',
          error: 'VALIDATION_ERROR'
        });
      }

      // Validasi GPS coordinates
      if (!isValidGPSCoordinates(latitude, longitude)) {
        return res.status(400).json({
          message: 'Invalid GPS coordinates',
          error: 'INVALID_GPS',
          hint: 'Latitude must be between -90 and 90, Longitude between -180 and 180'
        });
      }

      // Validasi radius (opsional, default di model)
      if (radius && (radius < 10 || radius > 1000)) {
        return res.status(400).json({
          message: 'Radius must be between 10 and 1000 meters',
          error: 'INVALID_RADIUS'
        });
      }

      const newLocation = await OfficeLocation.create({
        name,
        address: address || null,
        latitude,
        longitude,
        radius: radius || 50, // Default 50 meter
        is_active: is_active !== undefined ? is_active : true,
        companyId: req.companyId
      });

      const locationData = {
        ...newLocation.toJSON(),
        coordinatesFormatted: formatGPSCoordinates(newLocation.latitude, newLocation.longitude),
        mapsLink: generateMapsLink(newLocation.latitude, newLocation.longitude)
      };

      // Log to audit
      await AuditLogger.logCreate(
        req.user.id,
        'OfficeLocations',
        newLocation.id,
        newLocation.toJSON(),
        req.ip,
        req.get('user-agent'),
        `Office location created: ${newLocation.name}`
      );

      res.status(201).json({
        message: 'Office location created successfully',
        data: locationData
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Update office location
   * PUT /api/admin/office-locations/:id
   */
  static async updateLocation(req, res, next) {
    try {
      const { id } = req.params;
      const { name, address, latitude, longitude, radius, is_active } = req.body;

      const location = await OfficeLocation.findByPk(id);

      if (!location) {
        return res.status(404).json({
          message: 'Office location not found'
        });
      }

      // Validasi GPS jika diupdate
      if ((latitude || longitude) && !isValidGPSCoordinates(
        latitude || location.latitude,
        longitude || location.longitude
      )) {
        return res.status(400).json({
          message: 'Invalid GPS coordinates',
          error: 'INVALID_GPS'
        });
      }

      // Validasi radius jika diupdate
      if (radius && (radius < 10 || radius > 1000)) {
        return res.status(400).json({
          message: 'Radius must be between 10 and 1000 meters',
          error: 'INVALID_RADIUS'
        });
      }

      // Capture old data before update
      const oldData = { ...location.toJSON() };

      // Update fields
      if (name !== undefined) location.name = name;
      if (address !== undefined) location.address = address;
      if (latitude !== undefined) location.latitude = latitude;
      if (longitude !== undefined) location.longitude = longitude;
      if (radius !== undefined) location.radius = radius;
      if (is_active !== undefined) location.is_active = is_active;

      await location.save();

      const locationData = {
        ...location.toJSON(),
        coordinatesFormatted: formatGPSCoordinates(location.latitude, location.longitude),
        mapsLink: generateMapsLink(location.latitude, location.longitude)
      };

      // Log to audit
      await AuditLogger.logUpdate(
        req.user.id,
        'OfficeLocations',
        location.id,
        oldData,
        location.toJSON(),
        req.ip,
        req.get('user-agent'),
        `Office location updated: ${location.name}`
      );

      res.status(200).json({
        message: 'Office location updated successfully',
        data: locationData
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete office location
   * DELETE /api/admin/office-locations/:id
   */
  static async deleteLocation(req, res, next) {
    try {
      const { id } = req.params;

      const location = await OfficeLocation.findByPk(id);

      if (!location) {
        return res.status(404).json({
          message: 'Office location not found'
        });
      }

      // Check if location is being used
      const attendanceCount = await Attendance.count({
        where: { officeLocationId: id }
      });

      if (attendanceCount > 0) {
        return res.status(400).json({
          message: 'Cannot delete office location that has attendance records',
          error: 'LOCATION_IN_USE',
          attendanceCount,
          hint: 'Consider deactivating instead of deleting'
        });
      }

      // Capture old data before deletion
      const oldData = { ...location.toJSON() };

      await location.destroy();

      // Log to audit
      await AuditLogger.logDelete(
        req.user.id,
        'OfficeLocations',
        id,
        oldData,
        req.ip,
        req.get('user-agent'),
        `Office location deleted: ${oldData.name}`
      );

      res.status(200).json({
        message: 'Office location deleted successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle active status of office location
   * PATCH /api/admin/office-locations/:id/toggle
   */
  static async toggleActive(req, res, next) {
    try {
      const { id } = req.params;

      const location = await OfficeLocation.findByPk(id);

      if (!location) {
        return res.status(404).json({
          message: 'Office location not found'
        });
      }

      location.is_active = !location.is_active;
      await location.save();

      res.status(200).json({
        message: `Office location ${location.is_active ? 'activated' : 'deactivated'} successfully`,
        data: location
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Get statistics for office location usage
   * GET /api/admin/office-locations/:id/stats
   */
  static async getLocationStats(req, res, next) {
    try {
      const { id } = req.params;

      const location = await OfficeLocation.findByPk(id);

      if (!location) {
        return res.status(404).json({
          message: 'Office location not found'
        });
      }

      // Debug: Check total attendances in system
      const totalAttendancesInSystem = await Attendance.count();
      
      // Get attendance statistics using correct column name
      const totalCheckIns = await Attendance.count({
        where: { office_location_id: id }
      });

      const validCheckIns = await Attendance.count({
        where: {
          office_location_id: id,
          locationValidationStatus: 'valid'
        }
      });

      const outsideRadius = await Attendance.count({
        where: {
          office_location_id: id,
          locationValidationStatus: 'outside_radius'
        }
      });

      // Get unique users count using DISTINCT
      const uniqueUsers = await Attendance.count({
        where: { office_location_id: id },
        distinct: true,
        col: 'UserId'
      });

      // Get recent attendances
      const recentAttendances = await Attendance.findAll({
        where: { office_location_id: id },
        limit: 10,
        order: [['date', 'DESC']],
        attributes: ['id', 'date', 'clockIn', 'status', 'distanceFromOffice', 'locationValidationStatus']
      });

      res.status(200).json({
        message: 'Office location statistics retrieved successfully',
        data: {
          totalCheckIns,
          validCheckIns,
          outsideRadius,
          uniqueUsers,
          validPercentage: totalCheckIns > 0 
            ? ((validCheckIns / totalCheckIns) * 100).toFixed(2) 
            : 0,
          location: {
            ...location.toJSON(),
            coordinatesFormatted: formatGPSCoordinates(location.latitude, location.longitude),
            mapsLink: generateMapsLink(location.latitude, location.longitude)
          },
          recentAttendances,
          debug: {
            totalAttendancesInSystem,
            note: totalCheckIns === 0 
              ? 'No attendance records linked to this office location yet. Employees need to clock-in with GPS or admin needs to assign location to existing attendance records.'
              : null
          }
        }
      });

    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Error in getLocationStats:', error);
      next(error);
    }
  }
}

module.exports = OfficeLocationAdminController;
