import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar rutas ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar modelos con rutas correctas
const importModels = async () => {
  const modelsPath = join(__dirname, '../src/models');
  
  const SprintModule = await import(join(modelsPath, 'Sprint.js'));
  const PointsRegistryModule = await import(join(modelsPath, 'PointsRegistryModel.js')); 
  const UserModule = await import(join(modelsPath, 'UserModel.js'));
  
  return {
    Sprint: SprintModule.default,
    PointsRegistry: PointsRegistryModule.default,
    User: UserModule.default
  };
};

const organizeProjectHistorySprints = async () => {
  try {
    console.log('🚀 Iniciando población de datos históricos...');

    // Conectar a MongoDB
    await mongoose.connect('mongodb://localhost:27017/sprintflow');
    console.log('✅ Conectado a MongoDB');

    // Importar modelos
    const { Sprint, PointsRegistry, User } = await importModels();
    
    const users = await User.find({});
    console.log(`👥 Equipo encontrado: ${users.map(u => u.name).join(', ')}`);

    // HISTORIA REAL DEL DESARROLLO DE SPRINTFLOW
    const projectHistorySprints = [
      // ✅ FASE 1: FUNDACIONES (Septiembre - Completado)
      {
        name: "Fase 1 - Arquitectura y Auth",
        startDate: new Date("2025-09-04"),
        endDate: new Date("2025-09-08"),
        plannedPoints: 25,
        targetCompletion: 28,
        status: "Completado",
        observations: "Setup inicial del proyecto. Backend con Express/MongoDB. Sistema de autenticación JWT. Roles admin/user."
      },
      {
        name: "Fase 2 - Modelos y API Core",
        startDate: new Date("2025-09-11"),
        endDate: new Date("2025-09-15"),
        plannedPoints: 30,
        targetCompletion: 27,
        status: "Completado Parcial",
        observations: "Modelos User, Sprint, PointsRegistry. APIs básicas. Algunos endpoints necesitan refinamiento."
      },

      // ✅ FASE 2: FRONTEND BASICO (Septiembre - Completado)
      {
        name: "Fase 3 - Frontend React",
        startDate: new Date("2025-09-18"),
        endDate: new Date("2025-09-22"),
        plannedPoints: 35,
        targetCompletion: 38,
        status: "Completado",
        observations: "Setup Vite + React. Routing con React Router. Componentes base con Material-UI. Conexión API."
      },
      {
        name: "Fase 4 - Dashboard Usuario",
        startDate: new Date("2025-09-25"),
        endDate: new Date("2025-09-29"),
        plannedPoints: 32,
        targetCompletion: 29,
        status: "Completado Parcial",
        observations: "Dashboard de usuario funcional. Registro de puntos diario. Pequeños bugs en el cálculo de puntos."
      },

      // ✅ FASE 3: ADMIN Y GESTIÓN (Octubre - Completado)
      {
        name: "Fase 5 - Panel Administración",
        startDate: new Date("2025-10-02"),
        endDate: new Date("2025-10-06"),
        plannedPoints: 40,
        targetCompletion: 42,
        status: "Completado",
        observations: "CRUD completo de sprints. Asignación de usuarios. Vista detalle de sprint con métricas."
      },
      {
        name: "Fase 6 - Integración Completions",
        startDate: new Date("2025-10-09"),
        endDate: new Date("2025-10-13"),
        plannedPoints: 28,
        targetCompletion: 24,
        status: "Completado Parcial",
        observations: "Sistema de completions unificado. Conexión PointsRegistry con vistas admin. Algunas métricas pendientes."
      },

      // 🟡 FASE 4: ANALITICAS (Octubre - Recién Completado)
      {
        name: "Fase 7 - Análisis y Reportes",
        startDate: new Date("2025-10-16"),
        endDate: new Date("2025-10-20"),
        plannedPoints: 45,
        targetCompletion: 48,
        status: "Completado",
        observations: "Página de Results completa. Gráficos comparativos. Filtros por tiempo. Exportación CSV."
      },
      {
        name: "Fase 8 - Mejoras UX",
        startDate: new Date("2025-10-23"),
        endDate: new Date("2025-10-27"),
        plannedPoints: 30,
        targetCompletion: 26,
        status: "Completado Parcial", 
        observations: "Modo oscuro implementado. Responsive design mejorado. Loading states y feedback visual."
      },

      // 🔵 FASE 5: OPTIMIZACION (ACTUAL - Noviembre)
      {
        name: "Fase 9 - Testing y Bugs",
        startDate: new Date("2025-10-30"),
        endDate: new Date("2025-11-05"),
        plannedPoints: 35,
        targetCompletion: 32,
        status: "Completado Parcial",
        observations: "Fix de bugs críticos. Mejora en sincronización de puntos. Preparación para demo final."
      },
      {
        name: "Fase 10 - Demo y Documentación",
        startDate: new Date("2025-11-06"),
        endDate: new Date("2025-11-12"),
        plannedPoints: 25,
        targetCompletion: 12,
        status: "Activo",
        observations: "Preparación para presentación final. Documentación técnica. Tests finales y optimizaciones."
      }
    ];

    console.log(`\n📅 Procesando ${projectHistorySprints.length} fases del proyecto...`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const sprintData of projectHistorySprints) {
      let sprint = await Sprint.findOne({ name: sprintData.name });
      
      if (!sprint) {
        sprint = new Sprint({
          name: sprintData.name,
          startDate: sprintData.startDate,
          endDate: sprintData.endDate,
          adminId: users[0]._id, // Usar Guissella como admin
          plannedStories: generatePhaseStories(sprintData.plannedPoints, sprintData.name),
          plannedTotalPoints: sprintData.plannedPoints,
          usersAssigned: generateTeamAssignment(users, sprintData.name),
          observations: sprintData.observations,
          status: sprintData.status,
          completedPoints: 0
        });
        console.log(`   🆕 CREADO: ${sprintData.name}`);
        createdCount++;
      } else {
        sprint.startDate = sprintData.startDate;
        sprint.endDate = sprintData.endDate;
        sprint.plannedStories = generatePhaseStories(sprintData.plannedPoints, sprintData.name);
        sprint.plannedTotalPoints = sprintData.plannedPoints;
        sprint.observations = sprintData.observations;
        sprint.status = sprintData.status;
        console.log(`   🔄 ACTUALIZADO: ${sprintData.name}`);
        updatedCount++;
      }

      await sprint.save();

      // Poblar datos de puntos para sprints completados/activos
      if (sprintData.status !== "Planificado") {
        await populateSprintWithRealData(sprint, users, sprintData.targetCompletion, PointsRegistry, Sprint);
      }
    }

    console.log('\n🎉 HISTORIA DEL PROYECTO CREADA EXITOSAMENTE!');
    console.log('📊 Resumen:');
    console.log(`   ✅ ${createdCount} sprints creados`);
    console.log(`   🔄 ${updatedCount} sprints actualizados`);
    console.log(`   👥 ${users.length} usuarios en el equipo`);
    console.log('\n📚 Fases del desarrollo:');
    console.log('   🏗️  FASE 1-2: Arquitectura y Modelos (Sept)');
    console.log('   🎨 FASE 3-4: Frontend Base (Sept)');
    console.log('   👨‍💼 FASE 5-6: Panel Admin (Oct)');
    console.log('   📊 FASE 7-8: Analytics y UX (Oct)');
    console.log('   🐛 FASE 9: Testing y Bugs (Nov - Recién terminado)');
    console.log('   🚀 FASE 10: Demo Final (ACTIVO - Termina 12 Nov)');
    console.log('\n🚀 Ahora puedes ver los datos reales en la aplicación!');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error durante la población:', error);
    process.exit(1);
  }
};

