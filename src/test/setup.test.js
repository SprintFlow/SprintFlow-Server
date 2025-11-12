import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno de .env.test
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env.test') });

const originalConsole = { ...console };
let mongoServer;

beforeAll(async () => {
  try {
    console.log('\n🛡️  INICIANDO TESTS EN MODO SEGURO (MongoDB en memoria)');
    console.log('✅ Tu base de datos de Atlas NO será tocada\n');

    if (process.env.MONGODB_URI?.includes('mongodb.net')) {
      throw new Error('❌ PELIGRO: Intentando usar MongoDB Atlas en tests');
    }

    console.log('⏳ Iniciando MongoDB en memoria (puede tardar la primera vez)...\n');

    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '6.0.9',
        skipMD5: true
      },
      instance: {
        dbName: 'testdb'
      }
    });

    const mongoUri = mongoServer.getUri();

    console.log('🧪 Conectando a MongoDB en MEMORIA (seguro)...');
    console.log(`📍 URI: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB en memoria\n');
  } catch (error) {
    console.error('❌ Error en setup:', error.message);
    console.error('\n💡 Si el error persiste, ejecuta:');
    console.error('   npm run clean && rm -rf mongodb-binaries\n');
    throw error;
  }
}, 180000);

afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('\n✅ Desconectado de MongoDB');
    }
    if (mongoServer) {
      await mongoServer.stop();
      console.log('✅ Servidor de memoria detenido');
    }
  } catch (error) {
    console.error('Error en teardown:', error);
  }
}, 30000);

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});