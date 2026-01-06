const fs = require('fs').promises;
const path = require('path');

/**
 * 🖼️ PHOTO HELPER
 * 
 * Helper functions untuk manage attendance photos:
 * - Delete old photos
 * - Get photo path
 * - Check if photo exists
 */

const UPLOAD_DIR = path.join(__dirname, '../uploads/attendance-photos');

/**
 * Delete foto dari filesystem
 * @param {string} photoPath - Relative path dari foto (e.g., '/uploads/attendance-photos/123_456_checkin.jpg')
 * @returns {Promise<boolean>} - true jika berhasil delete atau file tidak ada
 */
const deletePhoto = async (photoPath) => {
  try {
    if (!photoPath) return true;

    // Extract filename dari path
    const filename = path.basename(photoPath);
    const fullPath = path.join(UPLOAD_DIR, filename);

    // Check if file exists
    try {
      await fs.access(fullPath);
      // File exists, delete it
      await fs.unlink(fullPath);
      console.log(`✅ Photo deleted: ${filename}`);
      return true;
    } catch (err) {
      // File doesn't exist, that's okay
      console.log(`ℹ️ Photo not found (already deleted?): ${filename}`);
      return true;
    }
  } catch (error) {
    console.error('❌ Error deleting photo:', error);
    return false;
  }
};

/**
 * Delete multiple photos
 * @param {Array<string>} photoPaths - Array of photo paths to delete
 * @returns {Promise<void>}
 */
const deletePhotos = async (photoPaths) => {
  try {
    const deletePromises = photoPaths
      .filter(path => path) // Filter out null/undefined
      .map(path => deletePhoto(path));
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('❌ Error deleting multiple photos:', error);
  }
};

/**
 * Get absolute path dari relative path
 * @param {string} relativePath - Relative path (e.g., '/uploads/attendance-photos/123.jpg')
 * @returns {string} - Absolute path
 */
const getAbsolutePath = (relativePath) => {
  if (!relativePath) return null;
  
  const filename = path.basename(relativePath);
  return path.join(UPLOAD_DIR, filename);
};

/**
 * Check if photo file exists
 * @param {string} photoPath - Relative or absolute path
 * @returns {Promise<boolean>}
 */
const photoExists = async (photoPath) => {
  try {
    if (!photoPath) return false;
    
    const absolutePath = getAbsolutePath(photoPath);
    await fs.access(absolutePath);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get photo info (size, exists, etc)
 * @param {string} photoPath - Relative path
 * @returns {Promise<Object|null>}
 */
const getPhotoInfo = async (photoPath) => {
  try {
    if (!photoPath) return null;
    
    const absolutePath = getAbsolutePath(photoPath);
    const stats = await fs.stat(absolutePath);
    
    return {
      exists: true,
      size: stats.size,
      sizeKB: Math.round(stats.size / 1024),
      created: stats.birthtime,
      modified: stats.mtime,
      path: photoPath,
      absolutePath: absolutePath
    };
  } catch (error) {
    return {
      exists: false,
      path: photoPath
    };
  }
};

/**
 * Cleanup old attendance photos for a user
 * Hapus foto lama ketika attendance di-update
 * @param {Object} oldAttendance - Attendance object lama
 * @param {Object} newData - Data baru yang akan di-update
 */
const cleanupOldPhotos = async (oldAttendance, newData = {}) => {
  try {
    const photosToDelete = [];

    // Jika photoCheckIn di-update, delete yang lama
    if (newData.photoCheckIn && oldAttendance.photoCheckIn && 
        newData.photoCheckIn !== oldAttendance.photoCheckIn) {
      photosToDelete.push(oldAttendance.photoCheckIn);
    }

    // Jika photoCheckOut di-update, delete yang lama
    if (newData.photoCheckOut && oldAttendance.photoCheckOut && 
        newData.photoCheckOut !== oldAttendance.photoCheckOut) {
      photosToDelete.push(oldAttendance.photoCheckOut);
    }

    if (photosToDelete.length > 0) {
      await deletePhotos(photosToDelete);
    }
  } catch (error) {
    console.error('❌ Error in cleanupOldPhotos:', error);
  }
};

/**
 * Delete semua photos dari attendance yang akan dihapus
 * @param {Object} attendance - Attendance object
 */
const deleteAttendancePhotos = async (attendance) => {
  try {
    const photosToDelete = [
      attendance.photoCheckIn,
      attendance.photoCheckOut
    ].filter(Boolean); // Remove null/undefined

    if (photosToDelete.length > 0) {
      await deletePhotos(photosToDelete);
    }
  } catch (error) {
    console.error('❌ Error in deleteAttendancePhotos:', error);
  }
};

module.exports = {
  deletePhoto,
  deletePhotos,
  getAbsolutePath,
  photoExists,
  getPhotoInfo,
  cleanupOldPhotos,
  deleteAttendancePhotos,
  UPLOAD_DIR
};
