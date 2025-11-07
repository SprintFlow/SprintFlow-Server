// scripts/checkDatabase.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Diagnóstico de Base de Datos:');
console.log('================================');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sprintflow';

console.log('📡 URL de conexión:', MONGODB_URI);
console.log('🌐 Tipo:', MONGODB_URI.includes('mongodb.net') ? 'MongoDB Atlas (Nube)' : 'MongoDB Local');

const checkConnection = async () => {
  try {
    console.log('\n🔄 Probando conexión...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ CONEXIÓN EXITOSA!');
    console.log('📊 Base de datos:', mongoose.connection.db.databaseName);
    
    // Verificar colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Colecciones:', collections.map(c => c.name).join(', ') || 'NINGUNA');
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.log('❌ ERROR de conexión:', error.message);
    console.log('\n💡 SOLUCIONES:');
    
    if (MONGODB_URI.includes('localhost')) {
      console.log('   1. Instala MongoDB: https://www.mongodb.com/try/download/community');
      console.log('   2. O cambia a MongoDB Atlas (gratis)');
    } else {
      console.log('   1. Verifica tu conexión a internet');
      console.log('   2. Revisa la URL de MongoDB Atlas en .env');
      console.log('   3. Asegúrate de que tu IP está en la whitelist de Atlas');
    }
  }
};

checkConnection();