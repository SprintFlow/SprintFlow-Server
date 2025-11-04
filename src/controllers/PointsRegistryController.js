import PointsRegistry from '../models/PointsRegistryModel.js';
import Sprint from '../models/Sprint.js';
import User from '../models/UserModel.js';

// === CREAR NUEVO REGISTRO DE PUNTOS ===
export const createPointsRegistry = async (req, res) => {
    try {
        const { userId, sprintId, stories, totalPoints, isInterruption, registeredAt } = req.body;

        // Validar que el usuario autenticado sea el mismo que está registrando puntos
        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ 
                message: 'No tienes permiso para registrar puntos de otro usuario' 
            });
        }

        // Verificar que el sprint existe y está activo
        const sprint = await Sprint.findById(sprintId);
        if (!sprint) {
            return res.status(404).json({ message: 'Sprint no encontrado' });
        }

        if (sprint.status !== 'Activo') {
            return res.status(400).json({ 
                message: 'Solo puedes registrar puntos en sprints activos' 
            });
        }

        // Crear el registro
        const registry = new PointsRegistry({
            userId,
            sprintId,
            stories,
            totalPoints,
            isInterruption,
            registeredAt: registeredAt || new Date()
        });

        await registry.save();

        // Actualizar los puntos del usuario en el sprint
        const userPointIndex = sprint.userPoints.findIndex(
            up => up.userId.toString() === userId
        );

        if (userPointIndex !== -1) {
            sprint.userPoints[userPointIndex].points += totalPoints;
        } else {
            sprint.userPoints.push({
                userId,
                points: totalPoints
            });
        }

        // Actualizar puntos completados del sprint
        sprint.completedPoints = (sprint.completedPoints || 0) + totalPoints;

        await sprint.save();

        // Actualizar puntos totales del usuario (opcional)
        await User.findByIdAndUpdate(userId, {
            $inc: { totalPoints: totalPoints }
        });

        res.status(201).json(registry);
    } catch (error) {
        console.error('Error creating points registry:', error);
        res.status(500).json({ 
            message: 'Error al crear el registro de puntos',
            error: error.message 
        });
    }
};

// === OBTENER REGISTROS DE UN USUARIO EN UN SPRINT ESPECÍFICO ===
export const getUserSprintRegistries = async (req, res) => {
    try {
        const { userId, sprintId } = req.params;

        // Validar permisos (usuario puede ver sus propios registros o admin puede ver todos)
        if (req.user._id.toString() !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ 
                message: 'No tienes permiso para ver estos registros' 
            });
        }

        const registries = await PointsRegistry.find({ userId, sprintId })
            .sort({ registeredAt: -1 })
            .populate('userId', 'name email')
            .populate('sprintId', 'name startDate endDate');

        res.json(registries);
    } catch (error) {
        console.error('Error fetching registries:', error);
        res.status(500).json({ 
            message: 'Error al obtener registros',
            error: error.message 
        });
    }
};

// === OBTENER TODOS LOS REGISTROS DE UN SPRINT (ADMIN/SCRUM MASTER) ===
export const getSprintRegistries = async (req, res) => {
    try {
        const { sprintId } = req.params;

        // Solo admin o scrum master pueden ver todos los registros
        if (req.user.role !== 'Admin' && req.user.role !== 'Scrum Master') {
            return res.status(403).json({ 
                message: 'No tienes permiso para ver todos los registros' 
            });
        }

        const registries = await PointsRegistry.find({ sprintId })
            .sort({ registeredAt: -1 })
            .populate('userId', 'name email')
            .populate('sprintId', 'name startDate endDate');

        res.json(registries);
    } catch (error) {
        console.error('Error fetching sprint registries:', error);
        res.status(500).json({ 
            message: 'Error al obtener registros del sprint',
            error: error.message 
        });
    }
};

// === OBTENER TODOS LOS REGISTROS DE UN USUARIO (HISTORIAL COMPLETO) ===
export const getUserRegistries = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validar permisos
        if (req.user._id.toString() !== userId && req.user.role !== 'Admin') {
            return res.status(403).json({ 
                message: 'No tienes permiso para ver estos registros' 
            });
        }

        const registries = await PointsRegistry.find({ userId })
            .sort({ registeredAt: -1 })
            .populate('sprintId', 'name startDate endDate');

        res.json(registries);
    } catch (error) {
        console.error('Error fetching user registries:', error);
        res.status(500).json({ 
            message: 'Error al obtener registros del usuario',
            error: error.message 
        });
    }
};

// === ELIMINAR UN REGISTRO (ADMIN O EL MISMO USUARIO) ===
export const deletePointsRegistry = async (req, res) => {
    try {
        const registry = await PointsRegistry.findById(req.params.id);

        if (!registry) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        // Validar permisos
        if (registry.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
            return res.status(403).json({ 
                message: 'No tienes permiso para eliminar este registro' 
            });
        }

        // Restar los puntos del sprint
        const sprint = await Sprint.findById(registry.sprintId);
        if (sprint) {
            const userPointIndex = sprint.userPoints.findIndex(
                up => up.userId.toString() === registry.userId.toString()
            );

            if (userPointIndex !== -1) {
                sprint.userPoints[userPointIndex].points -= registry.totalPoints;
            }

            sprint.completedPoints = (sprint.completedPoints || 0) - registry.totalPoints;
            await sprint.save();
        }

        // Restar puntos del usuario
        await User.findByIdAndUpdate(registry.userId, {
            $inc: { totalPoints: -registry.totalPoints }
        });

        await registry.deleteOne();

        res.json({ message: 'Registro eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting registry:', error);
        res.status(500).json({ 
            message: 'Error al eliminar el registro',
            error: error.message 
        });
    }
};