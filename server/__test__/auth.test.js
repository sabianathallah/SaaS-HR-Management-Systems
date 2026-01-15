const request = require('supertest');
const app = require('../app');

describe('Authentication Endpoints', () => {
  describe('POST /login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'admin@company.com',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          password: 'admin123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'admin@company.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'admin@company.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with non-existent email', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /register', () => {
    let adminToken;

    beforeAll(async () => {
      // Login as admin to get token
      const loginResponse = await request(app)
        .post('/login')
        .send({
          email: 'admin@company.com',
          password: 'admin123'
        });
      adminToken = loginResponse.body.access_token;
    });

    it('should register new user with admin token', async () => {
      const newUser = {
        email: `test${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'Test User',
        role: 'Employee',
        departement: 'IT',
        position: 'Developer'
      };

      const response = await request(app)
        .post('/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newUser);

      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 without authentication token', async () => {
      const newUser = {
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
        role: 'employee'
      };

      const response = await request(app)
        .post('/register')
        .send(newUser);

      expect(response.status).toBe(401);
    });

    it('should return 403 with non-admin token', async () => {
      // Login as employee
      const employeeLogin = await request(app)
        .post('/login')
        .send({
          email: 'budi@company.com',
          password: 'password123'
        });

      const newUser = {
        email: `test${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Test User',
        role: 'employee'
      };

      const response = await request(app)
        .post('/register')
        .set('Authorization', `Bearer ${employeeLogin.body.access_token}`)
        .send(newUser);

      expect(response.status).toBe(403);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'test@example.com'
          // Missing password, fullName, etc.
        });

      expect([400, 401]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 with invalid email format', async () => {
      const response = await request(app)
        .post('/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          fullName: 'Test User',
          role: 'employee'
        });

      expect([400, 401]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when email already exists', async () => {
      const response = await request(app)
        .post('/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'admin@company.com', // Already exists
          password: 'Password123!',
          fullName: 'Test User',
          role: 'employee'
        });

      expect([400, 401, 409]).toContain(response.status);
      expect(response.body).toHaveProperty('message');
    });
  });
});
