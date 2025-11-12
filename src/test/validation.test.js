import mongoose from 'mongoose';
import { 
  validateRegister, 
  validateLogin, 
  validateTask, 
  validateProject 
} from '../middlewares/validation.js';

describe('✅ Validaciones de Entrada', () => {
  describe('validateRegister', () => {
    test('debe aceptar datos válidos', () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
          securityQuestion: '¿Cuál es tu color favorito?',
          securityAnswer: 'Azul profundo'
        }
      };
      
      let statusCode = null;
      let jsonResponse = null;
      let nextCalled = false;

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

      const next = () => {
        nextCalled = true;
      };

      validateRegister(req, res, next);
      
      expect(nextCalled).toBe(true);
      expect(statusCode).toBeNull();
    });

    test('debe rechazar email inválido', () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'invalid-email',
          password: 'SecurePass123!',
          securityQuestion: '¿Color favorito?',
          securityAnswer: 'Azul'
        }
      };
      
      let statusCode = null;
      let jsonResponse = null;
      let nextCalled = false;

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

      const next = () => {
        nextCalled = true;
      };

      validateRegister(req, res, next);
      
      expect(statusCode).toBe(400);
      expect(nextCalled).toBe(false);
      expect(jsonResponse).toHaveProperty('error');
    });

    test('debe rechazar password débil', () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: '123',
          securityQuestion: '¿Color favorito?',
          securityAnswer: 'Azul'
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

      validateRegister(req, res, next);
      
      expect(statusCode).toBe(400);
      expect(jsonResponse.error).toContain('contraseña');
    });

    test('debe rechazar respuesta de seguridad corta', () => {
      const req = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
          securityQuestion: '¿Color favorito?',
          securityAnswer: 'Az'
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

      validateRegister(req, res, next);
      
      expect(statusCode).toBe(400);
      expect(jsonResponse.error).toContain('respuesta de seguridad');
    });
  });

  describe('validateLogin', () => {
    test('debe aceptar credenciales válidas', () => {
      const req = {
        body: {
          email: 'john@example.com',
          password: 'SecurePass123!'
        }
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

      validateLogin(req, res, next);
      
      expect(nextCalled).toBe(true);
    });

    test('debe rechazar email faltante', () => {
      const req = {
        body: {
          password: 'SecurePass123!'
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

      validateLogin(req, res, next);
      
      expect(statusCode).toBe(400);
      expect(jsonResponse).toHaveProperty('error');
    });
  });
});