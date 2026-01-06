'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Attendances');
    
    // Add GPS location columns only if they don't exist
    if (!tableDescription.clock_in_latitude) {
      await queryInterface.addColumn('Attendances', 'clock_in_latitude', {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
        comment: 'Latitude saat clock-in'
      });
    }

    if (!tableDescription.clock_in_longitude) {
      await queryInterface.addColumn('Attendances', 'clock_in_longitude', {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
        comment: 'Longitude saat clock-in'
      });
    }

    if (!tableDescription.clock_out_latitude) {
      await queryInterface.addColumn('Attendances', 'clock_out_latitude', {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
        comment: 'Latitude saat clock-out'
      });
    }

    if (!tableDescription.clock_out_longitude) {
      await queryInterface.addColumn('Attendances', 'clock_out_longitude', {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
        comment: 'Longitude saat clock-out'
      });
    }

    if (!tableDescription.office_location_id) {
      await queryInterface.addColumn('Attendances', 'office_location_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'office_locations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Lokasi kantor yang digunakan saat clock-in'
      });
    }

    if (!tableDescription.location_validation_status) {
      await queryInterface.addColumn('Attendances', 'location_validation_status', {
        type: Sequelize.ENUM('valid', 'outside_radius', 'gps_error', 'not_checked'),
        allowNull: false,
        defaultValue: 'not_checked',
        comment: 'Status validasi lokasi'
      });
    }

    if (!tableDescription.distance_from_office) {
      await queryInterface.addColumn('Attendances', 'distance_from_office', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Jarak dari kantor dalam meter'
      });
    }

    // Add indexes (check first to avoid duplicate)
    const indexes = await queryInterface.showIndex('Attendances');
    const hasOfficeLocationIndex = indexes.some(idx => 
      idx.fields.some(f => f.attribute === 'office_location_id')
    );
    const hasValidationStatusIndex = indexes.some(idx => 
      idx.fields.some(f => f.attribute === 'location_validation_status')
    );

    if (!hasOfficeLocationIndex) {
      await queryInterface.addIndex('Attendances', ['office_location_id']);
    }
    
    if (!hasValidationStatusIndex) {
      await queryInterface.addIndex('Attendances', ['location_validation_status']);
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Attendances');
    
    if (tableDescription.distance_from_office) {
      await queryInterface.removeColumn('Attendances', 'distance_from_office');
    }
    if (tableDescription.location_validation_status) {
      await queryInterface.removeColumn('Attendances', 'location_validation_status');
    }
    if (tableDescription.office_location_id) {
      await queryInterface.removeColumn('Attendances', 'office_location_id');
    }
    if (tableDescription.clock_out_longitude) {
      await queryInterface.removeColumn('Attendances', 'clock_out_longitude');
    }
    if (tableDescription.clock_out_latitude) {
      await queryInterface.removeColumn('Attendances', 'clock_out_latitude');
    }
    if (tableDescription.clock_in_longitude) {
      await queryInterface.removeColumn('Attendances', 'clock_in_longitude');
    }
    if (tableDescription.clock_in_latitude) {
      await queryInterface.removeColumn('Attendances', 'clock_in_latitude');
    }
  }
};
