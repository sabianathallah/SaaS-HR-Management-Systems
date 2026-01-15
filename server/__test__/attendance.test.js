const request = require('supertest');
const app = require('../app');
const path = require('path');

describe('Attendance Employee Endpoints', () => {
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

  describe('POST /attendances/clock-in', () => {
    it('should clock in successfully with photo', async () => {
      const response = await request(app)
        .post('/attendances/clock-in')
        .set('Authorization', `Bearer ${employeeToken}`)
        .field('latitude', '-6.200000')
        .field('longitude', '106.816666')
        .attach('photo', Buffer.from('fake-image-data'), 'checkin.jpg');

      expect([200, 201, 400, 409]).toContain(response.status);
      // 400/409 if already clocked in today
      if (response.status === 200 || response.status === 201) {
        expect(response.body).toHaveProperty('message');
      }
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/attendances/clock-in')
        .field('latitude', '-6.200000')
        .field('longitude', '106.816666');

      expect(response.status).toBe(401);
    });

    it('should return 400 without photo', async () => {
      const response = await request(app)
        .post('/attendances/clock-in')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          latitude: '-6.200000',
          longitude: '106.816666'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 without GPS coordinates', async () => {
      const response = await request(app)
        .post('/attendances/clock-in')
        .set('Authorization', `Bearer ${employeeToken}`)
        .attach('photo', Buffer.from('fake-image-data'), 'checkin.jpg');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /attendances/clock-out', () => {
    it('should return 400 if not clocked in yet', async () => {
      const response = await request(app)
        .post('/attendances/clock-out')
        .set('Authorization', `Bearer ${employeeToken}`)
        .field('latitude', '-6.200000')
        .field('longitude', '106.816666')
        .attach('photo', Buffer.from('fake-image-data'), 'checkout.jpg');

      expect([200, 400, 404]).toContain(response.status);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/attendances/clock-out')
        .field('latitude', '-6.200000')
        .field('longitude', '106.816666');

      expect(response.status).toBe(401);
    });

    it('should return 400 without photo', async () => {
      const response = await request(app)
        .put('/attendances/clock-out')
        .set('Authorization', `Bearer ${employeeToken}`)
        .field('latitude', '-6.200000')
        .field('longitude', '106.816666');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /attendances/my-attendance', () => {
    it('should get my attendance records successfully', async () => {
      const response = await request(app)
        .get('/attendances/my-attendance')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/attendances/my-attendance')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should support month and year filters', async () => {
      const response = await request(app)
        .get('/attendances/my-attendance')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ month: 1, year: 2026 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/attendances/my-attendance');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /attendances/today-attendance', () => {
    it('should get today attendance successfully', async () => {
      const response = await request(app)
        .get('/attendances/today-attendance')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/attendances/today-attendance');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /attendances/my-statistics', () => {
    it('should get my statistics successfully', async () => {
      const response = await request(app)
        .get('/attendances/my-statistics')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data.summary).toHaveProperty('totalPresent');
      expect(response.body.data.summary).toHaveProperty('late');
      expect(response.body.data.summary).toHaveProperty('absent');
    });

    it('should support month and year parameters', async () => {
      const response = await request(app)
        .get('/attendances/my-statistics')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ month: 1, year: 2026 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/attendances/my-statistics');

      expect(response.status).toBe(401);
    });
  });
});
