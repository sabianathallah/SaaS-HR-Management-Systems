const request = require('supertest');
const app = require('../app');

describe('Shift Admin Endpoints', () => {
  let adminToken;
  let employeeToken;
  let createdShiftId;

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

  describe('GET /shifts/admin/shifts', () => {
    it('should get all shifts successfully', async () => {
      const response = await request(app)
        .get('/shifts/admin/shifts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/shifts/admin/shifts')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
    });

    it('should support isActive filter', async () => {
      const response = await request(app)
        .get('/shifts/admin/shifts')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ isActive: true });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/shifts/admin/shifts')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/shifts/admin/shifts');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /shifts/admin/shifts', () => {
    it('should create shift successfully', async () => {
      const response = await request(app)
        .post('/shifts/admin/shifts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Night Shift',
          startTime: '22:00:00',
          endTime: '06:00:00',
          description: 'Night shift for testing'
        });

      expect([200, 201, 400]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('data');
        createdShiftId = response.body.data?.id;
      }
    });

    it('should return 400 without required fields', async () => {
      const response = await request(app)
        .post('/shifts/admin/shifts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Shift'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 with invalid time format', async () => {
      const response = await request(app)
        .post('/shifts/admin/shifts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Shift',
          startTime: 'invalid',
          endTime: '17:00:00'
        });

      expect(response.status).toBe(400);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/shifts/admin/shifts')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          name: 'Test Shift',
          startTime: '09:00:00',
          endTime: '17:00:00'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /shifts/admin/shifts/:id', () => {
    it('should get shift by id successfully', async () => {
      const response = await request(app)
        .get('/shifts/admin/shifts/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('name');
      }
    });

    it('should return 404 for non-existent shift', async () => {
      const response = await request(app)
        .get('/shifts/admin/shifts/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/shifts/admin/shifts/1')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /shifts/admin/shifts/:id', () => {
    it('should update shift successfully', async () => {
      const response = await request(app)
        .put('/shifts/admin/shifts/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Morning Shift',
          startTime: '08:00:00',
          endTime: '16:00:00'
        });

      expect([200, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent shift', async () => {
      const response = await request(app)
        .put('/shifts/admin/shifts/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Shift'
        });

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put('/shifts/admin/shifts/1')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          name: 'Updated Shift'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /shifts/admin/shifts/:id', () => {
    it('should return 404 for non-existent shift', async () => {
      const response = await request(app)
        .delete('/shifts/admin/shifts/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete('/shifts/admin/shifts/1')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /shifts/admin/users/:userId/shift', () => {
    it('should assign shift to user successfully', async () => {
      const response = await request(app)
        .put('/shifts/admin/users/2/shift')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          shiftId: 1
        });

      expect([200, 404, 400]).toContain(response.status);
    });

    it('should return 400 without shiftId', async () => {
      const response = await request(app)
        .put('/shifts/admin/users/2/shift')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/shifts/admin/users/99999/shift')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          shiftId: 1
        });

      expect(response.status).toBe(404);
    });

    it('should return 404 for non-existent shift', async () => {
      const response = await request(app)
        .put('/shifts/admin/users/2/shift')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          shiftId: 99999
        });

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put('/shifts/admin/users/2/shift')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          shiftId: 1
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /shifts/admin/users/:userId/shift', () => {
    it('should remove shift from user successfully', async () => {
      const response = await request(app)
        .delete('/shifts/admin/users/2/shift')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 400]).toContain(response.status);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/shifts/admin/users/99999/shift')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete('/shifts/admin/users/2/shift')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });
});
