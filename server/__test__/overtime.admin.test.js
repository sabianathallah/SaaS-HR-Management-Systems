const request = require('supertest');
const app = require('../app');

describe('Overtime Admin Endpoints', () => {
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
        password: 'budi123'
      });
    employeeToken = employeeLogin.body.access_token;
  });

  describe('GET /overtimes/admin/pending-count', () => {
    it('should get pending overtime count successfully', async () => {
      const response = await request(app)
        .get('/overtimes/admin/pending-count')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/overtimes/admin/pending-count')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /overtimes/admin/requests', () => {
    it('should get all overtime requests successfully', async () => {
      const response = await request(app)
        .get('/overtimes/admin/requests')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/overtimes/admin/requests')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
    });

    it('should support status filter', async () => {
      const response = await request(app)
        .get('/overtimes/admin/requests')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ status: 'pending' });

      expect(response.status).toBe(200);
    });

    it('should support userId filter', async () => {
      const response = await request(app)
        .get('/overtimes/admin/requests')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ userId: 2 });

      expect(response.status).toBe(200);
    });

    it('should support date range filters', async () => {
      const response = await request(app)
        .get('/overtimes/admin/requests')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ startDate: '2026-01-01', endDate: '2026-01-31' });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/overtimes/admin/requests')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /overtimes/admin/summary', () => {
    it('should get overtime summary successfully', async () => {
      const response = await request(app)
        .get('/overtimes/admin/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('overall');
      expect(response.body).toHaveProperty('employees');
    });

    it('should support period filter', async () => {
      const response = await request(app)
        .get('/overtimes/admin/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ period: 'monthly', month: 1, year: 2026 });

      expect(response.status).toBe(200);
    });

    it('should support userId filter', async () => {
      const response = await request(app)
        .get('/overtimes/admin/summary')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ userId: 2 });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/overtimes/admin/summary')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /overtimes/admin/:id/approve', () => {
    it('should return 404 for non-existent overtime request', async () => {
      const response = await request(app)
        .patch('/overtimes/admin/99999/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminNote: 'Approved'
        });

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .patch('/overtimes/admin/1/approve')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          adminNote: 'Approved'
        });

      expect(response.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/overtimes/admin/1/approve')
        .send({
          adminNote: 'Approved'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /overtimes/admin/:id/reject', () => {
    it('should return 404 for non-existent overtime request', async () => {
      const response = await request(app)
        .patch('/overtimes/admin/99999/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          adminNote: 'Rejected due to business needs'
        });

      expect([400, 404]).toContain(response.status);
    });

    it('should return 400 without admin note', async () => {
      const response = await request(app)
        .patch('/overtimes/admin/1/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .patch('/overtimes/admin/1/reject')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          adminNote: 'Rejected'
        });

      expect(response.status).toBe(403);
    });
  });
});
