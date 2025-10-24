import Completion from '../models/Completion.js';
import Sprint from '../models/Sprint.js'; // Necesario para la vista de análisis
import mongoose from 'mongoose';

// Función utilitaria para validar si un ID de MongoDB es válido
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ==========================================================
// 1. POST /api/completions (Crear o Actualizar la Finalización Individual)
// Implementa la funcionalidad de "rellenar la foto finish" por cada usuario [1].
// ==========================================================
export const createOrUpdateCompletion = async (req, res) => {
  // En un sistema real, el userId debería ser extraído del token de sesión para seguridad.
  const { sprintId, userId, completedStories } = req.body; 
  
  if (!sprintId || !userId || !completedStories || !Array.isArray(completedStories)) {
    return res.status(400).json({ message: "Datos de finalización incompletos o inválidos." });
  }

  if (!isValidObjectId(sprintId) || !isValidObjectId(userId)) {
      return res.status(400).json({ message: "IDs de Sprint o Usuario inválidos." });
  }

  try {
    // 1. Calcular los puntos totales obtenidos por este usuario (totalAchievedPoints)
    // Esto asegura que el valor se almacena y facilita la suma de la velocidad total del equipo.
    const totalAchievedPoints = completedStories.reduce((sum, item) => 
      sum + (item.score * (item.completedCount || 0)), 
    0);
    
    // 2. Usar findOneAndUpdate con upsert: true para manejar la creación (si es el primer reporte)
    // o la actualización (si el usuario modifica su reporte).
    const completion = await Completion.findOneAndUpdate(
      { sprintId, userId },
      { completedStories, totalAchievedPoints },
      { 
        upsert: true, 
        new: true,    
        runValidators: true 
      }
    );
    
    // Status 200: Éxito
    res.status(200).json(completion);

  } catch (error) {
    console.error('Error al registrar/actualizar la finalización:', error);
    res.status(500).json({ 
        message: 'Error interno del servidor al procesar la finalización.', 
        error: error.message 
    });
  }
};

// ==========================================================
// 2. GET /api/completions/sprint/:sprintId (Obtener Todos los Resultados del Equipo)
// Usado por el Scrum Master (Admin) o el frontend (Zustand) para calcular la Velocidad Obtenida [2, 3].
// ==========================================================
export const getCompletionsBySprint = async (req, res) => {
  const { sprintId } = req.params;

  if (!isValidObjectId(sprintId)) {
    return res.status(400).json({ message: "ID de Sprint inválido." });
  }

  try {
    // 1. Obtener los puntos planificados por el Scrum Master para comparación
    const sprintPlan = await Sprint.findById(sprintId, 'totalPlannedPoints name').lean();
    if (!sprintPlan) {
        return res.status(404).json({ message: "Sprint no encontrado." });
    }

    // 2. Obtener todos los registros de finalización individual
    const completions = await Completion.find({ sprintId }).lean();

    // 3. Sumar los puntos obtenidos por todo el equipo
    const totalTeamAchievedPoints = completions.reduce((sum, c) => sum + c.totalAchievedPoints, 0);

    // 4. Devolver los resultados, listos para que el cliente haga la comparación de velocidad (Planificado vs. Obtenido)
    res.status(200).json({
        sprintName: sprintPlan.name,
        totalPlannedPoints: sprintPlan.totalPlannedPoints, // Velocidad Esperada
        totalTeamAchievedPoints: totalTeamAchievedPoints, // Velocidad Obtenida
        individualCompletions: completions,
    });

  } catch (error) {
    console.error('Error al obtener finalizaciones por Sprint:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};

// ==========================================================
// 3. GET /api/completions/sprint/:sprintId/user/:userId (Obtener Resultado Individual)
// ==========================================================
export const getCompletionByUser = async (req, res) => {
  const { sprintId, userId } = req.params;

  if (!isValidObjectId(sprintId) || !isValidObjectId(userId)) {
    return res.status(400).json({ message: "IDs de Sprint o Usuario inválidos." });
  }

  try {
    const completion = await Completion.findOne({ sprintId, userId }).lean();

    if (!completion) {
      return res.status(404).json({ message: "Registro de finalización no encontrado para este usuario en el Sprint." });
    }

    res.status(200).json(completion);

  } catch (error) {
    console.error('Error al obtener finalización por usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};

// ==========================================================
// 4. DELETE /api/completions/:id (Eliminar Registro)
// Debe ser una función restringida, probablemente solo para el Scrum Master/Admin.
// ==========================================================
export const deleteCompletion = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: "ID de registro de finalización inválido." });
  }

  try {
    const result = await Completion.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: "Registro de finalización no encontrado." });
    }

    res.status(200).json({ message: "Registro de finalización eliminado correctamente." });

  } catch (error) {
    console.error('Error al eliminar el registro de finalización:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};