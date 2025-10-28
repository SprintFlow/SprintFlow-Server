import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import 'dotenv/config';

// 🧩 Importar rutas
import authRoutes from './src/routes/AuthRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import sprintRoutes from './src/routes/sprintRoutes.js';
import completionRoutes from './src/routes/completionRoutes.js';
import StoryRoutes from './src/routes/StoryRoutes.js'

// 🛡️ Importar middlewares
import { protect, admin } from './src/middlewares/authMiddleware.js';


// 🚀 Inicializar app
const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

// 🛠️ Middlewares globales
app.use(cors());
app.use(express.json());

// 🩺 Ruta base (health check)
app.get('/', (req, res) => {
  res.send('Servidor funcionando 😎');
});

// 🧭 Rutas principales

// Express ahora recibe los routers correctamente debido a la sintaxis ESM unificada.
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/completions', completionRoutes);
app.use('/api/stories', StoryRoutes);

// 🔒 Ejemplo de rutas protegidas con JWT:
app.get('/api/private', protect, (req, res) => {
  res.json({ message: `Hola ${req.user.name}, accediste a una ruta protegida ✅` });
});

app.get('/api/admin', protect, admin, (req, res) => {
  res.json({ message: `Bienvenido Admin ${req.user.name} 👑` });
});

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
