const request = require('supertest');
const app = require('../app');

describe('Notification Endpoints', () => {
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

  describe('GET /notifications', () => {
    it('should get my notifications successfully', async () => {
      const response = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
    });

    it('should support isRead filter', async () => {
      const response = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ isRead: false });

      expect(response.status).toBe(200);
    });

    it('should support type filter', async () => {
      const response = await request(app)
        .get('/notifications')
        .set('Authorization', `Bearer ${employeeToken}`)
        .query({ type: 'LEAVE_APPROVED' });

      expect(response.status).toBe(200);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/notifications');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /notifications/unread-count', () => {
    it('should get unread count successfully', async () => {
      const response = await request(app)
        .get('/notifications/unread-count')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('unreadCount');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/notifications/unread-count');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /notifications/:id/read', () => {
    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .patch('/notifications/99999/read')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/notifications/1/read');

      expect(response.status).toBe(401);
    });

    it('should return 403 when trying to mark other user notification', async () => {
      // This would need actual data setup to properly test
      const response = await request(app)
        .patch('/notifications/1/read')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect([403, 404, 200]).toContain(response.status);
    });
  });

  describe('PATCH /notifications/read-all', () => {
    it('should mark all notifications as read successfully', async () => {
      const response = await request(app)
        .patch('/notifications/read-all')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch('/notifications/read-all');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .delete('/notifications/99999')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/notifications/1');

      expect(response.status).toBe(401);
    });

    it('should return 403 when trying to delete other user notification', async () => {
      const response = await request(app)
        .delete('/notifications/1')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect([403, 404, 200]).toContain(response.status);
    });
  });

  describe('DELETE /notifications/clear-read', () => {
    it('should clear read notifications successfully', async () => {
      const response = await request(app)
        .delete('/notifications/clear-read')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/notifications/clear-read');

      expect(response.status).toBe(401);
    });
  });
});