// Historias específicas por cada fase del proyecto
const generatePhaseStories = (totalPoints, phaseName) => {
  const phaseStories = {
    "Fase 1 - Arquitectura y Auth": [
      { score: 8, quantity: 1 }, { score: 5, quantity: 1 }, { score: 5, quantity: 1 },
      { score: 3, quantity: 1 }, { score: 2, quantity: 1 }, { score: 1, quantity: 1 }
    ],
    "Fase 2 - Modelos y API Core": [
      { score: 8, quantity: 1 }, { score: 8, quantity: 1 }, { score: 5, quantity: 1 },
      { score: 3, quantity: 1 }, { score: 2, quantity: 1 }, { score: 2, quantity: 1 }
    ],
    "Fase 3 - Frontend React": [
      { score: 8, quantity: 1 }, { score: 5, quantity: 1 }, { score: 5, quantity: 1 },
      { score: 5, quantity: 1 }, { score: 3, quantity: 1 }, { score: 3, quantity: 1 }
    ],
    "Fase 4 - Dashboard Usuario": [
      { score: 8, quantity: 1 }, { score: 5, quantity: 1 }, { score: 5, quantity: 1 },
      { score: 3, quantity: 1 }, { score: 3, quantity: 1 }, { score: 2, quantity: 1 }
    ],
    "Fase 5 - Panel Administración": [
      { score: 13, quantity: 1 }, { score: 8, quantity: 1 }, { score: 5, quantity: 1 },
      { score: 5, quantity: 1 }, { score: 3, quantity: 1 }, { score: 2, quantity: 1 }
    ],
    "Fase 6 - Integración Completions": [
      { score: 8, quantity: 1 }, { score: 5, quantity: 1 }, { score: 5, quantity: 1 },
      { score: 3, quantity: 1 }, { score: 3, quantity: 1 }, { score: 2, quantity: 1 }
    ],
    "Fase 7 - Análisis y Reportes": [
      { score: 13, quantity: 1 }, { score: 8, quantity: 1 }, { score: 8, quantity: 1 },
      { score: 5, quantity: 1 }, { score: 5, quantity: 1 }, { score: 3, quantity: 1 }
    ],
    "Fase 8 - Mejoras UX": [
      { score: 8, quantity: 1 }, { score: 5, quantity: 1 }, { score: 5, quantity: 1 },
      { score: 3, quantity: 1 }, { score: 3, quantity: 1 }, { score: 2, quantity: 1 }
    ],
    "Fase 9 - Testing y Bugs": [
      { score: 8, quantity: 1 }, { score: 5, quantity: 1 }, { score: 5, quantity: 1 },
      { score: 5, quantity: 1 }, { score: 3, quantity: 1 }, { score: 3, quantity: 1 }
    ],
    "Fase 10 - Demo y Documentación": [
      { score: 8, quantity: 1 }, { score: 5, quantity: 1 }, { score: 5, quantity: 1 },
      { score: 3, quantity: 1 }, { score: 2, quantity: 1 }, { score: 1, quantity: 1 }
    ]
  };

  return phaseStories[phaseName] || generateGenericStories(totalPoints);
};

