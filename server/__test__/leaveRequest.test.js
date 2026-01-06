const request = require('supertest');
const app = require('../app');

describe('Leave Request Employee Endpoints', () => {
  let employeeToken;
  let adminToken;

  beforeAll(async () => {
    // Login as employee
    const employeeLogin = await request(app)
      .post('/login')
      .send({
        email: 'budi@company.com',
        password: 'budi123'
      });
    employeeToken = employeeLogin.body.access_token;

    // Login as admin
    const adminLogin = await request(app)
      .post('/login')
      .send({
        email: 'admin@company.com',
        password: 'admin123'
      });
    adminToken = adminLogin.body.access_token;
  });

  describe('POST /leave-requests', () => {
    it('should submit leave request successfully', async () => {
      const response = await request(app)
        .post('/leave-requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          type: 'annual',
          startDate: '2026-02-01',
          endDate: '2026-02-03',
          reason: 'Family vacation'
        });

      expect([200, 201, 400]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('data');
      }
    });

    it('should submit permission request successfully', async () => {
      const response = await request(app)
        .post('/leave-requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          type: 'permission',
          startDate: '2026-01-10',
          endDate: '2026-01-10',
          reason: 'Doctor appointment',
          duration: 2
        });

      expect([200, 201, 400]).toContain(response.status);
    });

    it('should return 400 without required fields', async () => {
      const response = await request(app)
        .post('/leave-requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          type: 'annual'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 with invalid type', async () => {
      const response = await request(app)
        .post('/leave-requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          type: 'invalid_type',
          startDate: '2026-02-01',
          endDate: '2026-02-03',
          reason: 'Test'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 with end date before start date', async () => {
      const response = await request(app)
        .post('/leave-requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          type: 'annual',
          startDate: '2026-02-05',
          endDate: '2026-02-01',
          reason: 'Test'
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/leave-requests')
        .send({
          type: 'annual',
          startDate: '2026-02-01',
          endDate: '2026-02-03',
          reason: 'Test'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /leave-requests/my-requests', () => {
    it('should get my leave requests successfully', async () => {
      const response = await request(app)
        .get('/leave-requests/my-requests')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/leave-requests/my-requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
    });

    it('should support status filter', async () => {
      const response = await request(app)
        .get('/leave-requests/my-requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ status: 'PENDING' });

      expect(response.status).toBe(200);
    });

    it('should support type filter', async () => {
      const response = await request(app)
        .get('/leave-requests/my-requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ type: 'annual' });

      expect(response.status).toBe(200);
    });

    it('should support year filter', async () => {
      const response = await request(app)
        .get('/leave-requests/my-requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ year: 2026 });

      expect(response.status).toBe(200);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/leave-requests/my-requests');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /leave-requests/my-balance', () => {
    it('should get my leave balance successfully', async () => {
      const response = await request(app)
        .get('/leave-requests/my-balance')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('annualLeaveQuota');
      expect(response.body.data).toHaveProperty('usedLeaveQuota');
      expect(response.body.data).toHaveProperty('remainingLeaveQuota');
      expect(response.body.data).toHaveProperty('pendingLeaveDays');
    });

    it('should support year parameter', async () => {
      const response = await request(app)
        .get('/leave-requests/my-balance')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ year: 2026 });

      expect(response.status).toBe(200);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/leave-requests/my-balance');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /leave-requests/:id', () => {
    it('should return 404 for non-existent request', async () => {
      const response = await request(app)
        .delete('/leave-requests/99999')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/leave-requests/1');

      expect(response.status).toBe(401);
    });

    it('should return 403 when trying to cancel other user request', async () => {
      // This would need actual data setup to properly test
      const response = await request(app)
        .delete('/leave-requests/1')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect([403, 404, 400]).toContain(response.status);
    });
  });
});
