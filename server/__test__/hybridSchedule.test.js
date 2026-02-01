const request = require('supertest');
const app = require('../app');
const { sequelize, HybridSchedule, User } = require('../models');
const { generateToken } = require('../helpers/jwt');

let employeeToken;
let adminToken;
let employeeId;
let adminId;
let employee2Id;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  
  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'ADMIN',
    position: 'Manager',
    department: 'HR'
  });
  adminId = admin.id;
  adminToken = generateToken({ id: admin.id, email: admin.email, role: admin.role });
  
  // Create employee user
  const employee = await User.create({
    name: 'Employee User',
    email: 'employee@test.com',
    password: 'employee123',
    role: 'EMPLOYEE',
    position: 'Software Engineer',
    department: 'IT'
  });
  employeeId = employee.id;
  employeeToken = generateToken({ id: employee.id, email: employee.email, role: employee.role });
  
  // Create second employee
  const employee2 = await User.create({
    name: 'Employee 2',
    email: 'employee2@test.com',
    password: 'employee123',
    role: 'EMPLOYEE',
    position: 'Designer',
    department: 'Design'
  });
  employee2Id = employee2.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('Hybrid Schedule - Employee', () => {
  describe('GET /hybrid-schedules', () => {
    it('should return empty array initially', async () => {
      const response = await request(app)
        .get('/hybrid-schedules')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('PUT /hybrid-schedules', () => {
    it('should create hybrid schedule', async () => {
      const response = await request(app)
        .put('/hybrid-schedules')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          schedules: [
            { dayOfWeek: 1, locationType: 'ONSITE' },    // Monday
            { dayOfWeek: 2, locationType: 'ONSITE' },    // Tuesday
            { dayOfWeek: 3, locationType: 'ONSITE' },    // Wednesday
            { dayOfWeek: 4, locationType: 'WFH' },       // Thursday
            { dayOfWeek: 5, locationType: 'WFH' }        // Friday
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Hybrid schedule updated successfully');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(5);
      
      // Check day names are included
      const monday = response.body.data.find(s => s.dayOfWeek === 1);
      expect(monday.dayName).toBe('Monday');
      expect(monday.locationType).toBe('ONSITE');
      
      const thursday = response.body.data.find(s => s.dayOfWeek === 4);
      expect(thursday.dayName).toBe('Thursday');
      expect(thursday.locationType).toBe('WFH');
    });

    it('should update existing schedule', async () => {
      const response = await request(app)
        .put('/hybrid-schedules')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          schedules: [
            { dayOfWeek: 1, locationType: 'WFH' },       // Changed to WFH
            { dayOfWeek: 2, locationType: 'WFH' },       // Changed to WFH
            { dayOfWeek: 3, locationType: 'ONSITE' },
            { dayOfWeek: 4, locationType: 'ONSITE' },    // Changed to ONSITE
            { dayOfWeek: 5, locationType: 'REMOTE' }     // Changed to REMOTE
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(5);
      
      const monday = response.body.data.find(s => s.dayOfWeek === 1);
      expect(monday.locationType).toBe('WFH');
    });

    it('should reject invalid day of week', async () => {
      const response = await request(app)
        .put('/hybrid-schedules')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          schedules: [
            { dayOfWeek: 7, locationType: 'ONSITE' }  // Invalid: should be 0-6
          ]
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid location type', async () => {
      const response = await request(app)
        .put('/hybrid-schedules')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          schedules: [
            { dayOfWeek: 1, locationType: 'INVALID' }
          ]
        });

      expect(response.status).toBe(400);
    });

    it('should reject non-array schedules', async () => {
      const response = await request(app)
        .put('/hybrid-schedules')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          schedules: 'not an array'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /hybrid-schedules (after creation)', () => {
    it('should return created schedules', async () => {
      const response = await request(app)
        .get('/hybrid-schedules')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(5);
      
      // Check all have dayName
      response.body.data.forEach(schedule => {
        expect(schedule).toHaveProperty('dayName');
        expect(schedule).toHaveProperty('locationType');
      });
    });
  });

  describe('DELETE /hybrid-schedules', () => {
    it('should delete all schedules', async () => {
      const response = await request(app)
        .delete('/hybrid-schedules')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return empty array after deletion', async () => {
      const response = await request(app)
        .get('/hybrid-schedules')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });
  });
});

describe('Hybrid Schedule - Admin', () => {
  beforeAll(async () => {
    // Create schedules for employee2
    await HybridSchedule.bulkCreate([
      { UserId: employee2Id, dayOfWeek: 1, locationType: 'ONSITE', isActive: true },
      { UserId: employee2Id, dayOfWeek: 2, locationType: 'ONSITE', isActive: true },
      { UserId: employee2Id, dayOfWeek: 3, locationType: 'WFH', isActive: true },
      { UserId: employee2Id, dayOfWeek: 4, locationType: 'WFH', isActive: true },
      { UserId: employee2Id, dayOfWeek: 5, locationType: 'REMOTE', isActive: true }
    ]);
  });

  describe('GET /hybrid-schedules/admin', () => {
    it('should get all hybrid schedules', async () => {
      const response = await request(app)
        .get('/hybrid-schedules/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Check structure
      response.body.data.forEach(item => {
        expect(item).toHaveProperty('user');
        expect(item).toHaveProperty('schedules');
        expect(item.schedules).toBeInstanceOf(Array);
      });
    });

    it('should deny access to employee', async () => {
      const response = await request(app)
        .get('/hybrid-schedules/admin')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });

    it('should filter by userId', async () => {
      const response = await request(app)
        .get(`/hybrid-schedules/admin?userId=${employee2Id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach(item => {
        expect(item.user.id).toBe(employee2Id);
      });
    });
  });

  describe('GET /hybrid-schedules/admin/user/:userId', () => {
    it('should get schedule for specific user', async () => {
      const response = await request(app)
        .get(`/hybrid-schedules/admin/user/${employee2Id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('schedules');
      expect(response.body.data.user.id).toBe(employee2Id);
      expect(response.body.data.schedules.length).toBe(5);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/hybrid-schedules/admin/user/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /hybrid-schedules/admin/user/:userId', () => {
    it('should create/update schedule for user', async () => {
      const response = await request(app)
        .put(`/hybrid-schedules/admin/user/${employeeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          schedules: [
            { dayOfWeek: 1, locationType: 'REMOTE' },
            { dayOfWeek: 2, locationType: 'REMOTE' },
            { dayOfWeek: 3, locationType: 'REMOTE' }
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user.id).toBe(employeeId);
      expect(response.body.data.schedules.length).toBe(3);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/hybrid-schedules/admin/user/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          schedules: [
            { dayOfWeek: 1, locationType: 'ONSITE' }
          ]
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /hybrid-schedules/admin/user/:userId', () => {
    it('should delete schedule for user', async () => {
      const response = await request(app)
        .delete(`/hybrid-schedules/admin/user/${employeeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted successfully');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/hybrid-schedules/admin/user/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /hybrid-schedules/admin/statistics', () => {
    it('should get statistics', async () => {
      const response = await request(app)
        .get('/hybrid-schedules/admin/statistics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalUsersWithHybridSchedule');
      expect(response.body.data).toHaveProperty('breakdownByDay');
      
      // Check breakdown structure
      const breakdown = response.body.data.breakdownByDay;
      expect(breakdown).toHaveProperty('Monday');
      expect(breakdown).toHaveProperty('Friday');
      expect(breakdown.Monday).toHaveProperty('ONSITE');
      expect(breakdown.Monday).toHaveProperty('WFH');
      expect(breakdown.Monday).toHaveProperty('REMOTE');
    });
  });
});
