import mongoose from 'mongoose';

describe('🔧 Setup - Database Connection', () => {
  test('should be connected to MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  test('should be using test database', () => {
    const uri = mongoose.connection.host;
    expect(uri).toContain('127.0.0.1');
  });

  test('should have test environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});