// scripts/organizeWithMemoryDB.js
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  let mongod;
  
  try {
    console.log('🚀 Iniciando MongoDB en memoria...');
    
    // Crear servidor MongoDB en memoria
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    console.log('📡 Conectando a MongoDB en memoria...');
    await mongoose.connect(uri);
    console.log('✅ MongoDB en memoria conectado');

    // Importar modelos
    const { Sprint, PointsRegistry, User } = await importModels();
    
    // Crear usuarios de prueba temporalmente
    const users = await User.create([
      { name: "Guissella", email: "guissella@example.com", password: "temp123", role: "Developer" },
      { name: "Paloma", email: "paloma@example.com", password: "temp123", role: "Developer" },
      { name: "Sofía", email: "sofia@example.com", password: "temp123", role: "Developer" },
      { name: "Valentina", email: "valentina@example.com", password: "temp123", role: "Developer" },
      { name: "Aday", email: "aday@example.com", password: "temp123", role: "Developer" },
      { name: "Mari Carmen", email: "mcarmen@example.com", password: "temp123", role: "Developer" }
    ]);
    
    console.log(`👥 Usuarios creados: ${users.map(u => u.name).join(', ')}`);

    // ... (el resto de tu script igual)
    const projectHistorySprints = [
      // Tus fases del proyecto aquí...
    ];

    console.log(`📅 Procesando ${projectHistorySprints.length} fases...`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const sprintData of projectHistorySprints) {
      // ... (tu lógica de creación de sprints)
    }

    console.log('\n🎉 DATOS CREADOS EXITOSAMENTE!');
    console.log('💡 Estos datos son temporales (en memoria)');
    console.log('📊 Para datos permanentes, instala MongoDB');
    
    // Mantener la conexión abierta un momento
    setTimeout(async () => {
      await mongoose.connection.close();
      await mongod.stop();
      console.log('🔌 Conexión cerrada');
      process.exit(0);
    }, 3000);

  } catch (error) {
    console.error('❌ Error:', error);
    if (mongod) await mongod.stop();
    process.exit(1);
  }
};

// Instalar la dependencia primero
console.log('📦 Instalando mongodb-memory-server...');
organizeProjectHistorySprints();