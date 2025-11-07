import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Definir los esquemas directamente aquí para evitar imports problemáticos
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isAdmin: Boolean,
  avatar: String
}, { timestamps: true });

const sprintSchema = new mongoose.Schema({
  name: String,
  startDate: Date,
  endDate: Date,
  adminId: mongoose.Schema.Types.ObjectId,
  plannedStories: [{
    score: Number,
    quantity: Number
  }],
  plannedTotalPoints: Number,
  usersAssigned: [{
    userId: mongoose.Schema.Types.ObjectId,
    hours: Number
  }],
  observations: String,
  status: String,
  completedPoints: Number
}, { timestamps: true });

const pointsRegistrySchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  sprintId: mongoose.Schema.Types.ObjectId,
  stories: [{
    pointValue: Number,
    count: Number,
    subtotal: Number
  }],
  totalPoints: Number,
  isInterruption: Boolean,
  registeredAt: Date
}, { timestamps: true });

// Crear modelos
const User = mongoose.model('User', userSchema);
const Sprint = mongoose.model('Sprint', sprintSchema);
const PointsRegistry = mongoose.model('PointsRegistry', pointsRegistrySchema);

const quickPopulate = async () => {
  let mongod;
  
  try {
    console.log('🚀 Iniciando población rápida de datos...');
    
    // Crear servidor MongoDB en memoria
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    console.log('📡 Conectando a MongoDB en memoria...');
    await mongoose.connect(uri);
    console.log('✅ MongoDB conectado');

    console.log('👥 Creando equipo de desarrollo...');
    
    // Crear usuarios reales del equipo
    const users = await User.create([
      { 
        name: "Guissella", 
        email: "guissella@example.com", 
        password: "temp123", 
        role: "Developer",
        isAdmin: false 
      },
      { 
        name: "Paloma", 
        email: "paloma@example.com", 
        password: "temp123", 
        role: "Developer",
        isAdmin: false 
      },
      { 
        name: "Sofía", 
        email: "sofia@example.com", 
        password: "temp123", 
        role: "Developer",
        isAdmin: false 
      },
      { 
        name: "Valentina", 
        email: "valentina@example.com", 
        password: "temp123", 
        role: "Developer",
        isAdmin: false 
      },
      { 
        name: "Aday", 
        email: "aday@example.com", 
        password: "temp123", 
        role: "Developer",
        isAdmin: false 
      },
      { 
        name: "Mari Carmen", 
        email: "mcarmen@example.com", 
        password: "temp123", 
        role: "Developer",
        isAdmin: false 
      }
    ]);
    
    console.log(`✅ Equipo creado: ${users.map(u => u.name).join(', ')}`);

    // HISTORIA DEL PROYECTO SPRINTFLOW
    const projectHistory = [
      {
        name: "Fase 1 - Arquitectura y Auth",
        startDate: new Date("2025-09-04"),
        endDate: new Date("2025-09-08"),
        plannedPoints: 25,
        targetCompletion: 28,
        status: "Completado",
        observations: "Setup inicial del proyecto. Backend con Express/MongoDB. Sistema de autenticación JWT."
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
      {
        name: "Fase 3 - Frontend React",
        startDate: new Date("2025-09-18"),
        endDate: new Date("2025-09-22"),
        plannedPoints: 35,
        targetCompletion: 38,
        status: "Completado",
        observations: "Setup Vite + React. Routing con React Router. Componentes base con Material-UI."
      },
      {
        name: "Fase 4 - Dashboard Usuario",
        startDate: new Date("2025-09-25"),
        endDate: new Date("2025-09-29"),
        plannedPoints: 32,
        targetCompletion: 29,
        status: "Completado Parcial",
        observations: "Dashboard de usuario funcional. Registro de puntos diario. Pequeños bugs en cálculos."
      },
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
        observations: "Sistema de completions unificado. Conexión PointsRegistry con vistas admin."
      },
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

    console.log(`\n📅 Creando ${projectHistory.length} sprints históricos...`);

    let sprintCount = 0;
    let registryCount = 0;

    for (const sprintData of projectHistory) {
      // Determinar equipo para esta fase
      let teamMembers;
      if (sprintData.name.includes("Fase 1") || sprintData.name.includes("Fase 2")) {
        teamMembers = users.slice(0, 2); // Equipo pequeño al inicio
      } else if (sprintData.name.includes("Fase 3") || sprintData.name.includes("Fase 4") || 
                 sprintData.name.includes("Fase 5") || sprintData.name.includes("Fase 6")) {
        teamMembers = users.slice(0, 4); // Equipo mediano
      } else {
        teamMembers = users; // Todo el equipo
      }

      // Crear sprint
      const sprint = await Sprint.create({
        name: sprintData.name,
        startDate: sprintData.startDate,
        endDate: sprintData.endDate,
        adminId: users[0]._id, // Guissella como admin
        plannedStories: generateStories(sprintData.plannedPoints),
        plannedTotalPoints: sprintData.plannedPoints,
        usersAssigned: teamMembers.map(user => ({
          userId: user._id,
          hours: sprintData.name.includes("Fase 10") ? 35 : [20, 25, 30][Math.floor(Math.random() * 3)]
        })),
        observations: sprintData.observations,
        status: sprintData.status,
        completedPoints: 0
      });

      sprintCount++;
      console.log(`   ✅ ${sprintData.name}`);

      // Crear registros de puntos para sprints completados/activos
      if (sprintData.status !== "Planificado") {
        const completionPercent = sprintData.status === "Activo" 
          ? sprintData.targetCompletion 
          : (sprintData.targetCompletion / sprintData.plannedPoints) * 100;

        const registries = [];
        let totalCompleted = 0;

        for (const user of teamMembers) {
          const userPoints = calculateUserPoints(sprintData.plannedPoints, teamMembers.length, user.name, completionPercent);
          totalCompleted += userPoints.total;

          registries.push({
            userId: user._id,
            sprintId: sprint._id,
            stories: generateUserStories(userPoints.total, user.name),
            totalPoints: userPoints.total,
            isInterruption: userPoints.hasInterruption,
            registeredAt: generateDate(sprintData.startDate, sprintData.endDate, sprintData.status)
          });
        }

        await PointsRegistry.insertMany(registries);
        await Sprint.findByIdAndUpdate(sprint._id, { completedPoints: totalCompleted });
        
        registryCount += registries.length;
        const completionRate = Math.round((totalCompleted/sprintData.plannedPoints)*100);
        const statusIcon = sprintData.status === "Completado" ? "✅" : sprintData.status === "Activo" ? "🔵" : "🟡";
        console.log(`      ${statusIcon} ${totalCompleted}/${sprintData.plannedPoints} pts (${completionRate}%) - ${registries.length} registros`);
      }
    }

    console.log('\n🎉 DATOS HISTÓRICOS CREADOS EXITOSAMENTE!');
    console.log('📊 Resumen:');
    console.log(`   ✅ ${sprintCount} sprints creados`);
    console.log(`   📝 ${registryCount} registros de puntos`);
    console.log(`   👥 ${users.length} desarrolladores`);
    console.log('\n📚 Timeline del proyecto:');
    console.log('   🏗️  FASE 1-2: Fundaciones (Sept)');
    console.log('   🎨 FASE 3-4: Frontend (Sept)');
    console.log('   👨‍💼 FASE 5-6: Admin (Oct)');
    console.log('   📊 FASE 7-8: Analytics (Oct)');
    console.log('   🐛 FASE 9: Testing (Nov)');
    console.log('   🚀 FASE 10: Demo (ACTIVO)');
    console.log('\n💡 Estos datos son de demostración en memoria');
    console.log('🔌 Cerrando conexión...');

    await mongoose.connection.close();
    await mongod.stop();
    console.log('✅ Proceso completado');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (mongod) await mongod.stop();
    process.exit(1);
  }
};

// Funciones auxiliares simplificadas
const generateStories = (totalPoints) => {
  const sizes = [1, 2, 3, 5, 8, 13];
  const stories = [];
  let remaining = totalPoints;
  
  while (remaining > 0 && stories.length < 8) {
    const available = sizes.filter(size => size <= remaining);
    if (available.length === 0) break;
    const score = available[Math.floor(Math.random() * available.length)];
    stories.push({ score, quantity: 1 });
    remaining -= score;
  }
  return stories;
};

const getUserPerformance = (userName) => {
  const performance = {
    'Guissella': 1.15, 'Paloma': 1.10, 'Sofía': 1.05, 
    'Valentina': 1.0, 'Aday': 0.95, 'Mari Carmen': 0.90
  };
  return performance[userName] || 1.0;
};

const calculateUserPoints = (plannedTotal, teamSize, userName, completionPercent) => {
  const performance = getUserPerformance(userName);
  const basePoints = (plannedTotal / teamSize) * (completionPercent / 100);
  const variedPoints = basePoints * performance * (0.9 + Math.random() * 0.2);
  const finalPoints = Math.max(1, Math.round(variedPoints));
  return { total: finalPoints, hasInterruption: Math.random() < 0.2 };
};

const generateUserStories = (totalPoints, userName) => {
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

// Ejecutar
quickPopulate();