// Asignación de equipo REAL
const generateTeamAssignment = (users, phaseName) => {
  // Para primeras fases: equipo más pequeño
  if (phaseName.includes("Fase 1") || phaseName.includes("Fase 2")) {
    return users.slice(0, 2).map(user => ({
      userId: user._id,
      hours: 25
    }));
  }
  
  // Para fases intermedias: equipo completo
  if (phaseName.includes("Fase 3") || phaseName.includes("Fase 4") || 
      phaseName.includes("Fase 5") || phaseName.includes("Fase 6")) {
    return users.slice(0, 4).map(user => ({
      userId: user._id,
      hours: [20, 25, 30][Math.floor(Math.random() * 3)]
    }));
  }
  
  // Para fases finales: todo el equipo
  return users.map(user => ({
    userId: user._id,
    hours: phaseName.includes("Fase 10") ? 35 : 30
  }));
};

// Poblar datos reales
const populateSprintWithRealData = async (sprint, users, targetCompletion, PointsRegistry, Sprint) => {
  try {
    await PointsRegistry.deleteMany({ sprintId: sprint._id });

    const teamMembers = sprint.usersAssigned || [];
    const registries = [];
    let totalCompleted = 0;

    const actualCompletion = sprint.status === "Activo" 
      ? targetCompletion 
      : (targetCompletion / sprint.plannedTotalPoints) * 100;

    for (const member of teamMembers) {
      const user = users.find(u => u._id.toString() === member.userId.toString());
      if (!user) continue;

      const userPerformance = getUserPerformanceFactor(user.name);
      const userPoints = calculateUserPoints(
        sprint.plannedTotalPoints, 
        teamMembers.length, 
        userPerformance,
        actualCompletion
      );

      const stories = generateUserStories(userPoints.total, user.name);
      totalCompleted += userPoints.total;

      const registry = new PointsRegistry({
        userId: user._id,
        sprintId: sprint._id,
        stories: stories,
        totalPoints: userPoints.total,
        isInterruption: userPoints.hasInterruption,
        registeredAt: generateRealisticDates(sprint.startDate, sprint.endDate, sprint.status)
      });

      registries.push(registry);
    }

    if (registries.length > 0) {
      await PointsRegistry.insertMany(registries);
      await Sprint.findByIdAndUpdate(sprint._id, {
        completedPoints: totalCompleted
      });

      const completionRate = Math.round((totalCompleted/sprint.plannedTotalPoints)*100);
      const statusIcon = sprint.status === "Completado" ? "✅" : sprint.status === "Activo" ? "🔵" : "🟡";
      console.log(`   ${statusIcon} ${totalCompleted}/${sprint.plannedTotalPoints} pts (${completionRate}%) - ${registries.length} registros`);
    }
  } catch (error) {
    console.error(`   ❌ Error poblando ${sprint.name}:`, error.message);
  }
};

