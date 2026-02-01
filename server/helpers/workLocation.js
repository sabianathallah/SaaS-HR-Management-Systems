const { HybridSchedule, WorkLocationChangeRequest } = require('../models');
const { Op } = require('sequelize');

/**
 * Mendapatkan location type untuk user pada tanggal tertentu
 * Urutan prioritas:
 * 1. Approved Work Location Change Request (temporary override)
 * 2. Hybrid Schedule (recurring pattern)
 * 3. Default: ONSITE
 * 
 * @param {number} userId - ID user
 * @param {Date|string} date - Tanggal yang dicek
 * @returns {Promise<string>} - Location type: 'ONSITE', 'WFH', atau 'REMOTE'
 */
async function getEffectiveLocationType(userId, date) {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const dateOnly = targetDate.toISOString().split('T')[0];

  // 1. Check approved work location change request (highest priority)
  const changeRequest = await WorkLocationChangeRequest.findOne({
    where: {
      UserId: userId,
      requestDate: dateOnly,
      status: 'APPROVED'
    }
  });

  if (changeRequest) {
    return changeRequest.requestedLocationType;
  }

  // 2. Check hybrid schedule (recurring pattern)
  const dayOfWeek = targetDate.getDay();
  const hybridSchedule = await HybridSchedule.findOne({
    where: {
      UserId: userId,
      dayOfWeek,
      isActive: true
    }
  });

  if (hybridSchedule) {
    return hybridSchedule.locationType;
  }

  // 3. Default location type
  return 'ONSITE';
}

/**
 * Check if user should validate GPS location
 * GPS validation is required only for ONSITE work
 * 
 * @param {number} userId - ID user
 * @param {Date|string} date - Tanggal yang dicek
 * @returns {Promise<boolean>} - true jika perlu validasi GPS
 */
async function shouldValidateGPS(userId, date) {
  const locationType = await getEffectiveLocationType(userId, date);
  return locationType === 'ONSITE';
}

/**
 * Get work location info untuk display
 * 
 * @param {number} userId - ID user
 * @param {Date|string} date - Tanggal yang dicek
 * @returns {Promise<object>} - Info lokasi kerja
 */
async function getWorkLocationInfo(userId, date) {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const dateOnly = targetDate.toISOString().split('T')[0];
  const dayOfWeek = targetDate.getDay();

  // Check for approved change request
  const changeRequest = await WorkLocationChangeRequest.findOne({
    where: {
      UserId: userId,
      requestDate: dateOnly,
      status: 'APPROVED'
    }
  });

  if (changeRequest) {
    return {
      locationType: changeRequest.requestedLocationType,
      source: 'TEMPORARY_CHANGE',
      originalType: changeRequest.originalLocationType,
      changeRequestId: changeRequest.id,
      requiresGPS: changeRequest.requestedLocationType === 'ONSITE'
    };
  }

  // Check hybrid schedule
  const hybridSchedule = await HybridSchedule.findOne({
    where: {
      UserId: userId,
      dayOfWeek,
      isActive: true
    }
  });

  if (hybridSchedule) {
    return {
      locationType: hybridSchedule.locationType,
      source: 'HYBRID_SCHEDULE',
      dayOfWeek,
      requiresGPS: hybridSchedule.locationType === 'ONSITE'
    };
  }

  // Default
  return {
    locationType: 'ONSITE',
    source: 'DEFAULT',
    requiresGPS: true
  };
}

module.exports = {
  getEffectiveLocationType,
  shouldValidateGPS,
  getWorkLocationInfo
};
