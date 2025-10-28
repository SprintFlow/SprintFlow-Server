import Sprint from "../models/Sprint.js";

// Puntos permitidos según Fibonacci
const fibonacciPoints = [0.5, 1, 2, 3, 5, 8, 13, 21, 34];

// ------------------------
// Crear un nuevo sprint
// ------------------------
export const createSprint = async (req, res) => {
  try {
    const { plannedStories } = req.body;

    // Validación Fibonacci
    for (const story of plannedStories || []) {
      if (!fibonacciPoints.includes(story.score)) {
        return res.status(400).json({
          message: `Story score ${story.score} is not allowed (must be Fibonacci)`,
        });
      }
    }

    const sprint = await Sprint.create({
      ...req.body,
      adminId: req.user._id, // garantiza que el creador sea admin
    });

    res.status(201).json(sprint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ------------------------
// Obtener todos los sprints
// ------------------------
export const getAllSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find()
      .sort({ startDate: -1 })
      .populate("usersAssigned.userId", "name email");
    res.json(sprints);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sprints", error: error.message });
  }
};

// ------------------------
// Obtener un sprint por ID
// ------------------------
export const getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id).populate(
      "usersAssigned.userId",
      "name email"
    );
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json(sprint);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sprint", error: error.message });
  }
};

// ------------------------
// Actualizar un sprint
// ------------------------
export const updateSprint = async (req, res) => {
  try {
    const { plannedStories } = req.body;

    // Validación Fibonacci
    for (const story of plannedStories || []) {
      if (!fibonacciPoints.includes(story.score)) {
        return res.status(400).json({
          message: `Story score ${story.score} is not allowed (must be Fibonacci)`,
        });
      }
    }

    const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("usersAssigned.userId", "name email");

    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    res.json(sprint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ------------------------
// Eliminar un sprint
// ------------------------
export const deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndDelete(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json({ message: "Sprint deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
