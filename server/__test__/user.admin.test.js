const request = require('supertest');
const app = require('../app');

describe('User Admin Endpoints', () => {
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

  describe('GET /users/admin', () => {
    it('should get all users successfully', async () => {
      const response = await request(app)
        .get('/users/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/users/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
    });

    it('should support role filter', async () => {
      const response = await request(app)
        .get('/users/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ role: 'employee' });

      expect(response.status).toBe(200);
    });

    it('should support status filter', async () => {
      const response = await request(app)
        .get('/users/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ status: 'active' });

      expect(response.status).toBe(200);
    });

    it('should support search query', async () => {
      const response = await request(app)
        .get('/users/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ search: 'admin' });

      expect(response.status).toBe(200);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/users/admin')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/users/admin');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /users/admin/:id', () => {
    it('should get user detail successfully', async () => {
      const response = await request(app)
        .get('/users/admin/2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('name');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/users/admin/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/users/admin/2')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /users/admin/:id', () => {
    it('should update user successfully', async () => {
      const response = await request(app)
        .put('/users/admin/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Updated Employee Name',
          departement: 'IT',
          position: 'Senior Developer'
        });

      expect([200, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/users/admin/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fullName: 'Test User'
        });

      expect(response.status).toBe(404);
    });

    it('should return 400 with invalid email format', async () => {
      const response = await request(app)
        .put('/users/admin/2')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put('/users/admin/2')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          fullName: 'Test'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /users/admin/:id/status', () => {
    it('should toggle user status successfully', async () => {
      const response = await request(app)
        .patch('/users/admin/2/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: false
        });

      expect([200, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .patch('/users/admin/99999/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isActive: false
        });

      expect(response.status).toBe(404);
    });

    it('should return 400 without isActive field', async () => {
      const response = await request(app)
        .patch('/users/admin/2/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .patch('/users/admin/2/status')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          isActive: false
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /users/admin/:id/employment-dates', () => {
    it('should update employment dates successfully', async () => {
      const response = await request(app)
        .patch('/users/admin/2/employment-dates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          joinDate: '2025-01-01',
          leaveDate: null
        });

      expect([200, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .patch('/users/admin/99999/employment-dates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          joinDate: '2025-01-01'
        });

      expect(response.status).toBe(404);
    });

    it('should return 400 with leave date before join date', async () => {
      const response = await request(app)
        .patch('/users/admin/2/employment-dates')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          joinDate: '2025-12-01',
          leaveDate: '2025-01-01'
        });

      expect(response.status).toBe(400);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .patch('/users/admin/2/employment-dates')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          joinDate: '2025-01-01'
        });

      expect(response.status).toBe(403);
    });
  });
});
