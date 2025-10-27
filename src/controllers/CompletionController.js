import Completion from "../models/Completion.js";
import Sprint from "../models/Sprint.js";

/**
 * @desc    Crear o actualizar el resultado de un usuario (foto finish)
 * @route   POST /api/completions
 * @access  Private
 */
export const createOrUpdateCompletion = async (req, res) => {
  try {
    const { sprintId, completedStories, notes } = req.body;
    const userId = req.user?._id || req.body.userId; // Fallback si no hay auth

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
    res
      .status(500)
      .json({ message: "Error del servidor al registrar el resultado" });
  }
};

/**
 * @desc    Obtener todos los resultados de un sprint
 * @route   GET /api/completions/sprint/:sprintId
 * @access  Private
 */
export const getCompletionsBySprint = async (req, res) => {
  try {
    const { sprintId } = req.params;
    if (!sprintId) {
      return res.status(400).json({ message: "Falta sprintId en la ruta" });
    }

    // Buscar todos los completions asociados al sprint
    const completions = await Completion.find({ sprintId })
      .populate("userId", "name email")
      .sort({ updatedAt: -1 });

    // Calcular total general del sprint (sumatorio de todos los usuarios)
    const totalRealPoints = completions.reduce(
      (acc, c) => acc + (c.totalAchievedPoints || 0),
      0
    );

    res.status(200).json({
      sprintId,
      totalRealPoints,
      totalUsers: completions.length,
      completions,
    });
  } catch (error) {
    console.error("Error al obtener completions por sprint:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al obtener los resultados" });
  }
};

/**
 * @desc    Obtener resultados de un usuario específico en un sprint
 * @route   GET /api/completions/sprint/:sprintId/user/:userId
 * @access  Private
 */
export const getCompletionByUser = async (req, res) => {
  try {
    const { sprintId, userId } = req.params;
    const completion = await Completion.findOne({ sprintId, userId }).populate(
      "userId",
      "name email"
    );

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
};

/**
 * @desc    Eliminar un registro de resultados (por admin)
 * @route   DELETE /api/completions/:id
 * @access  Private/Admin
 */
export const deleteCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Completion.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Registro no encontrado" });

    res
      .status(200)
      .json({ message: "Registro de resultado eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar completion:", error);
    res
      .status(500)
      .json({ message: "Error del servidor al eliminar el resultado" });
  }
};
