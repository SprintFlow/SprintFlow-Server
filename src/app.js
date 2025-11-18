import express from 'express';
import cors from 'cors';
import authRoutes from './routes/AuthRoutes.js';
import userRoutes from './routes/UserRoutes.js';
import sprintRoutes from './routes/sprintRoutes.js';
import completionRoutes from './routes/CompletionRoutes.js';
import StoryRoutes from './routes/StoryRoutes.js';
import { protect, admin } from './middlewares/authMiddleware.js';
import pointsRegistryRoutes from './routes/pointsRegistryRoutes.js'; 

const app = express();

// ✅ CONFIGURACIÓN CORS MEJORADA - Reemplaza la línea app.use(cors());
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',  // Desarrollo
      'https://sprint-flow-client-kqk8.vercel.app'  // Producción - tu frontend
    ];
    
    // Permitir requests sin origin (como mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS bloqueado para origen:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Middlewares básicos
app.use(express.json({ limit: '10mb' })); // Aumentar límite para imágenes Base64
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging middleware (solo en desarrollo, no en tests)
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`📍 ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
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
  console.log('🌐 CORS configurado para:', corsOptions.origin);
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
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    allowedOrigins: corsOptions.origin
  });
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
  
  // Manejar errores de CORS específicamente
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Origen no permitido por CORS',
      allowedOrigins: corsOptions.origin
    });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

export default app;