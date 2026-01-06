'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OfficeLocation extends Model {
    static associate(models) {
      // Relasi dengan Attendance
      OfficeLocation.hasMany(models.Attendance, {
        foreignKey: 'office_location_id',
        as: 'attendances'
      });
    }
  }

  OfficeLocation.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Nama lokasi tidak boleh kosong' },
          len: {
            args: [3, 100],
            msg: 'Nama lokasi harus antara 3-100 karakter'
          }
        }
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
        validate: {
          notNull: { msg: 'Latitude wajib diisi' },
          min: { args: [-90], msg: 'Latitude harus antara -90 hingga 90' },
          max: { args: [90], msg: 'Latitude harus antara -90 hingga 90' }
        }
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
        validate: {
          notNull: { msg: 'Longitude wajib diisi' },
          min: { args: [-180], msg: 'Longitude harus antara -180 hingga 180' },
          max: { args: [180], msg: 'Longitude harus antara -180 hingga 180' }
        }
      },
      radius: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50,
        validate: {
          notNull: { msg: 'Radius wajib diisi' },
          min: { args: [10], msg: 'Radius minimal 10 meter' },
          max: { args: [1000], msg: 'Radius maksimal 1000 meter (1 km)' }
        },
        comment: 'Radius dalam meter'
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      sequelize,
      modelName: 'OfficeLocation',
      tableName: 'office_locations',
      underscored: true,
      timestamps: true
    }
  );

  return OfficeLocation;
};
