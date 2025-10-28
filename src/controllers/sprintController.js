import Sprint from "../models/Sprint.js";

// Crear un nuevo sprint
export const createSprint = async (req, res) => {
  try {
    console.log("📝 Creando sprint...");
    console.log("📦 Body recibido:", req.body);
    console.log("👤 Usuario:", req.user);

    // ✅ CRÍTICO: Añadir adminId automáticamente
    const sprintData = {
      ...req.body,
      adminId: req.user._id
    };

    console.log("💾 Guardando sprint con adminId:", sprintData.adminId);

    const sprint = await Sprint.create(sprintData);
    
    console.log("✅ Sprint creado exitosamente:", sprint._id);
    
    res.status(201).json(sprint);
  } catch (error) {
    console.error("❌ Error al crear sprint:", error);
    res.status(400).json({ message: error.message });
  }
};

// Obtener todos los sprints
export const getAllSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find()
      .populate('adminId', 'name email')
      .populate('usersAssigned.userId', 'name email role')
      .sort({ startDate: -1 });
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un sprint por ID
export const getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      .populate('adminId', 'name email')
      .populate('usersAssigned.userId', 'name email role');
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar un sprint
export const updateSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json(sprint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar un sprint
export const deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json({ message: "Sprint deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
