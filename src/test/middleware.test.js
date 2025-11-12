import { protect, admin } from '../middlewares/authMiddleware.js';

describe('🛡️ Auth Middleware', () => {
  describe('protect middleware', () => {
    test('should fail without token', async () => {
      const req = { 
        headers: {},
        header: function(name) {
          return this.headers[name.toLowerCase()];
        }
      };
      
      let statusCode = null;
      let jsonResponse = null;

      const res = {
        status: function(code) {
          statusCode = code;
          return this;
        },
        json: function(data) {
          jsonResponse = data;
          return this;
        }
      };

      const next = () => {};

      await protect(req, res, next);

      expect(statusCode).toBe(401);
      expect(jsonResponse).toBeDefined();
    });

    test('should fail with invalid token', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid-token'
        },
        header: function(name) {
          return this.headers[name.toLowerCase()];
        }
      };

      let statusCode = null;

      const res = {
        status: function(code) {
          statusCode = code;
          return this;
        },
        json: function(data) {
          return this;
        }
      };

      const next = () => {};

      await protect(req, res, next);

      expect(statusCode).toBe(401);
    });
  });

  describe('admin middleware', () => {
    test('should fail if user is not admin', () => {
      const req = {
        user: { isAdmin: false, role: 'Developer' }
      };

      let statusCode = null;

      const res = {
        status: function(code) {
          statusCode = code;
          return this;
        },
        json: function(data) {
          return this;
        }
      };

      const next = () => {};

      admin(req, res, next);

      expect(statusCode).toBe(403);
    });

    test('should pass if user is admin', () => {
      const req = {
        user: { isAdmin: true, role: 'Admin' }
      };

      let nextCalled = false;

      const res = {
        status: function(code) {
          return this;
        },
        json: function(data) {
          return this;
        }
      };

      const next = () => {
        nextCalled = true;
      };

      admin(req, res, next);

      expect(nextCalled).toBe(true);
    });
  });
});