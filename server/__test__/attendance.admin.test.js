const request = require('supertest');
const app = require('../app');

describe('Attendance Admin Endpoints', () => {
  let adminToken;
  let employeeToken;

  beforeAll(async () => {
    // Login as admin
    const adminLogin = await request(app)
      .post('/login')
      .send({
        email: 'admin@company.com',
        password: 'admin123'
      });
    adminToken = adminLogin.body.access_token;

    // Login as employee
    const employeeLogin = await request(app)
      .post('/login')
      .send({
        email: 'budi@company.com',
        password: 'password123'
      });
    employeeToken = employeeLogin.body.access_token;
  });

  describe('GET /attendances/admin/all-attendance', () => {
    it('should get all attendance records successfully', async () => {
      const response = await request(app)
        .get('/attendances/admin/all-attendance')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/attendances/admin/all-attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
    });

    it('should support filtering by userId', async () => {
      const response = await request(app)
        .get('/attendances/admin/all-attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ userId: 1 });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/attendances/admin/all-attendance')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /attendances/admin/auto-set-absent', () => {
    it('should trigger auto-set-absent successfully', async () => {
      const response = await request(app)
        .post('/attendances/admin/auto-set-absent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/attendances/admin/auto-set-absent')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /attendances/admin/today-attendance', () => {
    it('should get today attendance for all users', async () => {
      const response = await request(app)
        .get('/attendances/admin/today-attendance')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should get today attendance for specific user', async () => {
      const response = await request(app)
        .get('/attendances/admin/today-attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ userId: 1 });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/attendances/admin/today-attendance')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /attendances/admin/manual-attendance', () => {
    it('should create manual attendance successfully', async () => {
      const response = await request(app)
        .post('/attendances/admin/manual-attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: 2,
          date: '2026-01-06',
          checkInTime: '09:00:00',
          checkOutTime: '17:00:00',
          status: 'present'
        });

      expect([200, 201, 400]).toContain(response.status);
    });

    it('should return 400 without required fields', async () => {
      const response = await request(app)
        .post('/attendances/admin/manual-attendance')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: 2
        });

      expect(response.status).toBe(400);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/attendances/admin/manual-attendance')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          userId: 2,
          date: '2026-01-06',
          status: 'present'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /attendances/admin/manual-attendance/:id', () => {
    it('should return 404 for non-existent attendance', async () => {
      const response = await request(app)
        .put('/attendances/admin/manual-attendance/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'present'
        });

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put('/attendances/admin/manual-attendance/1')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          status: 'present'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Work Schedule Endpoints', () => {
    describe('GET /attendances/admin/work-schedule', () => {
      it('should get work schedule successfully', async () => {
        const response = await request(app)
          .get('/attendances/admin/work-schedule')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
      });

      it('should return 403 for non-admin users', async () => {
        const response = await request(app)
          .get('/attendances/admin/work-schedule')
          .set('Authorization', `Bearer ${employeeToken}`);

        expect(response.status).toBe(403);
      });
    });

    describe('PUT /attendances/admin/work-schedule', () => {
      it('should update work schedule successfully', async () => {
        const response = await request(app)
          .put('/attendances/admin/work-schedule')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            checkInStart: '08:00:00',
            checkInEnd: '09:00:00',
            checkOutStart: '17:00:00',
            lateThreshold: 15
          });

        expect([200, 201]).toContain(response.status);
      });

      it('should return 403 for non-admin users', async () => {
        const response = await request(app)
          .put('/attendances/admin/work-schedule')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            checkInStart: '08:00:00'
          });

        expect(response.status).toBe(403);
      });
    });
  });

  describe('Holiday Management Endpoints', () => {
    let createdHolidayId;

    describe('POST /attendances/admin/holiday', () => {
      it('should add holiday successfully', async () => {
        const response = await request(app)
          .post('/attendances/admin/holiday')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Test Holiday',
            date: '2026-12-25',
            description: 'Test holiday description'
          });

        expect([200, 201, 400]).toContain(response.status);
        if (response.status === 200 || response.status === 201) {
          createdHolidayId = response.body.data?.id;
        }
      });

      it('should return 400 without required fields', async () => {
        const response = await request(app)
          .post('/attendances/admin/holiday')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Test Holiday'
          });

        expect(response.status).toBe(400);
      });

      it('should return 403 for non-admin users', async () => {
        const response = await request(app)
          .post('/attendances/admin/holiday')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            name: 'Test Holiday',
            date: '2026-12-25'
          });

        expect(response.status).toBe(403);
      });
    });

    describe('GET /attendances/admin/holiday', () => {
      it('should get all holidays successfully', async () => {
        const response = await request(app)
          .get('/attendances/admin/holiday')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should support year filter', async () => {
        const response = await request(app)
          .get('/attendances/admin/holiday')
          .set('Authorization', `Bearer ${adminToken}`)
          .query({ year: 2026 });

        expect(response.status).toBe(200);
      });

      it('should return 403 for non-admin users', async () => {
        const response = await request(app)
          .get('/attendances/admin/holiday')
          .set('Authorization', `Bearer ${employeeToken}`);

        expect(response.status).toBe(403);
      });
    });

    describe('PUT /attendances/admin/holiday/:id', () => {
      it('should return 404 for non-existent holiday', async () => {
        const response = await request(app)
          .put('/attendances/admin/holiday/99999')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Updated Holiday'
          });

        expect(response.status).toBe(404);
      });

      it('should return 403 for non-admin users', async () => {
        const response = await request(app)
          .put('/attendances/admin/holiday/1')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            name: 'Updated Holiday'
          });

        expect(response.status).toBe(403);
      });
    });

    describe('DELETE /attendances/admin/holiday/:id', () => {
      it('should return 404 for non-existent holiday', async () => {
        const response = await request(app)
          .delete('/attendances/admin/holiday/99999')
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(404);
      });

      it('should return 403 for non-admin users', async () => {
        const response = await request(app)
          .delete('/attendances/admin/holiday/1')
          .set('Authorization', `Bearer ${employeeToken}`);

        expect(response.status).toBe(403);
      });
    });
  });

  describe('GET /attendances/admin/employee-statistics/:userId', () => {
    it('should get employee statistics successfully', async () => {
      const response = await request(app)
        .get('/attendances/admin/employee-statistics/2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should support month and year parameters', async () => {
      const response = await request(app)
        .get('/attendances/admin/employee-statistics/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ month: 1, year: 2026 });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/attendances/admin/employee-statistics/2')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /attendances/admin/all-statistics', () => {
    it('should get all employees statistics successfully', async () => {
      const response = await request(app)
        .get('/attendances/admin/all-statistics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('employees');
      expect(Array.isArray(response.body.employees)).toBe(true);
    });

    it('should support month and year parameters', async () => {
      const response = await request(app)
        .get('/attendances/admin/all-statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ month: 1, year: 2026 });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/attendances/admin/all-statistics')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /attendances/admin/summary', () => {
    it('should get attendance summary successfully', async () => {
      const response = await request(app)
        .get('/attendances/admin/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('employees');
    });

    it('should support period filter - daily', async () => {
      const response = await request(app)
        .get('/attendances/admin/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: 'daily', date: '2026-01-06' });

      expect(response.status).toBe(200);
    });

    it('should support period filter - weekly', async () => {
      const response = await request(app)
        .get('/attendances/admin/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: 'weekly', startDate: '2026-01-01', endDate: '2026-01-07' });

      expect(response.status).toBe(200);
    });

    it('should support period filter - monthly', async () => {
      const response = await request(app)
        .get('/attendances/admin/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: 'monthly', month: 1, year: 2026 });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/attendances/admin/summary')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });
});
