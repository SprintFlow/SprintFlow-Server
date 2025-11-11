import PointsRegistry from "../models/PointsRegistryModel.js";
import Sprint from "../models/Sprint.js";
import User from "../models/UserModel.js";
import { calculateSprintStatus, updateSprintStatus } from "../utils/sprintStatusHelper.js";

// === CREAR NUEVO REGISTRO DE PUNTOS ===
export const createPointsRegistry = async (req, res) => {
  try {
    const { userId, sprintId, stories, totalPoints, isInterruption, registeredAt } = req.body;

    console.log("🔍 Datos recibidos en backend:", {
      userId, sprintId, stories, totalPoints, isInterruption
    });

    // 🔒 Validar usuario autenticado
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        message: "No tienes permiso para registrar puntos de otro usuario"
      });
    }

    // 📅 Verificar sprint existente
    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint no encontrado" });
    }

    console.log("📊 Estado actual del sprint:", sprint.status);
    console.log("📆 Fechas:", {
      start: sprint.startDate,
      end: sprint.endDate,
      today: new Date()
    });

    // ✅ Actualizar estado automáticamente antes de registrar
    const currentStatus = await updateSprintStatus(sprintId);
    console.log("🎯 Estado actualizado:", currentStatus);

    const updatedSprint = await Sprint.findById(sprintId);
    if (updatedSprint.status !== "Activo") {
      return res.status(400).json({
        message: "Solo puedes registrar puntos en sprints activos",
        currentStatus: updatedSprint.status,
        requiredStatus: "Activo",
        dates: {
          start: updatedSprint.startDate,
          end: updatedSprint.endDate,
          today: new Date()
        }
      });
    }

    // 📝 Crear el nuevo registro
    const registry = new PointsRegistry({
      userId,
      sprintId,
      stories,
      totalPoints,
      isInterruption: !!isInterruption,
      registeredAt: registeredAt || new Date()
    });
    await registry.save();

    // 🧩 Actualizar sprint
    if (!updatedSprint.userPoints) updatedSprint.userPoints = [];

    const userPointIndex = updatedSprint.userPoints.findIndex(
      up => up.userId?.toString() === userId
    );

    if (userPointIndex !== -1) {
      updatedSprint.userPoints[userPointIndex].points += totalPoints;
    } else {
      updatedSprint.userPoints.push({ userId, points: totalPoints });
    }

    updatedSprint.completedPoints = (updatedSprint.completedPoints || 0) + totalPoints;
    await updatedSprint.save();

    // 👤 Actualizar puntos del usuario
    await User.findByIdAndUpdate(userId, { $inc: { totalPoints } });

    console.log("✅ Registro creado exitosamente:", registry._id);
    res.status(201).json(registry);

  } catch (error) {
    console.error("❌ Error creando registro de puntos:", error);
    res.status(500).json({
      message: "Error al crear el registro de puntos",
      error: error.message
    });
  }
};

// === OBTENER REGISTROS DE UN USUARIO EN UN SPRINT ===
export const getUserSprintRegistries = async (req, res) => {
  try {
    const { userId, sprintId } = req.params;

    if (req.user._id.toString() !== userId && req.user.role !== "Admin") {
      return res.status(403).json({ message: "No tienes permiso para ver estos registros" });
    }

    const registries = await PointsRegistry.find({ userId, sprintId })
      .sort({ registeredAt: -1 })
      .populate("userId", "name email")
      .populate("sprintId", "name startDate endDate status");

    res.json(registries);

  } catch (error) {
    console.error("❌ Error obteniendo registros del sprint:", error);
    res.status(500).json({
      message: "Error al obtener registros",
      error: error.message
    });
  }
};

// === OBTENER TODOS LOS REGISTROS DE UN SPRINT (ADMIN / SCRUM MASTER) ===
export const getSprintRegistries = async (req, res) => {
  try {
    const { sprintId } = req.params;

    if (!["Admin", "Scrum Master"].includes(req.user.role)) {
      return res.status(403).json({
        message: "No tienes permiso para ver todos los registros"
      });
    }

    const registries = await PointsRegistry.find({ sprintId })
      .sort({ registeredAt: -1 })
      .populate("userId", "name email")
      .populate("sprintId", "name startDate endDate status");

    res.json(registries);

  } catch (error) {
    console.error("❌ Error obteniendo registros del sprint:", error);
    res.status(500).json({
      message: "Error al obtener registros del sprint",
      error: error.message
    });
  }
};

// === OBTENER HISTORIAL COMPLETO DE UN USUARIO ===
export const getUserRegistries = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && req.user.role !== "Admin") {
      return res.status(403).json({
        message: "No tienes permiso para ver estos registros"
      });
    }

    const registries = await PointsRegistry.find({ userId })
      .sort({ registeredAt: -1 })
      .populate("sprintId", "name startDate endDate status");

    res.json(registries);

  } catch (error) {
    console.error("❌ Error obteniendo registros del usuario:", error);
    res.status(500).json({
      message: "Error al obtener registros del usuario",
      error: error.message
    });
  }
};

// === ELIMINAR REGISTRO (ADMIN o PROPIO USUARIO) ===
export const deletePointsRegistry = async (req, res) => {
  try {
    const registry = await PointsRegistry.findById(req.params.id);
    if (!registry) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    if (registry.userId.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
      return res.status(403).json({
        message: "No tienes permiso para eliminar este registro"
      });
    }

    // 🧩 Actualizar Sprint
    const sprint = await Sprint.findById(registry.sprintId);
    if (sprint) {
      if (!sprint.userPoints) sprint.userPoints = [];

      const userPointIndex = sprint.userPoints.findIndex(
        up => up.userId?.toString() === registry.userId.toString()
      );

      if (userPointIndex !== -1) {
        sprint.userPoints[userPointIndex].points -= registry.totalPoints;
        if (sprint.userPoints[userPointIndex].points < 0)
          sprint.userPoints[userPointIndex].points = 0;
      }

      sprint.completedPoints = Math.max(0, (sprint.completedPoints || 0) - registry.totalPoints);
      await sprint.save();
    }

    // 👤 Actualizar puntos del usuario
    await User.findByIdAndUpdate(registry.userId, {
      $inc: { totalPoints: -registry.totalPoints }
    });

    await registry.deleteOne();

    res.json({ message: "Registro eliminado exitosamente" });

  } catch (error) {
    console.error("❌ Error eliminando registro:", error);
    res.status(500).json({
      message: "Error al eliminar el registro",
      error: error.message
    });
  }
};
