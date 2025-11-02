// Middleware para actualizar automáticamente el estado de los sprints según las fechas

export const updateSprintStatuses = async (req, res, next) => {
  try {
    const Sprint = req.app.locals.Sprint; // Pasaremos el modelo desde server.js
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Inicio del día

    // Actualizar sprints que deberían estar Activos
    await Sprint.updateMany(
      {
        status: 'Planificado',
        startDate: { $lte: today },
        endDate: { $gte: today }
      },
      { $set: { status: 'Activo' } }
    );

    // Actualizar sprints que deberían estar Completados
    await Sprint.updateMany(
      {
        status: { $in: ['Planificado', 'Activo'] },
        endDate: { $lt: today }
      },
      { $set: { status: 'Completado' } }
    );

    next();
  } catch (error) {
    console.error('❌ Error actualizando estados de sprints:', error);
    next(); // Continuar aunque falle
  }
};

export default updateSprintStatuses;