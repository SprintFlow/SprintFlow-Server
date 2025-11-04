import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    createPointsRegistry,
    getUserSprintRegistries,
    getSprintRegistries,
    getUserRegistries,
    deletePointsRegistry
} from '../controllers/PointsRegistryController.js';

const router = express.Router();

// === RUTAS PÚBLICAS (requieren autenticación) ===

// Crear nuevo registro de puntos
router.post('/', protect, createPointsRegistry);

// Obtener registros de un usuario en un sprint específico
router.get('/user/:userId/sprint/:sprintId', protect, getUserSprintRegistries);

// Obtener todos los registros de un usuario (historial completo)
router.get('/user/:userId', protect, getUserRegistries);

// Obtener todos los registros de un sprint (admin/scrum master)
router.get('/sprint/:sprintId', protect, getSprintRegistries);

// Eliminar un registro
router.delete('/:id', protect, deletePointsRegistry);

export default router;