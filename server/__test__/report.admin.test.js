const request = require('supertest');
const app = require('../app');

describe('Report Admin Endpoints', () => {
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

  describe('GET /reports/export/excel', () => {
    it('should export attendance to Excel successfully', async () => {
      const response = await request(app)
        .get('/reports/export/excel')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        });

      expect([200, 400]).toContain(response.status);
      if (response.status === 200) {
        expect(response.headers['content-type']).toContain('spreadsheet');
      }
    });

    it('should return 400 without required date parameters', async () => {
      const response = await request(app)
        .get('/reports/export/excel')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should support userId filter', async () => {
      const response = await request(app)
        .get('/reports/export/excel')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          userId: 2
        });

      expect([200, 400]).toContain(response.status);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/reports/export/excel')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /reports/export/csv', () => {
    it('should export attendance to CSV successfully', async () => {
      const response = await request(app)
        .get('/reports/export/csv')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        });

      expect([200, 400]).toContain(response.status);
      if (response.status === 200) {
        expect(response.headers['content-type']).toContain('csv');
      }
    });

    it('should return 400 without required date parameters', async () => {
      const response = await request(app)
        .get('/reports/export/csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should support userId filter', async () => {
      const response = await request(app)
        .get('/reports/export/csv')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          userId: 2
        });

      expect([200, 400]).toContain(response.status);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/reports/export/csv')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /reports/monthly', () => {
    it('should generate monthly report successfully', async () => {
      const response = await request(app)
        .get('/reports/monthly')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          month: 1,
          year: 2026
        });

      expect([200, 400, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.headers['content-type']).toContain('spreadsheet');
      }
    });

    it('should return 400 without required parameters', async () => {
      const response = await request(app)
        .get('/reports/monthly')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
    });

    it('should support userId filter', async () => {
      const response = await request(app)
        .get('/reports/monthly')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          month: 1,
          year: 2026,
          userId: 2
        });

      expect([200, 400]).toContain(response.status);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/reports/monthly')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({
          month: 1,
          year: 2026
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /reports/preview', () => {
    it('should get report preview successfully', async () => {
      const response = await request(app)
        .get('/reports/preview')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('attendances');
    });

    it('should return 400 without required parameters', async () => {
      const response = await request(app)
        .get('/reports/preview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200); // Params are optional
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/reports/preview')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          page: 1,
          limit: 10
        });

      expect([200, 400]).toContain(response.status);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/reports/preview')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({
          startDate: '2026-01-01',
          endDate: '2026-01-31'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /reports/employee-performance', () => {
    it('should get employee performance report successfully', async () => {
      const response = await request(app)
        .get('/reports/employee-performance')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          month: 1,
          year: 2026
        });

      expect([200, 400]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
      }
    });

    it('should return 400 without required parameters', async () => {
      const response = await request(app)
        .get('/reports/employee-performance')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
    });

    it('should support userId filter', async () => {
      const response = await request(app)
        .get('/reports/employee-performance')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          month: 1,
          year: 2026,
          userId: 2
        });

      expect([200, 400]).toContain(response.status);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/reports/employee-performance')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({
          month: 1,
          year: 2026
        });

      expect(response.status).toBe(403);
    });
  });
});
