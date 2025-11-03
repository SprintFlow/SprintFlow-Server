import express from 'express';
import cors from 'cors';
import authRoutes from './routes/AuthRoutes.js';
import userRoutes from './routes/UserRoutes.js';
import sprintRoutes from './routes/sprintRoutes.js';
import completionRoutes from './routes/CompletionRoutes.js';
import StoryRoutes from './routes/StoryRoutes.js';
import { protect, admin } from './middlewares/authMiddleware.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/completions', completionRoutes);
app.use('/api/stories', StoryRoutes);

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

export default app;
