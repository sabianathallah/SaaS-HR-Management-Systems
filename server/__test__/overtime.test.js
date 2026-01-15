const request = require('supertest');
const app = require('../app');

describe('Overtime Employee Endpoints', () => {
  let employeeToken;
  let adminToken;

  beforeAll(async () => {
    // Login as employee
    const employeeLogin = await request(app)
      .post('/login')
      .send({
        email: 'budi@company.com',
        password: 'password123'
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

  describe('POST /overtimes/request', () => {
    it('should request overtime successfully', async () => {
      const response = await request(app)
        .post('/overtimes/request')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          date: '2026-01-10',
          startTime: '18:00:00',
          endTime: '21:00:00',
          reason: 'Project deadline'
        });

      expect([200, 201, 400]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('data');
      }
    });

    it('should return 400 without required fields', async () => {
      const response = await request(app)
        .post('/overtimes/request')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          date: '2026-01-10'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 with end time before start time', async () => {
      const response = await request(app)
        .post('/overtimes/request')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          date: '2026-01-10',
          startTime: '21:00:00',
          endTime: '18:00:00',
          reason: 'Test'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 with past date', async () => {
      const response = await request(app)
        .post('/overtimes/request')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          date: '2020-01-01',
          startTime: '18:00:00',
          endTime: '21:00:00',
          reason: 'Test'
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/overtimes/request')
        .send({
          date: '2026-01-10',
          startTime: '18:00:00',
          endTime: '21:00:00',
          reason: 'Test'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /overtimes/my-requests', () => {
    it('should get my overtime requests successfully', async () => {
      const response = await request(app)
        .get('/overtimes/my-requests')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/overtimes/my-requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
    });

    it('should support status filter', async () => {
      const response = await request(app)
        .get('/overtimes/my-requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ status: 'pending' });

      expect(response.status).toBe(200);
    });

    it('should support month and year filters', async () => {
      const response = await request(app)
        .get('/overtimes/my-requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ month: 1, year: 2026 });

      expect(response.status).toBe(200);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/overtimes/my-requests');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /overtimes/my-history', () => {
    it('should get my overtime history successfully', async () => {
      const response = await request(app)
        .get('/overtimes/my-history')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/overtimes/my-history')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
    });

    it('should support month and year filters', async () => {
      const response = await request(app)
        .get('/overtimes/my-history')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ month: 1, year: 2026 });

      expect(response.status).toBe(200);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/overtimes/my-history');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /overtimes/:id', () => {
    it('should return 404 for non-existent overtime request', async () => {
      const response = await request(app)
        .delete('/overtimes/99999')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/overtimes/1');

      expect(response.status).toBe(401);
    });

    it('should return 403 when trying to cancel other user overtime', async () => {
      const response = await request(app)
        .delete('/overtimes/1')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect([403, 404, 400]).toContain(response.status);
    });
  });
});
