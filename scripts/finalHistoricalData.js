// scripts/finalHistoricalData.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Definir esquemas directamente
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

const createFinalHistoricalData = async () => {
  try {
    console.log('🚀 Creando datos históricos finales...');
    
    if (!MONGODB_URI) {
      console.log('❌ ERROR: No se encontró URI de MongoDB');
      process.exit(1);
    }

    console.log('📡 Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    console.log('🔍 Buscando usuarios existentes...');
    
    // BUSCAR solo los usuarios reales del equipo (excluyendo admins)
    const realTeamUsers = await User.find({
      name: { $in: ['Guissella', 'Paloma', 'Sofía', 'Valentina', 'Aday', 'Mari Carmen'] }
    });

    if (realTeamUsers.length === 0) {
      console.log('❌ No se encontraron los usuarios del equipo real');
      console.log('💡 Ejecuta primero: node scripts/populateDatabase.js');
      process.exit(1);
    }

    console.log(`👥 Equipo real encontrado: ${realTeamUsers.map(u => u.name).join(', ')}`);

    // BUSCAR usuarios admin para excluirlos
    const adminUsers = await User.find({
      name: { $in: ['Mi Nuevo Admin', 'admin', 'Pal'] }
    });
    console.log(`🚫 Excluyendo: ${adminUsers.map(u => u.name).join(', ')}`);

    // 1. LIMPIAR datos anteriores
    console.log('🗑️  Limpiando datos anteriores...');
    await PointsRegistry.deleteMany({});
    await Sprint.deleteMany({});
    console.log('✅ Datos anteriores eliminados');

    // HISTORIA DEL PROYECTO SPRINTFLOW CON NOMBRES SIMPLIFICADOS
    const projectHistory = [
      {
        name: "Sprint 1",
        startDate: new Date("2025-09-04"),
        endDate: new Date("2025-09-08"),
        plannedPoints: 25,
        targetCompletion: 28,
        status: "Completado",
        observations: "Setup inicial del proyecto. Backend con Express/MongoDB. Sistema de autenticación JWT."
      },
      {
        name: "Sprint 2", 
        startDate: new Date("2025-09-11"),
        endDate: new Date("2025-09-15"),
        plannedPoints: 30,
        targetCompletion: 27,
        status: "Completado Parcial",
        observations: "Modelos User, Sprint, PointsRegistry. APIs básicas. Algunos endpoints necesitan refinamiento."
      },
      {
        name: "Sprint 3",
        startDate: new Date("2025-09-18"),
        endDate: new Date("2025-09-22"),
        plannedPoints: 35,
        targetCompletion: 38,
        status: "Completado",
        observations: "Setup Vite + React. Routing con React Router. Componentes base con Material-UI."
      },
      {
        name: "Sprint 4",
        startDate: new Date("2025-09-25"),
        endDate: new Date("2025-09-29"),
        plannedPoints: 32,
        targetCompletion: 29,
        status: "Completado Parcial",
        observations: "Dashboard de usuario funcional. Registro de puntos diario. Pequeños bugs en cálculos."
      },
      {
        name: "Sprint 5",
        startDate: new Date("2025-10-02"),
        endDate: new Date("2025-10-06"),
        plannedPoints: 40,
        targetCompletion: 42,
        status: "Completado",
        observations: "CRUD completo de sprints. Asignación de usuarios. Vista detalle de sprint con métricas."
      },
      {
        name: "Sprint 6",
        startDate: new Date("2025-10-09"),
        endDate: new Date("2025-10-13"),
        plannedPoints: 28,
        targetCompletion: 24,
        status: "Completado Parcial",
        observations: "Sistema de completions unificado. Conexión PointsRegistry con vistas admin."
      },
      {
        name: "Sprint 7",
        startDate: new Date("2025-10-16"),
        endDate: new Date("2025-10-20"),
        plannedPoints: 45,
        targetCompletion: 48,
        status: "Completado",
        observations: "Página de Results completa. Gráficos comparativos. Filtros por tiempo. Exportación CSV."
      },
      {
        name: "Sprint 8",
        startDate: new Date("2025-10-23"),
        endDate: new Date("2025-10-27"),
        plannedPoints: 30,
        targetCompletion: 26,
        status: "Completado Parcial", 
        observations: "Modo oscuro implementado. Responsive design mejorado. Loading states y feedback visual."
      },
      {
        name: "Sprint 9",
        startDate: new Date("2025-10-30"),
        endDate: new Date("2025-11-05"),
        plannedPoints: 35,
        targetCompletion: 32,
        status: "Completado Parcial",
        observations: "Fix de bugs críticos. Mejora en sincronización de puntos. Preparación para demo final."
      },
      {
        name: "Sprint 10",
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
    let pointsCount = 0;

    for (const sprintData of projectHistory) {
      // Determinar equipo SOLO con usuarios reales
      let teamMembers;
      if (sprintData.name === "Sprint 1" || sprintData.name === "Sprint 2") {
        teamMembers = realTeamUsers.slice(0, 2); // Equipo pequeño: Guissella, Paloma
      } else if (sprintData.name === "Sprint 3" || sprintData.name === "Sprint 4" || 
                 sprintData.name === "Sprint 5" || sprintData.name === "Sprint 6") {
        teamMembers = realTeamUsers.slice(0, 4); // Equipo mediano
      } else {
        teamMembers = realTeamUsers; // Todo el equipo real
      }

      // Crear sprint
      const sprint = await Sprint.create({
        name: sprintData.name,
        startDate: sprintData.startDate,
        endDate: sprintData.endDate,
        adminId: realTeamUsers[0]._id, // Guissella como admin
        plannedStories: generateStories(sprintData.plannedPoints),
        plannedTotalPoints: sprintData.plannedPoints,
        usersAssigned: teamMembers.map(user => ({
          userId: user._id,
          hours: sprintData.name === "Sprint 10" ? 35 : [20, 25, 30][Math.floor(Math.random() * 3)]
        })),
        observations: sprintData.observations,
        status: sprintData.status,
        completedPoints: 0
      });

      console.log(`   ✅ ${sprintData.name}`);
      console.log(`      👥 Equipo: ${teamMembers.map(u => u.name).join(', ')}`);
      sprintCount++;

      // Crear registros de puntos SOLO para usuarios reales
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
            stories: generateUserStories(userPoints.total),
            totalPoints: userPoints.total,
            isInterruption: userPoints.hasInterruption,
            registeredAt: generateDate(sprintData.startDate, sprintData.endDate, sprintData.status)
          });
        }

        if (registries.length > 0) {
          await PointsRegistry.insertMany(registries);
          await Sprint.findByIdAndUpdate(sprint._id, { completedPoints: totalCompleted });
          
          pointsCount += registries.length;
          const completionRate = Math.round((totalCompleted/sprintData.plannedPoints)*100);
          const statusIcon = sprintData.status === "Completado" ? "✅" : sprintData.status === "Activo" ? "🔵" : "🟡";
          console.log(`      ${statusIcon} ${totalCompleted}/${sprintData.plannedPoints} pts (${completionRate}%) - ${registries.length} registros`);
        }
      }
    }

    console.log('\n🎉 DATOS HISTÓRICOS FINALES CREADOS!');
    console.log('📊 Resumen:');
    console.log(`   ✅ ${sprintCount} sprints creados (Sprint 1 al Sprint 10)`);
    console.log(`   📝 ${pointsCount} registros de puntos`);
    console.log(`   👥 ${realTeamUsers.length} usuarios del equipo real`);
    
    console.log('\n📈 Ahora los nombres en los gráficos serán limpios:');
    console.log('   Sprint 1, Sprint 2, Sprint 3, ... Sprint 10');
    
    console.log('\n🚀 Inicia tu aplicación: npm run dev');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Funciones auxiliares (se mantienen igual)
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

const calculateUserPoints = (plannedTotal, teamSize, userName, completionPercent) => {
  const performance = getUserPerformance(userName);
  const basePoints = (plannedTotal / teamSize) * (completionPercent / 100);
  const variedPoints = basePoints * performance * (0.9 + Math.random() * 0.2);
  const finalPoints = Math.max(1, Math.round(variedPoints));
  return { total: finalPoints, hasInterruption: Math.random() < 0.2 };
};

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

createFinalHistoricalData();