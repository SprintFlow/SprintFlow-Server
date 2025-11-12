import mongoose from 'mongoose';

describe('🛡️ Verificación de Seguridad', () => {
  test('NO debe estar conectado a MongoDB Atlas', () => {
    const uri = mongoose.connection.host;
    expect(uri).not.toContain('mongodb.net');
    expect(uri).not.toContain('cluster');
  });

  test('Debe estar usando MongoDB en memoria', () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = conectado
    expect(mongoose.connection.host).toContain('127.0.0.1');
  });

  test('Variables de entorno de test deben estar configuradas', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBeDefined();
  });
});