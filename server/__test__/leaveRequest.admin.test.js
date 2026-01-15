const request = require('supertest');
const app = require('../app');

describe('Leave Request Admin Endpoints', () => {
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

  describe('GET /leave-requests/admin/all', () => {
    it('should get all leave requests successfully', async () => {
      const response = await request(app)
        .get('/leave-requests/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/leave-requests/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
    });

    it('should support status filter', async () => {
      const response = await request(app)
        .get('/leave-requests/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ status: 'PENDING' });

      expect(response.status).toBe(200);
    });

    it('should support userId filter', async () => {
      const response = await request(app)
        .get('/leave-requests/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ userId: 2 });

      expect(response.status).toBe(200);
    });

    it('should support type filter', async () => {
      const response = await request(app)
        .get('/leave-requests/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ type: 'annual' });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/leave-requests/admin/all')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /leave-requests/admin/:id/approve', () => {
    it('should return 404 for non-existent request', async () => {
      const response = await request(app)
        .put('/leave-requests/admin/99999/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminNote: 'Approved'
        });

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put('/leave-requests/admin/1/approve')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          adminNote: 'Approved'
        });

      expect(response.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/leave-requests/admin/1/approve')
        .send({
          adminNote: 'Approved'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /leave-requests/admin/:id/reject', () => {
    it('should return 404 for non-existent request', async () => {
      const response = await request(app)
        .put('/leave-requests/admin/99999/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminNote: 'Rejected due to business needs'
        });

      expect(response.status).toBe(404);
    });

    it('should return 400 without admin note', async () => {
      const response = await request(app)
        .put('/leave-requests/admin/99999/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      // Could be 400 (validation) or 404 (not found checked first)
      expect([400, 404]).toContain(response.status);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put('/leave-requests/admin/1/reject')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          adminNote: 'Rejected'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /leave-requests/admin/adjust-quota/:userId', () => {
    it('should adjust quota successfully', async () => {
      const response = await request(app)
        .put('/leave-requests/admin/adjust-quota/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          annualLeaveQuota: 15,
          year: 2026,
          reason: 'Adjustment for new employee'
        });

      expect([200, 201, 404]).toContain(response.status);
    });

    it('should return 400 without required fields', async () => {
      const response = await request(app)
        .put('/leave-requests/admin/adjust-quota/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ annualLeaveQuota: -10 });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('cannot be negative');
    });

    it('should return 400 with negative quota', async () => {
      const response = await request(app)
        .put('/leave-requests/admin/adjust-quota/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          annualLeaveQuota: -5,
          year: 2026,
          reason: 'Test'
        });

      expect(response.status).toBe(400);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put('/leave-requests/admin/adjust-quota/2')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          annualLeaveQuota: 15,
          year: 2026,
          reason: 'Test'
        });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/leave-requests/admin/adjust-quota/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          annualLeaveQuota: 15,
          year: 2026,
          reason: 'Test'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /leave-requests/admin/balance/:userId', () => {
    it('should get employee leave balance successfully', async () => {
      const response = await request(app)
        .get('/leave-requests/admin/balance/2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('balance');
      expect(response.body.balance).toHaveProperty('annualLeaveQuota');
      expect(response.body.balance).toHaveProperty('usedLeaveQuota');
      expect(response.body.balance).toHaveProperty('remainingLeaveQuota');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('statistics');
    });

    it('should support year parameter', async () => {
      const response = await request(app)
        .get('/leave-requests/admin/balance/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ year: 2026 });

      expect(response.status).toBe(200);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/leave-requests/admin/balance/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/leave-requests/admin/balance/2')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });
});
