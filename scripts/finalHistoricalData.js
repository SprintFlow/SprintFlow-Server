import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Definir esquemas
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
    
    const realTeamUsers = await User.find({
      name: { $in: ['Guissella', 'Paloma', 'Sofía', 'Valentina', 'Aday', 'Mari Carmen'] }
    });

    if (realTeamUsers.length === 0) {
      console.log('❌ No se encontraron los usuarios del equipo real');
      console.log('💡 Ejecuta primero: node scripts/populateDatabase.js');
      process.exit(1);
    }

    console.log(`👥 Equipo real encontrado: ${realTeamUsers.map(u => u.name).join(', ')}`);

    // HISTORIA DEL PROYECTO (últimas 10 semanas, lunes a viernes)
    const projectHistory = [
      {
        name: "Sprint 1",
        startDate: new Date("2025-09-01"), // Lunes
        endDate: new Date("2025-09-05"),   // Viernes
        plannedStories: [
          { score: 5, quantity: 2 },  // 10 pts
          { score: 3, quantity: 3 },  // 9 pts
          { score: 2, quantity: 3 }   // 6 pts
        ], // Total: 25 pts
        completedStories: [
          { score: 5, quantity: 2 },  // 10 pts
          { score: 3, quantity: 3 },  // 9 pts
          { score: 2, quantity: 3 }   // 6 pts
        ], // Completado: 25 pts
        status: "Completado",
        observations: "Setup inicial del proyecto. Backend con Express/MongoDB. Sistema de autenticación JWT."
      },
      {
        name: "Sprint 2", 
        startDate: new Date("2025-09-08"),
        endDate: new Date("2025-09-12"),
        plannedStories: [
          { score: 8, quantity: 2 },  // 16 pts
          { score: 5, quantity: 2 },  // 10 pts
          { score: 2, quantity: 2 }   // 4 pts
        ], // Total: 30 pts
        completedStories: [
          { score: 8, quantity: 1 },  // 8 pts
          { score: 5, quantity: 2 },  // 10 pts
          { score: 2, quantity: 2 }   // 4 pts
        ], // Completado: 22 pts (Pendientes: 8 pts)
        status: "Completado Parcial",
        observations: "Modelos User, Sprint, PointsRegistry. APIs básicas. Algunos endpoints necesitan refinamiento."
      },
      {
        name: "Sprint 3",
        startDate: new Date("2025-09-15"),
        endDate: new Date("2025-09-19"),
        plannedStories: [
          { score: 8, quantity: 3 },  // 24 pts
          { score: 5, quantity: 1 },  // 5 pts
          { score: 3, quantity: 2 }   // 6 pts
        ], // Total: 35 pts
        completedStories: [
          { score: 8, quantity: 3 },  // 24 pts
          { score: 5, quantity: 1 },  // 5 pts
          { score: 3, quantity: 2 }   // 6 pts
        ], // Completado: 35 pts
        status: "Completado",
        observations: "Setup Vite + React. Routing con React Router. Componentes base con Material-UI."
      },
      {
        name: "Sprint 4",
        startDate: new Date("2025-09-22"),
        endDate: new Date("2025-09-26"),
        plannedStories: [
          { score: 13, quantity: 1 }, // 13 pts
          { score: 5, quantity: 2 },  // 10 pts
          { score: 3, quantity: 3 }   // 9 pts
        ], // Total: 32 pts
        completedStories: [
          { score: 5, quantity: 2 },  // 10 pts
          { score: 3, quantity: 3 }   // 9 pts
        ], // Completado: 19 pts (Pendientes: 13 pts)
        status: "Completado Parcial",
        observations: "Dashboard de usuario funcional. Registro de puntos diario. Pequeños bugs en cálculos."
      },
      {
        name: "Sprint 5",
        startDate: new Date("2025-09-29"),
        endDate: new Date("2025-10-03"),
        plannedStories: [
          { score: 13, quantity: 2 }, // 26 pts
          { score: 8, quantity: 1 },  // 8 pts
          { score: 3, quantity: 2 }   // 6 pts
        ], // Total: 40 pts
        completedStories: [
          { score: 13, quantity: 2 }, // 26 pts
          { score: 8, quantity: 1 },  // 8 pts
          { score: 3, quantity: 2 }   // 6 pts
        ], // Completado: 40 pts
        status: "Completado",
        observations: "CRUD completo de sprints. Asignación de usuarios. Vista detalle de sprint con métricas."
      },
      {
        name: "Sprint 6",
        startDate: new Date("2025-10-06"),
        endDate: new Date("2025-10-10"),
        plannedStories: [
          { score: 8, quantity: 2 },  // 16 pts
          { score: 5, quantity: 1 },  // 5 pts
          { score: 3, quantity: 2 }   // 6 pts
        ], // Total: 27 pts
        completedStories: [
          { score: 8, quantity: 1 },  // 8 pts
          { score: 5, quantity: 1 },  // 5 pts
          { score: 3, quantity: 2 }   // 6 pts
        ], // Completado: 19 pts (Pendientes: 8 pts)
        status: "Completado Parcial",
        observations: "Sistema de completions unificado. Conexión PointsRegistry con vistas admin."
      },
      {
        name: "Sprint 7",
        startDate: new Date("2025-10-13"),
        endDate: new Date("2025-10-17"),
        plannedStories: [
          { score: 13, quantity: 2 }, // 26 pts
          { score: 8, quantity: 2 },  // 16 pts
          { score: 5, quantity: 1 }   // 5 pts
        ], // Total: 47 pts
        completedStories: [
          { score: 13, quantity: 2 }, // 26 pts
          { score: 8, quantity: 2 },  // 16 pts
          { score: 5, quantity: 1 }   // 5 pts
        ], // Completado: 47 pts
        status: "Completado",
        observations: "Página de Results completa. Gráficos comparativos. Filtros por tiempo. Exportación CSV."
      },
      {
        name: "Sprint 8",
        startDate: new Date("2025-10-20"),
        endDate: new Date("2025-10-24"),
        plannedStories: [
          { score: 8, quantity: 2 },  // 16 pts
          { score: 5, quantity: 2 },  // 10 pts
          { score: 3, quantity: 1 }   // 3 pts
        ], // Total: 29 pts
        completedStories: [
          { score: 8, quantity: 1 },  // 8 pts
          { score: 5, quantity: 2 },  // 10 pts
          { score: 3, quantity: 1 }   // 3 pts
        ], // Completado: 21 pts (Pendientes: 8 pts)
        status: "Completado Parcial", 
        observations: "Modo oscuro implementado. Responsive design mejorado. Loading states y feedback visual."
      },
      {
        name: "Sprint 9",
        startDate: new Date("2025-10-27"),
        endDate: new Date("2025-10-31"),
        plannedStories: [
          { score: 8, quantity: 3 },  // 24 pts
          { score: 5, quantity: 2 }   // 10 pts
        ], // Total: 34 pts
        completedStories: [
          { score: 8, quantity: 2 },  // 16 pts
          { score: 5, quantity: 2 }   // 10 pts
        ], // Completado: 26 pts (Pendientes: 8 pts)
        status: "Completado Parcial",
        observations: "Fix de bugs críticos. Mejora en sincronización de puntos. Preparación para demo final."
      },
      {
        name: "Sprint 10",
        startDate: new Date("2025-11-10"), // Lunes (CORREGIDO)
        endDate: new Date("2025-11-14"),   // Viernes
        plannedStories: [
          { score: 8, quantity: 2 },  // 16 pts
          { score: 5, quantity: 1 },  // 5 pts
          { score: 3, quantity: 2 },  // 6 pts
          { score: 2, quantity: 2 }   // 4 pts
        ], // Total: 31 pts
        completedStories: [
          { score: 2, quantity: 3 },  // 6 pts (lunes-martes)
          { score: 3, quantity: 1 }   // 3 pts (miércoles)
        ], // Completado hasta miércoles: 9 pts (Pendientes: 22 pts)
        status: "Activo",
        observations: "Preparación para presentación final. Documentación técnica. Tests finales y optimizaciones."
      }
    ];

    console.log(`\n📅 Actualizando ${projectHistory.length} sprints históricos...`);

    let sprintCount = 0;
    let pointsCount = 0;

    for (const sprintData of projectHistory) {
      // Determinar equipo según fase del proyecto
      let teamMembers;
      if (sprintData.name === "Sprint 1" || sprintData.name === "Sprint 2") {
        teamMembers = realTeamUsers.slice(0, 2); // Equipo pequeño
      } else if (sprintData.name === "Sprint 3" || sprintData.name === "Sprint 4" || 
                 sprintData.name === "Sprint 5" || sprintData.name === "Sprint 6") {
        teamMembers = realTeamUsers.slice(0, 4); // Equipo mediano
      } else {
        teamMembers = realTeamUsers; // Todo el equipo
      }

      const plannedTotalPoints = sprintData.plannedStories.reduce((sum, s) => sum + (s.score * s.quantity), 0);
      const completedTotalPoints = sprintData.completedStories.reduce((sum, s) => sum + (s.score * s.quantity), 0);

      // ACTUALIZAR o CREAR sprint (upsert por nombre)
      const sprint = await Sprint.findOneAndUpdate(
        { name: sprintData.name },
        {
          name: sprintData.name,
          startDate: sprintData.startDate,
          endDate: sprintData.endDate,
          adminId: realTeamUsers[0]._id,
          plannedStories: sprintData.plannedStories,
          plannedTotalPoints: plannedTotalPoints,
          usersAssigned: teamMembers.map(user => ({
            userId: user._id,
            hours: sprintData.name === "Sprint 10" ? 40 : [20, 25, 30, 35][Math.floor(Math.random() * 4)]
          })),
          observations: sprintData.observations,
          status: sprintData.status,
          completedPoints: completedTotalPoints
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      console.log(`   ${sprintData.status === 'Completado' ? '✅' : sprintData.status === 'Activo' ? '🔵' : '🟡'} ${sprintData.name}`);
      console.log(`      📊 Planificado: ${plannedTotalPoints} pts | Completado: ${completedTotalPoints} pts`);
      console.log(`      👥 Equipo: ${teamMembers.map(u => u.name).join(', ')}`);
      sprintCount++;

      // LIMPIAR registros anteriores de este sprint
      await PointsRegistry.deleteMany({ sprintId: sprint._id });

      // Crear registros de puntos SOLO de historias completadas
      if (sprintData.completedStories.length > 0) {
        const registries = [];

        // Distribuir historias completadas entre el equipo
        const storiesPool = [...sprintData.completedStories];
        
        for (const user of teamMembers) {
          const userStories = [];
          const userStoryCount = Math.ceil(storiesPool.length / teamMembers.length);
          
          for (let i = 0; i < userStoryCount && storiesPool.length > 0; i++) {
            const storyIndex = Math.floor(Math.random() * storiesPool.length);
            const story = storiesPool[storyIndex];
            
            if (story.quantity > 0) {
              userStories.push({
                pointValue: story.score,
                count: 1,
                subtotal: story.score
              });
              story.quantity--;
              if (story.quantity === 0) {
                storiesPool.splice(storyIndex, 1);
              }
            }
          }

          if (userStories.length > 0) {
            const userTotal = userStories.reduce((sum, s) => sum + s.subtotal, 0);
            
            registries.push({
              userId: user._id,
              sprintId: sprint._id,
              stories: userStories,
              totalPoints: userTotal,
              isInterruption: Math.random() < 0.15, // 15% de interrupciones
              registeredAt: generateRealisticDate(sprintData.startDate, sprintData.endDate, sprintData.status)
            });
          }
        }

        if (registries.length > 0) {
          await PointsRegistry.insertMany(registries);
          pointsCount += registries.length;
          
          const pendingPoints = plannedTotalPoints - completedTotalPoints;
          console.log(`      📝 ${registries.length} registros creados`);
          if (pendingPoints > 0) {
            console.log(`      ⚠️  Pendientes: ${pendingPoints} pts`);
          }
        }
      }
    }

    console.log('\n🎉 DATOS HISTÓRICOS ACTUALIZADOS!');
    console.log('📊 Resumen:');
    console.log(`   ✅ ${sprintCount} sprints actualizados (Sprint 1 al Sprint 10)`);
    console.log(`   📝 ${pointsCount} registros de puntos creados`);
    console.log(`   👥 ${realTeamUsers.length} usuarios del equipo real`);
    console.log(`   📅 Sprint 10 activo (10/11 - 14/11) con 9/${projectHistory[9].plannedStories.reduce((s, st) => s + (st.score * st.quantity), 0)} pts`);
    
    console.log('\n✨ Características:');
    console.log('   • Puntos SOLO de historias planificadas');
    console.log('   • Datos realistas de 10 semanas (lunes a viernes)');
    console.log('   • Sprints completados y parciales correctos');
    console.log('   • Sprint actual con progreso realista (lun-mié)');
    
    console.log('\n🚀 Inicia tu aplicación: npm run dev');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Función para generar fechas realistas
const generateRealisticDate = (startDate, endDate, status) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (status === "Activo") {
    // Para sprint activo, generar fechas entre inicio y HOY (miércoles 13/11)
    const today = new Date("2025-11-13");
    const maxDate = today < end ? today : end;
    
    // Distribuir entre lunes, martes y miércoles
    const days = ['2025-11-10', '2025-11-11', '2025-11-12', '2025-11-13'];
    const randomDay = days[Math.floor(Math.random() * days.length)];
    const date = new Date(randomDay);
    
    // Hora laboral (9:00 - 18:00)
    date.setHours(9 + Math.floor(Math.random() * 9));
    date.setMinutes(Math.floor(Math.random() * 60));
    
    return date;
  }
  
  // Para sprints completados, distribuir en toda la semana
  const range = end.getTime() - start.getTime();
  const randomTime = start.getTime() + Math.random() * range;
  const date = new Date(randomTime);
  
  // Solo días laborables (lunes a viernes)
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  
  return date;
};

createFinalHistoricalData();