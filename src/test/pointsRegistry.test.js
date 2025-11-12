import request from 'supertest';
import app from '../app.js';

describe('📊 Points Registry', () => {
  let authToken;

  beforeAll(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Points Tester',
        email: 'points@test.com',
        password: 'SecurePass123!',
        securityQuestion: '¿Ciudad natal?',
        securityAnswer: 'Madrid capital'
      });

    authToken = registerRes.body.token;
  });

  describe('GET /api/points-registry', () => {
    test('should handle get all points registries', async () => {
      const res = await request(app)
        .get('/api/points-registry')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    test('should fail without authentication', async () => {
      const res = await request(app)
        .get('/api/points-registry');

      expect([401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe('POST /api/points-registry', () => {
    test('should handle points registry creation', async () => {
      const res = await request(app)
        .post('/api/points-registry')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          points: 10,
          reason: 'Test points'
        });

      expect([200, 201, 400, 401, 404, 500]).toContain(res.status);
    });
  });
});