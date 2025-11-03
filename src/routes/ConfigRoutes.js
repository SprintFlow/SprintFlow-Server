import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/config/preferences
 * @desc    Get user preferences (theme, notifications, etc.)
 * @access  Private
 */
router.get('/preferences', protect, async (req, res) => {
    try {
        // TODO: Implementar cuando se cree el modelo de preferencias
        res.status(200).json({
            theme: 'light',
            emailNotifications: true,
            dailyReminders: true
        });
    } catch (error) {
        console.error('Error al obtener preferencias:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

/**
 * @route   PUT /api/config/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', protect, async (req, res) => {
    try {
        const { theme, emailNotifications, dailyReminders } = req.body;
        
        // TODO: Implementar cuando se cree el modelo de preferencias
        // Guardar en base de datos las preferencias del usuario
        
        res.status(200).json({
            message: 'Preferencias actualizadas exitosamente',
            preferences: {
                theme,
                emailNotifications,
                dailyReminders
            }
        });
    } catch (error) {
        console.error('Error al actualizar preferencias:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

export default router;
