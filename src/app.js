import express from 'express';
import cors from 'cors';
import authRoutes from './routes/AuthRoutes.js';
import userRoutes from './routes/UserRoutes.js';
import sprintRoutes from './routes/sprintRoutes.js';
import completionRoutes from './routes/CompletionRoutes.js';
import StoryRoutes from './routes/StoryRoutes.js';
import { protect, admin } from './middlewares/authMiddleware.js';
import pointsRegistryRoutes from './routes/PointsRegistryRoutes.js'; 

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Aumentar límite para imágenes Base64
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging middleware (solo en desarrollo, no en tests)
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`📍 ${req.method} ${req.path}`);
    next();
  });
}

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/completions', completionRoutes);
app.use('/api/stories', StoryRoutes);
app.use('/api/points-registry', pointsRegistryRoutes);

// Log de rutas registradas (solo en desarrollo)
if (process.env.NODE_ENV !== 'test') {
  console.log('✅ Rutas registradas:');
  console.log('  - /api/auth');
  console.log('  - /api/users');
  console.log('  - /api/sprints');
  console.log('  - /api/completions');
  console.log('  - /api/stories');
  console.log('  - /api/points-registry');
}

// Rutas de prueba / protegidas
app.get('/api/private', protect, (req, res) => {
  res.json({ message: `Hola ${req.user.name}, accediste a una ruta protegida` });
});

app.get('/api/admin', protect, admin, (req, res) => {
  res.json({ message: `Bienvenido Admin ${req.user.name}` });
});

// Health check
app.get('/', (req, res) => {
  res.send('Servidor funcionando');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error('Error:', err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

export default app;