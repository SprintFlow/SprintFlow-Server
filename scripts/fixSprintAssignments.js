// scripts/fixSprintAssignments.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixSprintAssignments = async () => {
  try {
    console.log('🚀 Conectando a MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado');

    const User = mongoose.model('User');
    const Sprint = mongoose.model('Sprint');
    const PointsRegistry = mongoose.model('PointsRegistry');

    // Identificar usuarios reales del equipo
    const realTeamUsers = await User.find({
      name: { $in: ['Guissella', 'Paloma', 'Sofía', 'Valentina', 'Aday', 'Mari Carmen'] }
    });

    console.log(`👥 Equipo real: ${realTeamUsers.map(u => u.name).join(', ')}`);

    // Usuarios a excluir (admins/test)
    const excludedUsers = await User.find({
      name: { $in: ['Mi Nuevo Admin', 'admin', 'Pal'] }
    });

    const excludedUserIds = excludedUsers.map(u => u._id);

    console.log(`🚫 Excluyendo: ${excludedUsers.map(u => u.name).join(', ')}`);

    // 1. ELIMINAR todos los registros de puntos existentes
    console.log('🗑️  Eliminando todos los registros de puntos anteriores...');
    const deletedPoints = await PointsRegistry.deleteMany({});
    console.log(`📝 Eliminados ${deletedPoints.deletedCount} registros de puntos`);

    // 2. ACTUALIZAR asignaciones de usuarios en sprints
    console.log('🔄 Actualizando asignaciones en sprints...');
    const sprints = await Sprint.find({});
    
    let updatedSprints = 0;

    for (const sprint of sprints) {
      // Determinar tamaño de equipo según la fase
      let teamSize;
      if (sprint.name.includes("Fase 1") || sprint.name.includes("Fase 2")) {
        teamSize = 2;
      } else if (sprint.name.includes("Fase 3") || sprint.name.includes("Fase 4") || 
                 sprint.name.includes("Fase 5") || sprint.name.includes("Fase 6")) {
        teamSize = 4;
      } else {
        teamSize = realTeamUsers.length; // Todo el equipo
      }

      // Seleccionar usuarios reales (excluyendo admins)
      const assignedUsers = realTeamUsers.slice(0, teamSize);
      
      // Actualizar asignación en el sprint
      await Sprint.findByIdAndUpdate(sprint._id, {
        usersAssigned: assignedUsers.map(user => ({
          userId: user._id,
          hours: sprint.name.includes("Fase 10") ? 35 : [20, 25, 30][Math.floor(Math.random() * 3)]
        }))
      });

      updatedSprints++;
      console.log(`   ✅ ${sprint.name}: ${assignedUsers.map(u => u.name).join(', ')}`);
    }

    console.log(`🔄 Actualizados ${updatedSprints} sprints`);

    // 3. CREAR NUEVOS registros de puntos solo para usuarios reales
    console.log('📊 Creando nuevos registros de puntos...');
    
    let totalRegistries = 0;

    for (const sprint of sprints) {
      if (sprint.status !== "Planificado") {
        const teamMembers = sprint.usersAssigned || [];
        const registries = [];
        let totalCompleted = 0;

        const completionPercent = sprint.status === "Activo" 
          ? 16  // Fase 10 activa al 16%
          : Math.min(115, Math.max(80, (sprint.completedPoints / sprint.plannedTotalPoints) * 100));

        for (const member of teamMembers) {
          const user = realTeamUsers.find(u => u._id.toString() === member.userId.toString());
          if (!user) continue;

          const performance = getUserPerformance(user.name);
          const basePoints = (sprint.plannedTotalPoints / teamMembers.length) * (completionPercent / 100);
          const variedPoints = basePoints * performance * (0.9 + Math.random() * 0.2);
          const userPoints = Math.max(1, Math.round(variedPoints));
          
          totalCompleted += userPoints;

          registries.push({
            userId: user._id,
            sprintId: sprint._id,
            stories: generateUserStories(userPoints),
            totalPoints: userPoints,
            isInterruption: Math.random() < 0.2,
            registeredAt: generateDate(sprint.startDate, sprint.endDate, sprint.status)
          });
        }

        if (registries.length > 0) {
          await PointsRegistry.insertMany(registries);
          await Sprint.findByIdAndUpdate(sprint._id, { completedPoints: totalCompleted });
          
          const completionRate = Math.round((totalCompleted/sprint.plannedTotalPoints)*100);
          const statusIcon = sprint.status === "Completado" ? "✅" : sprint.status === "Activo" ? "🔵" : "🟡";
          console.log(`   ${statusIcon} ${sprint.name}: ${totalCompleted}/${sprint.plannedTotalPoints} pts (${completionRate}%) - ${registries.length} registros`);
          
          totalRegistries += registries.length;
        }
      }
    }

    console.log('\n🎉 REASIGNACIÓN COMPLETADA!');
    console.log('📊 Resultado:');
    console.log(`   ✅ ${updatedSprints} sprints actualizados`);
    console.log(`   📝 ${totalRegistries} registros de puntos creados`);
    console.log(`   👥 ${realTeamUsers.length} usuarios del equipo real`);
    console.log(`   🚫 ${excludedUsers.length} usuarios excluidos de los registros`);
    
    console.log('\n💡 Ahora los sprints históricos solo muestran puntos del equipo real');

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Funciones auxiliares
const getUserPerformance = (userName) => {
  const performance = {
    'Guissella': 1.15, 'Paloma': 1.10, 'Sofía': 1.05, 
    'Valentina': 1.0, 'Aday': 0.95, 'Mari Carmen': 0.90
  };
  return performance[userName] || 1.0;
};

const generateUserStories = (totalPoints) => {
  const stories = [];
  let remaining = totalPoints;
  const sizes = [0.5, 1, 2, 3, 5, 8];
  
  while (remaining > 0 && stories.length < 6) {
    const available = sizes.filter(size => size <= remaining);
    if (available.length === 0) break;
    const pointValue = available[Math.floor(Math.random() * available.length)];
    stories.push({ pointValue, count: 1, subtotal: pointValue });
    remaining -= pointValue;
  }
  return stories;
};

const generateDate = (startDate, endDate, status) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (status === "Activo") {
    const today = new Date();
    const maxDate = today < end ? today : end;
    const range = maxDate.getTime() - start.getTime();
    return new Date(start.getTime() + Math.random() * range);
  }
  const range = end.getTime() - start.getTime();
  return new Date(start.getTime() + Math.random() * range);
};

fixSprintAssignments();