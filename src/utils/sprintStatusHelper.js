export const calculateSprintStatus = (sprint) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a inicio del día
    
    const startDate = new Date(sprint.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(sprint.endDate);
    endDate.setHours(0, 0, 0, 0);

    // Calcular estado basado en fechas
    let status;
    if (today < startDate) {
        status = "Planificado";
    } else if (today >= startDate && today <= endDate) {
        status = "Activo";
    } else {
        status = "Completado";
    }
    
    // Si está completado, verificar si alcanzó los puntos planificados
    if (status === "Completado") {
        const plannedPoints = sprint.plannedTotalPoints || 0;
        const completedPoints = sprint.completedPoints || 0;
        
        if (plannedPoints > 0 && completedPoints < plannedPoints) {
            return "Completado Parcial";
        }
    }
    
    return status;
};

export const updateSprintStatus = async (sprintId) => {
    try {
        const Sprint = await import('../models/Sprint.js').then(mod => mod.default);
        const sprint = await Sprint.findById(sprintId);
        
        if (!sprint) {
            console.log('❌ Sprint no encontrado:', sprintId);
            return null;
        }

        const newStatus = calculateSprintStatus(sprint);
        
        if (sprint.status !== newStatus) {
            await Sprint.findByIdAndUpdate(sprintId, { status: newStatus });
            console.log(`✅ Sprint "${sprint.name}" actualizado: ${sprint.status} → ${newStatus}`);
            return newStatus;
        }
        
        return sprint.status;
    } catch (error) {
        console.error('❌ Error actualizando estado del sprint:', error);
        return null;
    }
};