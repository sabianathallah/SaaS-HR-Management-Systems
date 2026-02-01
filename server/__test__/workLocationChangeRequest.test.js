const request = require('supertest');
const app = require('../app');
const { sequelize, WorkLocationChangeRequest, User, HybridSchedule } = require('../models');
const { generateToken } = require('../helpers/jwt');

let employeeToken;
let adminToken;
let employeeId;
let adminId;
let requestId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  
  // Create admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'ADMIN',
    position: 'Manager',
    department: 'HR'
  });
  adminId = admin.id;
  adminToken = generateToken({ id: admin.id, email: admin.email, role: admin.role });
  
  // Create employee user
  const employee = await User.create({
    name: 'Employee User',
    email: 'employee@test.com',
    password: 'employee123',
    role: 'EMPLOYEE',
    position: 'Software Engineer',
    department: 'IT'
  });
  employeeId = employee.id;
  employeeToken = generateToken({ id: employee.id, email: employee.email, role: employee.role });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Work Location Change Request - Employee', () => {
  describe('POST /work-location-changes', () => {
    it('should create a work location change request', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const requestDate = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .post('/work-location-changes')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          requestDate,
          requestedLocationType: 'WFH',
          reason: 'Ada keperluan keluarga yang mendesak, mohon izin untuk WFH'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Work location change request created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.requestedLocationType).toBe('WFH');
      expect(response.body.data.status).toBe('PENDING');
      
      requestId = response.body.data.id;
    });

    it('should reject request with date in the past', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const requestDate = yesterday.toISOString().split('T')[0];

      const response = await request(app)
        .post('/work-location-changes')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          requestDate,
          requestedLocationType: 'WFH',
          reason: 'Testing past date request'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('past');
    });

    it('should reject duplicate request for same date', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const requestDate = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .post('/work-location-changes')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          requestDate,
          requestedLocationType: 'REMOTE',
          reason: 'Another request for same date'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('already have');
    });

    it('should reject request with short reason', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      const requestDate = tomorrow.toISOString().split('T')[0];

      const response = await request(app)
        .post('/work-location-changes')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          requestDate,
          requestedLocationType: 'WFH',
          reason: 'Short'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /work-location-changes', () => {
    it('should get all own requests', async () => {
      const response = await request(app)
        .get('/work-location-changes')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter requests by status', async () => {
      const response = await request(app)
        .get('/work-location-changes?status=PENDING')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(req => {
        expect(req.status).toBe('PENDING');
      });
    });
  });

  describe('PATCH /work-location-changes/:id/cancel', () => {
    it('should cancel a pending request', async () => {
      const response = await request(app)
        .patch(`/work-location-changes/${requestId}/cancel`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('CANCELLED');
    });

    it('should not cancel already cancelled request', async () => {
      const response = await request(app)
        .patch(`/work-location-changes/${requestId}/cancel`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(400);
    });
  });
});

describe('Work Location Change Request - Admin', () => {
  let pendingRequestId;

  beforeAll(async () => {
    // Create a new pending request for admin testing
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    
    const request = await WorkLocationChangeRequest.create({
      UserId: employeeId,
      requestDate: tomorrow.toISOString().split('T')[0],
      originalLocationType: 'ONSITE',
      requestedLocationType: 'WFH',
      reason: 'Request for admin approval testing',
      status: 'PENDING'
    });
    pendingRequestId = request.id;
  });

  describe('GET /work-location-changes/admin', () => {
    it('should get all requests', async () => {
      const response = await request(app)
        .get('/work-location-changes/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toHaveProperty('totalItems');
    });

    it('should deny access to employee', async () => {
      const response = await request(app)
        .get('/work-location-changes/admin')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /work-location-changes/admin/pending', () => {
    it('should get pending requests', async () => {
      const response = await request(app)
        .get('/work-location-changes/admin/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach(req => {
        expect(req.status).toBe('PENDING');
      });
    });
  });

  describe('PATCH /work-location-changes/admin/:id/approve', () => {
    it('should approve a request', async () => {
      const response = await request(app)
        .patch(`/work-location-changes/admin/${pendingRequestId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('APPROVED');
      expect(response.body.data.approvedBy).toBe(adminId);
      expect(response.body.data.approvalDate).toBeTruthy();
    });
  });

  describe('PATCH /work-location-changes/admin/:id/reject', () => {
    let anotherRequestId;

    beforeAll(async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 4);
      
      const request = await WorkLocationChangeRequest.create({
        UserId: employeeId,
        requestDate: tomorrow.toISOString().split('T')[0],
        originalLocationType: 'ONSITE',
        requestedLocationType: 'REMOTE',
        reason: 'Request for rejection testing',
        status: 'PENDING'
      });
      anotherRequestId = request.id;
    });

    it('should reject a request with reason', async () => {
      const response = await request(app)
        .patch(`/work-location-changes/admin/${anotherRequestId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rejectionReason: 'Ada meeting penting yang harus dihadiri di kantor'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('REJECTED');
      expect(response.body.data.rejectionReason).toBe('Ada meeting penting yang harus dihadiri di kantor');
    });

    it('should require rejection reason', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 5);
      
      const request = await WorkLocationChangeRequest.create({
        UserId: employeeId,
        requestDate: tomorrow.toISOString().split('T')[0],
        originalLocationType: 'ONSITE',
        requestedLocationType: 'WFH',
        reason: 'Another test request',
        status: 'PENDING'
      });

      const response = await request(app)
        .patch(`/work-location-changes/admin/${request.id}/reject`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /work-location-changes/admin/statistics', () => {
    it('should get statistics', async () => {
      const response = await request(app)
        .get('/work-location-changes/admin/statistics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('byStatus');
      expect(response.body.data).toHaveProperty('byLocationType');
    });
  });
});
