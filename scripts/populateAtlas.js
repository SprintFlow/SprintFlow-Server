// scripts/populateAtlas.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env desde la raíz del proyecto
dotenv.config({ path: join(__dirname, '../.env') });

// Usar MONGO_URI (que ya tienes) en lugar de MONGODB_URI
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

console.log('🔍 Variables de entorno:');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Definida' : '❌ No definida');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Definida' : '❌ No definida');
console.log('📡 URL usada:', MONGODB_URI ? '✅ Disponible' : '❌ No disponible');

const populateAtlas = async () => {
  try {
    // Verificar que tenemos una URI
    if (!MONGODB_URI) {
      console.log('❌ ERROR: No se encontró URI de MongoDB');
      console.log('💡 Tu .env tiene MONGO_URI pero el script necesita MONGODB_URI');
      console.log('🔧 Ejecuta este comando para solucionarlo:');
      console.log('   echo "MONGODB_URI=$MONGO_URI" >> .env');
      process.exit(1);
    }

    console.log('🚀 Conectando a MongoDB Atlas...');
    console.log('📡 Cluster: SprintFlow');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas exitosamente!');

    // El resto del script igual...
    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      isAdmin: Boolean,
      avatar: String
    }, { timestamps: true }));

    const Sprint = mongoose.model('Sprint', new mongoose.Schema({
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
    }, { timestamps: true }));

    const PointsRegistry = mongoose.model('PointsRegistry', new mongoose.Schema({
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
    }, { timestamps: true }));

    console.log('🔍 Verificando usuarios existentes...');
    let users = await User.find({});
    
    if (users.length === 0) {
      console.log('👥 Creando usuarios del equipo...');
      users = await User.create([
        { name: "Guissella", email: "guissella@example.com", password: "temp123", role: "Developer", isAdmin: false },
        { name: "Paloma", email: "paloma@example.com", password: "temp123", role: "Developer", isAdmin: false },
        { name: "Sofía", email: "sofia@example.com", password: "temp123", role: "Developer", isAdmin: false },
        { name: "Valentina", email: "valentina@example.com", password: "temp123", role: "Developer", isAdmin: false },
        { name: "Aday", email: "aday@example.com", password: "temp123", role: "Developer", isAdmin: false },
        { name: "Mari Carmen", email: "mcarmen@example.com", password: "temp123", role: "Developer", isAdmin: false }
      ]);
      console.log(`✅ Usuarios creados: ${users.map(u => u.name).join(', ')}`);
    } else {
      console.log(`✅ Usuarios existentes: ${users.map(u => u.name).join(', ')}`);
    }

    // HISTORIA DEL PROYECTO
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
    let pointsCount = 0;

    for (const sprintData of projectHistory) {
      // Verificar si el sprint ya existe
      let sprint = await Sprint.findOne({ name: sprintData.name });
      
      if (!sprint) {
        // Determinar equipo
        let teamMembers;
        if (sprintData.name.includes("Fase 1") || sprintData.name.includes("Fase 2")) {
          teamMembers = users.slice(0, 2);
        } else if (sprintData.name.includes("Fase 3") || sprintData.name.includes("Fase 4") || 
                   sprintData.name.includes("Fase 5") || sprintData.name.includes("Fase 6")) {
          teamMembers = users.slice(0, 4);
        } else {
          teamMembers = users;
        }

        // Crear sprint
        sprint = await Sprint.create({
          name: sprintData.name,
          startDate: sprintData.startDate,
          endDate: sprintData.endDate,
          adminId: users[0]._id,
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

        console.log(`   ✅ CREADO: ${sprintData.name}`);
        sprintCount++;

        // Crear registros de puntos
        if (sprintData.status !== "Planificado") {
          const pointsCreated = await createPointsRegistries(sprint, users, sprintData, PointsRegistry, Sprint);
          pointsCount += pointsCreated;
        }
      } else {
        console.log(`   ⏩ YA EXISTE: ${sprintData.name}`);
      }
    }

    console.log('\n🎉 DATOS POBLADOS EXITOSAMENTE EN MONGODB ATLAS!');
    console.log('📊 Resumen:');
    console.log(`   ✅ ${sprintCount} sprints creados`);
    console.log(`   📝 ${pointsCount} registros de puntos`);
    console.log(`   👥 ${users.length} desarrolladores`);
    console.log('\n🚀 Ahora puedes ver los datos en tu aplicación web!');
    console.log('💻 Inicia el servidor: npm run dev');
    
    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Funciones auxiliares
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

const createPointsRegistries = async (sprint, users, sprintData, PointsRegistry, Sprint) => {
  const teamMembers = sprint.usersAssigned || [];
  const completionPercent = sprintData.status === "Activo" 
    ? sprintData.targetCompletion 
    : (sprintData.targetCompletion / sprintData.plannedPoints) * 100;

  const registries = [];
  let totalCompleted = 0;

  for (const member of teamMembers) {
    const user = users.find(u => u._id.toString() === member.userId.toString());
    if (!user) continue;

    const performance = getUserPerformance(user.name);
    const basePoints = (sprintData.plannedPoints / teamMembers.length) * (completionPercent / 100);
    const variedPoints = basePoints * performance * (0.9 + Math.random() * 0.2);
    const userPoints = Math.max(1, Math.round(variedPoints));
    
    totalCompleted += userPoints;

    registries.push({
      userId: user._id,
      sprintId: sprint._id,
      stories: generateUserStories(userPoints),
      totalPoints: userPoints,
      isInterruption: Math.random() < 0.2,
      registeredAt: generateDate(sprintData.startDate, sprintData.endDate, sprintData.status)
    });
  }

  if (registries.length > 0) {
    await PointsRegistry.insertMany(registries);
    await Sprint.findByIdAndUpdate(sprint._id, { completedPoints: totalCompleted });
    
    const completionRate = Math.round((totalCompleted/sprintData.plannedPoints)*100);
    const statusIcon = sprintData.status === "Completado" ? "✅" : sprintData.status === "Activo" ? "🔵" : "🟡";
    console.log(`      ${statusIcon} ${totalCompleted}/${sprintData.plannedPoints} pts (${completionRate}%) - ${registries.length} registros`);
    
    return registries.length;
  }
  return 0;
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

populateAtlas();