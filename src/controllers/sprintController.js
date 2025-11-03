import Sprint from "../models/Sprint.js";

// Crear un nuevo sprint
export const createSprint = async (req, res) => {
  try {
    console.log("📝 Creando sprint...");
    const sprintData = {
      ...req.body,
      adminId: req.user._id
    };
    const sprint = await Sprint.create(sprintData);
    console.log("✅ Sprint creado:", sprint._id);
    res.status(201).json(sprint);
  } catch (error) {
    console.error("❌ Error al crear sprint:", error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Obtener todos los sprints CON populate
export const getAllSprints = async (req, res) => {
  try {
    console.log("📋 Obteniendo sprints...");
    const sprints = await Sprint.find()
      .populate('usersAssigned.userId', 'name email role')
      .sort({ startDate: -1 });
    console.log(`✅ Sprints encontrados: ${sprints.length}`);
    res.json(sprints);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Obtener sprint por ID CON populate
export const getSprintById = async (req, res) => {
  try {
    console.log("🔍 Buscando sprint:", req.params.id);
    const sprint = await Sprint.findById(req.params.id)
      .populate('usersAssigned.userId', 'name email role');
    if (!sprint) {
      return res.status(404).json({ message: "Sprint no encontrado" });
    }
    console.log("✅ Sprint encontrado:", sprint.name);
    res.json(sprint);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Actualizar sprint
export const updateSprint = async (req, res) => {
  try {
    console.log("📝 Actualizando sprint:", req.params.id);
    console.log("📦 Datos recibidos:", req.body);
    
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('usersAssigned.userId', 'name email role');
    
    if (!sprint) {
      return res.status(404).json({ message: "Sprint no encontrado" });
    }
    console.log("✅ Sprint actualizado:", sprint.name);
    res.json(sprint);
  } catch (error) {
    console.error("❌ Error al actualizar:", error);
    res.status(400).json({ message: error.message });
  }
};

// Eliminar sprint
export const deleteSprint = async (req, res) => {
  try {
    console.log("🗑️ Eliminando sprint:", req.params.id);
    const sprint = await Sprint.findByIdAndDelete(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint no encontrado" });
    }
    console.log("✅ Sprint eliminado:", sprint.name);
    res.json({ message: "Sprint eliminado exitosamente" });
  } catch (error) {
    console.error("❌ Error al eliminar:", error);
    res.status(500).json({ message: error.message });
  }
};