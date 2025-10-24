import Sprint from "../models/Sprint.js";

// Crear un nuevo sprint
export const createSprint = async (req, res) => {
  try {
    const sprint = await Sprint.create(req.body);
    res.status(201).json(sprint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todos los sprints
export const getAllSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find().sort({ startDate: -1 });
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un sprint por ID
export const getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
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
