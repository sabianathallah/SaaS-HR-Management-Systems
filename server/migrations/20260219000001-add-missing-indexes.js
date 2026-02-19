'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Attendances - most queried table
    await queryInterface.addIndex('Attendances', ['companyId'], { name: 'attendances_company_id' });
    await queryInterface.addIndex('Attendances', ['UserId', 'date'], { name: 'attendances_user_date' });
    await queryInterface.addIndex('Attendances', ['companyId', 'date'], { name: 'attendances_company_date' });
    await queryInterface.addIndex('Attendances', ['status'], { name: 'attendances_status' });

    // LeaveRequests
    await queryInterface.addIndex('LeaveRequests', ['companyId'], { name: 'leave_requests_company_id' });
    await queryInterface.addIndex('LeaveRequests', ['UserId'], { name: 'leave_requests_user_id' });
    await queryInterface.addIndex('LeaveRequests', ['status'], { name: 'leave_requests_status' });
    await queryInterface.addIndex('LeaveRequests', ['companyId', 'status'], { name: 'leave_requests_company_status' });

    // Notifications
    await queryInterface.addIndex('Notifications', ['companyId'], { name: 'notifications_company_id' });
    await queryInterface.addIndex('Notifications', ['UserId'], { name: 'notifications_user_id' });
    await queryInterface.addIndex('Notifications', ['UserId', 'isRead'], { name: 'notifications_user_read' });

    // Users
    await queryInterface.addIndex('Users', ['companyId'], { name: 'users_company_id' });
    await queryInterface.addIndex('Users', ['companyId', 'role'], { name: 'users_company_role' });
    await queryInterface.addIndex('Users', ['companyId', 'isActive'], { name: 'users_company_active' });

    // Holidays
    await queryInterface.addIndex('Holidays', ['companyId'], { name: 'holidays_company_id' });
    await queryInterface.addIndex('Holidays', ['companyId', 'date'], { name: 'holidays_company_date' });
    await queryInterface.addIndex('Holidays', ['isActive'], { name: 'holidays_is_active' });

    // Shifts
    await queryInterface.addIndex('Shifts', ['companyId'], { name: 'shifts_company_id' });
    await queryInterface.addIndex('Shifts', ['companyId', 'isActive'], { name: 'shifts_company_active' });

    // WorkSchedules
    await queryInterface.addIndex('WorkSchedules', ['companyId'], { name: 'work_schedules_company_id' });
    await queryInterface.addIndex('WorkSchedules', ['companyId', 'isActive'], { name: 'work_schedules_company_active' });

    // PayrollPeriods
    await queryInterface.addIndex('PayrollPeriods', ['companyId'], { name: 'payroll_periods_company_id' });
    await queryInterface.addIndex('PayrollPeriods', ['companyId', 'status'], { name: 'payroll_periods_company_status' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Attendances', 'attendances_company_id');
    await queryInterface.removeIndex('Attendances', 'attendances_user_date');
    await queryInterface.removeIndex('Attendances', 'attendances_company_date');
    await queryInterface.removeIndex('Attendances', 'attendances_status');
    await queryInterface.removeIndex('LeaveRequests', 'leave_requests_company_id');
    await queryInterface.removeIndex('LeaveRequests', 'leave_requests_user_id');
    await queryInterface.removeIndex('LeaveRequests', 'leave_requests_status');
    await queryInterface.removeIndex('LeaveRequests', 'leave_requests_company_status');
    await queryInterface.removeIndex('Notifications', 'notifications_company_id');
    await queryInterface.removeIndex('Notifications', 'notifications_user_id');
    await queryInterface.removeIndex('Notifications', 'notifications_user_read');
    await queryInterface.removeIndex('Users', 'users_company_id');
    await queryInterface.removeIndex('Users', 'users_company_role');
    await queryInterface.removeIndex('Users', 'users_company_active');
    await queryInterface.removeIndex('Holidays', 'holidays_company_id');
    await queryInterface.removeIndex('Holidays', 'holidays_company_date');
    await queryInterface.removeIndex('Holidays', 'holidays_is_active');
    await queryInterface.removeIndex('Shifts', 'shifts_company_id');
    await queryInterface.removeIndex('Shifts', 'shifts_company_active');
    await queryInterface.removeIndex('WorkSchedules', 'work_schedules_company_id');
    await queryInterface.removeIndex('WorkSchedules', 'work_schedules_company_active');
    await queryInterface.removeIndex('PayrollPeriods', 'payroll_periods_company_id');
    await queryInterface.removeIndex('PayrollPeriods', 'payroll_periods_company_status');
  }
};
