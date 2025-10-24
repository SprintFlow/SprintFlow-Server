import express from 'express'; // Usa import en lugar de const express = require('express');
import mongoose from 'mongoose'; // Usa import
import cors from 'cors'; // Usa import
import 'dotenv/config'; // Configura dotenv para Módulos ES

// 🧩 Importar rutas usando la sintaxis ESM (import)
// Nota: La importación predeterminada funciona solo si las rutas usan 'export default'.
import userRoutes from './src/routes/userRoutes.js'; 
import sprintRoutes from './src/routes/sprintRoutes.js';
import completionRoutes from './src/routes/completionRoutes.js'; 
// CRÍTICO: Asegúrate de que las rutas tengan la extensión .js aquí.


// 🚀 Inicializar app
const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// 🛠️ Middlewares
app.use(cors());
app.use(express.json());

// 🩺 Ruta base (health check)
app.get('/', (req, res) => {
  res.send('Servidor funcionando 😎');
});

// 🧭 Rutas principales
// Express ahora recibe los routers correctamente debido a la sintaxis ESM unificada.
app.use('/api/users', userRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/completions', completionRoutes); // LÍNEA 26 (Aproximadamente)

// 🔌 Conexión y arranque del servidor
const startServer = async () => {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URI no está definido en .env');

    // 🌐 Conexión a MongoDB (parte crítica para el proyecto [2])
    const connection = await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB! 🚀');

    const db = connection.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📚 Colecciones disponibles en la DB:');
    collections.forEach(col => console.log(`- ${col.name}`));

    app.listen(PORT, () =>
      console.log(`🔥 Servidor escuchando en http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
  }
};

startServer();