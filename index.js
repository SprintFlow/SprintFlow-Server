require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 🧩 Importar rutas
const userRoutes = require('./src/routes/userRoutes');
const sprintRoutes = require('./src/routes/sprintRoutes');
const completionRoutes = require('./src/routes/CompletionRoutes');

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
app.use('/api/users', userRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/completions', completionRoutes);

// 🔌 Conexión y arranque del servidor
const startServer = async () => {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URI no está definido en .env');

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
