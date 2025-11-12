import express from "express";
import PointsRegistryModel from '../models/PointsRegistryModel.js';
import Completion from '../models/Completion.js';
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/completions
 * @desc    Crear o actualizar una completion (solo usuario autenticado)
 * @access  Private
 */
router.post("/", protect, async (req, res) => {
  try {
    const { sprintId, completedStories, notes } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!sprintId || !userId) {
      return res.status(400).json({ message: "Faltan sprintId o userId" });
    }

    // Calcula total de puntos logrados
    const totalAchievedPoints = (completedStories || []).reduce(
      (acc, e) => acc + e.score * e.completedCount,
      0
    );

    // findOneAndUpdate con upsert (crea si no existe)
    const completion = await Completion.findOneAndUpdate(
      { sprintId, userId },
      { completedStories, totalAchievedPoints, notes },
      { new: true, upsert: true, runValidators: true }
    ).populate("sprintId userId", "name email");

    res.status(200).json({
      message: "Registro de resultado actualizado correctamente",
      completion,
    });
  } catch (error) {
    console.error("Error al crear o actualizar completion:", error);
    res.status(500).json({ message: "Error del servidor al registrar el resultado" });
  }
});

/**
 * @route   GET /api/completions/sprint/:sprintId
 * @desc    Obtener todas las completions de un sprint - SISTEMA UNIFICADO
 * @access  Private
 */
router.get("/sprint/:sprintId", protect, async (req, res) => {
  try {
    const { sprintId } = req.params;
    
    console.log('🎯 [UNIFICADO] Buscando datos para sprint:', sprintId);

    // 1. BUSCAR EN COMPLETION MODEL (sistema antiguo)
    const completionsFromCompletionModel = await Completion.find({ sprintId })
      .populate("userId", "name email")
      .sort({ updatedAt: -1 });

    console.log(`📁 [COMPLETION] Encontrados: ${completionsFromCompletionModel.length} registros`);

    // 2. BUSCAR EN POINTS REGISTRY (sistema nuevo - donde registran los usuarios)
    const pointsRegistries = await PointsRegistryModel.find({ sprintId })
      .populate('userId', 'name email')
      .sort({ registeredAt: -1 });

    console.log(`📊 [POINTS-REGISTRY] Encontrados: ${pointsRegistries.length} registros`);

    // DEBUG: Mostrar qué usuarios tienen registros
    pointsRegistries.forEach((registry, index) => {
      console.log(`   👤 Usuario ${index + 1}: ${registry.userId?.name} - ${registry.totalPoints} puntos`);
    });

    // 3. TRANSFORMAR PointsRegistry → Formato Completion
    const completionsFromPointsRegistry = pointsRegistries.map(registry => {
      const completedStories = registry.stories.map(story => ({
        score: story.pointValue,
        completedCount: story.count,
        points: story.pointValue * story.count
      }));

      return {
        _id: registry._id,
        userId: registry.userId,
        sprintId: registry.sprintId,
        totalAchievedPoints: registry.totalPoints,
        completedStories: completedStories,
        notes: registry.isInterruption ? 'Interrupción' : 'Completado normal',
        updatedAt: registry.registeredAt || registry.createdAt,
        createdAt: registry.createdAt,
        _source: 'points-registry' // Para identificar la fuente
      };
    });

    // 4. COMBINAR AMBAS FUENTES (evitar duplicados por usuario)
    const combinedCompletions = [...completionsFromCompletionModel];
    
    completionsFromPointsRegistry.forEach(registryCompletion => {
      const userExists = combinedCompletions.some(
        comp => comp.userId?._id?.toString() === registryCompletion.userId?._id?.toString()
      );
      
      if (!userExists) {
        combinedCompletions.push(registryCompletion);
      } else {
        console.log(`ℹ️ Usuario ${registryCompletion.userId.name} ya existe en completion, omitiendo duplicado`);
      }
    });

    // 5. CALCULAR ESTADÍSTICAS
    const totalPoints = combinedCompletions.reduce((sum, c) => sum + (c.totalAchievedPoints || 0), 0);
    const uniqueUsers = [...new Set(combinedCompletions.map(c => c.userId?._id?.toString()).filter(Boolean))].length;

    console.log(`✅ [RESULTADO] Total: ${combinedCompletions.length} completions, ${totalPoints} puntos, ${uniqueUsers} usuarios`);

    // 6. ENVIAR RESPUESTA EN EL FORMATO QUE ESPERA EL FRONTEND
    res.status(200).json({
      success: true,
      sprintId,
      totalRealPoints: totalPoints,
      totalUsers: uniqueUsers,
      completions: combinedCompletions,
      metadata: {
        fromCompletion: completionsFromCompletionModel.length,
        fromPointsRegistry: pointsRegistries.length,
        combined: combinedCompletions.length,
        source: 'unified-system'
      }
    });

  } catch (error) {
    console.error('❌ [ERROR] En getCompletionsBySprint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener los completions del sprint',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/completions/sprint/:sprintId/user/:userId
 * @desc    Obtener la completion de un usuario en un sprint
 * @access  Private
 */
router.get("/sprint/:sprintId/user/:userId", protect, async (req, res) => {
  try {
    const { sprintId, userId } = req.params;
    
    // 1. Buscar en Completion model primero
    let completion = await Completion.findOne({ sprintId, userId })
      .populate("userId", "name email");

    // 2. Si no existe, buscar en PointsRegistry
    if (!completion) {
      const pointsRegistry = await PointsRegistryModel.findOne({ sprintId, userId })
        .populate('userId', 'name email');

      if (pointsRegistry) {
        // Transformar a formato completion
        const completedStories = pointsRegistry.stories.map(story => ({
          score: story.pointValue,
          completedCount: story.count,
          points: story.pointValue * story.count
        }));

        completion = {
          _id: pointsRegistry._id,
          userId: pointsRegistry.userId,
          sprintId: pointsRegistry.sprintId,
          totalAchievedPoints: pointsRegistry.totalPoints,
          completedStories: completedStories,
          notes: pointsRegistry.isInterruption ? 'Interrupción' : 'Completado normal',
          updatedAt: pointsRegistry.registeredAt,
          createdAt: pointsRegistry.createdAt,
          _source: 'points-registry'
        };
      }
    }

    if (!completion) {
      return res.status(404).json({ message: "No hay registro de resultados" });
    }

    res.status(200).json(completion);
  } catch (error) {
    console.error("Error al obtener completion de usuario:", error);
    res.status(500).json({
      message: "Error del servidor al obtener resultados del usuario",
    });
  }
});

/**
 * @route   DELETE /api/completions/:id
 * @desc    Eliminar una completion (solo admin)
 * @access  Private/Admin
 */
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Completion.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    res.status(200).json({ message: "Registro de resultado eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar completion:", error);
    res.status(500).json({ message: "Error del servidor al eliminar el resultado" });
  }
});

export default router;