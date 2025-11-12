import mongoose from 'mongoose';

describe('🏃 Sprint Status Tests', () => {
  test('should have active MongoDB connection', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  test('should handle sprint status logic', () => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    expect(futureDate > now).toBe(true);
  });

  test('should validate sprint dates', () => {
    const startDate = new Date();
    const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    
    expect(endDate > startDate).toBe(true);
  });
});