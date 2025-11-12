import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './src/app.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URI no definido en .env');
    
    const connection = await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB!');

    const db = connection.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📚 Colecciones disponibles:');
    collections.forEach(col => console.log(`- ${col.name}`));

    app.listen(PORT, () =>
      console.log(`🔥 Servidor escuchando en http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

// Solo iniciar servidor si NO estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Exportar app para tests
export default app;