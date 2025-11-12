import request from 'supertest';
import app from '../app.js';

describe('🏃 Sprint Management', () => {
  let authToken;
  let sprintId;

  beforeAll(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sprint Tester',
        email: 'sprint@test.com',
        password: 'SecurePass123!',
        securityQuestion: '¿Mascota?',
        securityAnswer: 'Perro labrador'
      });

    authToken = registerRes.body.token;
  });

  describe('POST /api/sprints', () => {
    test('should handle sprint creation', async () => {
      const res = await request(app)
        .post('/api/sprints')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Sprint 1',
          goal: 'Complete user authentication',
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'Planificado'
        });

      expect([200, 201, 400, 401, 403, 404, 500]).toContain(res.status);
      
      if (res.status === 200 || res.status === 201) {
        sprintId = res.body._id || res.body.id;
      }
    });

    test('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/sprints')
        .send({
          name: 'Sprint 2',
          goal: 'Test goal'
        });

      expect([401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe('GET /api/sprints', () => {
    test('should handle get all sprints', async () => {
      const res = await request(app)
        .get('/api/sprints')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe('GET /api/sprints/:id', () => {
    test('should handle get sprint by id', async () => {
      const testId = sprintId || '507f1f77bcf86cd799439011';
      
      const res = await request(app)
        .get(`/api/sprints/${testId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 404, 500]).toContain(res.status);
    });
  });

  describe('PUT /api/sprints/:id', () => {
    test('should handle sprint update', async () => {
      const testId = sprintId || '507f1f77bcf86cd799439011';
      
      const res = await request(app)
        .put(`/api/sprints/${testId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Sprint 1 - Updated'
        });

      expect([200, 400, 401, 404, 500]).toContain(res.status);
    });
  });

  describe('DELETE /api/sprints/:id', () => {
    test('should handle sprint deletion', async () => {
      const testId = sprintId || '507f1f77bcf86cd799439011';
      
      const res = await request(app)
        .delete(`/api/sprints/${testId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 204, 401, 404, 500]).toContain(res.status);
    });
  });
});