// Funciones auxiliares ACTUALIZADAS con usuarios reales
const getUserPerformanceFactor = (userName) => {
  const performance = {
    'Guissella': 1.15,   // Alta productividad
    'Paloma': 1.10,      // Buena productividad  
    'Sofía': 1.05,       // Productividad media-alta
    'Valentina': 1.0,    // Productividad estándar
    'Aday': 0.95,        // Productividad media
    'Mari Carmen': 0.90, // Productividad básica
    'default': 1.0
  };
  return performance[userName] || performance.default;
};

const calculateUserPoints = (plannedTotal, teamSize, performance, completionPercent) => {
  const basePoints = (plannedTotal / teamSize) * (completionPercent / 100);
  const variedPoints = basePoints * performance * (0.9 + Math.random() * 0.2);
  const finalPoints = Math.max(1, Math.round(variedPoints));
  return { total: finalPoints, hasInterruption: Math.random() < 0.25 };
};

const generateUserStories = (totalPoints, userName) => {
  const stories = [];
  let remaining = totalPoints;
  
  // Preferencias de story points por usuario
  const preferences = {
    'Guissella': [5, 3, 8, 2],     // Prefiere tareas medias/complejas
    'Paloma': [3, 5, 2, 1],        // Balanceada
    'Sofía': [2, 3, 1, 5],         // Prefiere tareas pequeñas/medianas
    'Valentina': [1, 2, 0.5, 3],   // Prefiere tareas pequeñas
    'Aday': [1, 0.5, 2, 1],        // Tareas muy pequeñas
    'Mari Carmen': [1, 2, 0.5, 1], // Tareas pequeñas
    'default': [2, 3, 1, 5]
  };
  
  const preferredSizes = preferences[userName] || preferences.default;

  while (remaining > 0 && stories.length < 5) {
    const available = preferredSizes.filter(size => size <= remaining);
    if (available.length === 0) break;
    const pointValue = available[Math.floor(Math.random() * available.length)];
    stories.push({ pointValue, count: 1, subtotal: pointValue });
    remaining -= pointValue;
  }
  return stories;
};

const generateRealisticDates = (startDate, endDate, status) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (status === "Activo") {
    const today = new Date();
    const maxDate = today < end ? today : end;
    const range = maxDate.getTime() - start.getTime();
    return new Date(start.getTime() + Math.random() * range);
  } else {
    const range = end.getTime() - start.getTime();
    return new Date(start.getTime() + Math.random() * range);
  }
};

const generateGenericStories = (totalPoints) => {
  const distribution = [
    { score: 0.5, weight: 0.1 }, { score: 1, weight: 0.15 }, { score: 2, weight: 0.25 },
    { score: 3, weight: 0.25 }, { score: 5, weight: 0.15 }, { score: 8, weight: 0.08 },
    { score: 13, weight: 0.02 }
  ];
  const stories = [];
  let remaining = totalPoints;

  while (remaining > 0 && stories.length < 8) {
    const available = distribution.filter(d => d.score <= remaining);
    if (available.length === 0) break;
    const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    let selected;
    for (const item of available) {
      random -= item.weight;
      if (random <= 0) { selected = item; break; }
    }
    stories.push({ score: selected.score, quantity: 1 });
    remaining -= selected.score;
  }
  return stories;
};

// 🚀 EJECUCIÓN PRINCIPAL
organizeProjectHistorySprints();