const request = require('supertest');
const app = require('../app');

describe('Audit Log Endpoints', () => {
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

  describe('GET /audit-logs', () => {
    it('should get all audit logs successfully', async () => {
      const response = await request(app)
        .get('/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('auditLogs');
      expect(Array.isArray(response.body.data.auditLogs)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
    });

    it('should support userId filter', async () => {
      const response = await request(app)
        .get('/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ userId: 1 });

      expect(response.status).toBe(200);
    });

    it('should support action filter', async () => {
      const response = await request(app)
        .get('/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ action: 'CREATE' });

      expect(response.status).toBe(200);
    });

    it('should support tableName filter', async () => {
      const response = await request(app)
        .get('/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ tableName: 'users' });

      expect(response.status).toBe(200);
    });

    it('should support date range filters', async () => {
      const response = await request(app)
        .get('/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ startDate: '2026-01-01', endDate: '2026-01-31' });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/audit-logs')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/audit-logs');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /audit-logs/stats', () => {
    it('should get audit statistics successfully', async () => {
      const response = await request(app)
        .get('/audit-logs/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('byAction');
      expect(response.body.data).toHaveProperty('byTable');
    });

    it('should support date range for stats', async () => {
      const response = await request(app)
        .get('/audit-logs/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ startDate: '2026-01-01', endDate: '2026-01-31' });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/audit-logs/stats')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /audit-logs/recent', () => {
    it('should get recent activities successfully', async () => {
      const response = await request(app)
        .get('/audit-logs/recent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('activities');
      expect(Array.isArray(response.body.data.activities)).toBe(true);
    });

    it('should support limit parameter', async () => {
      const response = await request(app)
        .get('/audit-logs/recent')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ limit: 20 });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/audit-logs/recent')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /audit-logs/record/:tableName/:recordId', () => {
    it('should get audit logs for specific record successfully', async () => {
      const response = await request(app)
        .get('/audit-logs/record/users/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('auditLogs');
      expect(Array.isArray(response.body.data.auditLogs)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/audit-logs/record/users/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/audit-logs/record/users/1')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /audit-logs/user/:userId', () => {
    it('should get audit logs for specific user successfully', async () => {
      const response = await request(app)
        .get('/audit-logs/user/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('auditLogs');
      expect(Array.isArray(response.body.data.auditLogs)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/audit-logs/user/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
    });

    it('should support action filter', async () => {
      const response = await request(app)
        .get('/audit-logs/user/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ action: 'CREATE' });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/audit-logs/user/1')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /audit-logs/:id', () => {
    it('should return 404 for non-existent audit log', async () => {
      const response = await request(app)
        .get('/audit-logs/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/audit-logs/1')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });
});
