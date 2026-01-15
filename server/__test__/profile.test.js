const request = require('supertest');
const app = require('../app');

describe('Profile Endpoints', () => {
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

  describe('GET /profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('role');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get('/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/profile')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /profile', () => {
    it('should update user profile (name) successfully', async () => {
      const response = await request(app)
        .put('/profile')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          name: 'Budi Santoso Updated'
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .put('/profile')
        .send({
          name: 'Test Name'
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 with empty name', async () => {
      const response = await request(app)
        .put('/profile')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          name: ''
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /profile/change-password', () => {
    it('should change password successfully with correct old password', async () => {
      const response = await request(app)
        .put('/profile/change-password')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          oldPassword: 'password123',
          newPassword: 'newPassword123!'
        });

      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty('message');

      // Change back to original password
      await request(app)
        .put('/profile/change-password')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          oldPassword: 'newPassword123!',
          newPassword: 'password123'
        });
    });

    it('should return 401 with incorrect old password', async () => {
      const response = await request(app)
        .put('/profile/change-password')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          oldPassword: 'wrongpassword',
          newPassword: 'newPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when old password is missing', async () => {
      const response = await request(app)
        .put('/profile/change-password')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          newPassword: 'newPassword123!'
        });

      expect([400, 401]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when new password is missing', async () => {
      const response = await request(app)
        .put('/profile/change-password')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          oldPassword: 'password123'
        });

      expect([400, 401]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .put('/profile/change-password')
        .send({
          oldPassword: 'password123',
          newPassword: 'newPassword123!'
        });

      expect(response.status).toBe(401);
    });
  });
});
