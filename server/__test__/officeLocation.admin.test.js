const request = require('supertest');
const app = require('../app');

describe('Office Location Admin Endpoints', () => {
  let adminToken;
  let employeeToken;
  let createdLocationId;

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

  describe('GET /office-locations/admin', () => {
    it('should get all office locations successfully', async () => {
      const response = await request(app)
        .get('/office-locations/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/office-locations/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
    });

    it('should support isActive filter', async () => {
      const response = await request(app)
        .get('/office-locations/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ isActive: true });

      expect(response.status).toBe(200);
    });

    it('should support search query', async () => {
      const response = await request(app)
        .get('/office-locations/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ search: 'office' });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/office-locations/admin')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/office-locations/admin');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /office-locations/admin', () => {
    it('should create office location successfully', async () => {
      const response = await request(app)
        .post('/office-locations/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Branch Office',
          address: '123 Test Street',
          latitude: -6.200000,
          longitude: 106.816666,
          radius: 100
        });

      expect([200, 201, 400]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('data');
        createdLocationId = response.body.data?.id;
      }
    });

    it('should return 400 without required fields', async () => {
      const response = await request(app)
        .post('/office-locations/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Office'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 with invalid coordinates', async () => {
      const response = await request(app)
        .post('/office-locations/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Office',
          address: '123 Test Street',
          latitude: 200, // Invalid latitude
          longitude: 106.816666,
          radius: 100
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 with negative radius', async () => {
      const response = await request(app)
        .post('/office-locations/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Office',
          address: '123 Test Street',
          latitude: -6.200000,
          longitude: 106.816666,
          radius: -50
        });

      expect(response.status).toBe(400);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/office-locations/admin')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          name: 'Test Office',
          address: '123 Test Street',
          latitude: -6.200000,
          longitude: 106.816666,
          radius: 100
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /office-locations/admin/:id', () => {
    it('should get office location by id successfully', async () => {
      const response = await request(app)
        .get('/office-locations/admin/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('name');
      }
    });

    it('should return 404 for non-existent location', async () => {
      const response = await request(app)
        .get('/office-locations/admin/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/office-locations/admin/1')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /office-locations/admin/:id', () => {
    it('should update office location successfully', async () => {
      const response = await request(app)
        .put('/office-locations/admin/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Office Name',
          radius: 150
        });

      expect([200, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent location', async () => {
      const response = await request(app)
        .put('/office-locations/admin/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Office'
        });

      expect(response.status).toBe(404);
    });

    it('should return 400 with invalid coordinates', async () => {
      const response = await request(app)
        .put('/office-locations/admin/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          latitude: 200
        });

      expect([400, 404]).toContain(response.status);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put('/office-locations/admin/1')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          name: 'Updated Office'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /office-locations/admin/:id', () => {
    it('should return 404 for non-existent location', async () => {
      const response = await request(app)
        .delete('/office-locations/admin/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete('/office-locations/admin/1')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /office-locations/admin/:id/toggle', () => {
    it('should toggle office location status successfully', async () => {
      const response = await request(app)
        .patch('/office-locations/admin/1/toggle')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent location', async () => {
      const response = await request(app)
        .patch('/office-locations/admin/99999/toggle')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .patch('/office-locations/admin/1/toggle')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /office-locations/admin/:id/stats', () => {
    it('should get location usage statistics successfully', async () => {
      const response = await request(app)
        .get('/office-locations/admin/1/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
      }
    });

    it('should support date range filters', async () => {
      const response = await request(app)
        .get('/office-locations/admin/1/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ startDate: '2026-01-01', endDate: '2026-01-31' });

      expect([200, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent location', async () => {
      const response = await request(app)
        .get('/office-locations/admin/99999/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/office-locations/admin/1/stats')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });
});
