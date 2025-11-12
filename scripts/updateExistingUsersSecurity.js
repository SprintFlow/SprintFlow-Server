import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const updateExistingUsers = async () => {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Modelo temporal para usuarios existentes
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    console.log('🔍 Buscando usuarios existentes...');
    const users = await User.find({});
    console.log(`👥 Encontrados ${users.length} usuarios`);

    let updatedCount = 0;

    for (const user of users) {
      // Si el usuario no tiene securityQuestion, agregarla
      if (!user.securityQuestion) {
        await User.updateOne(
          { _id: user._id },
          { 
            $set: { 
              securityQuestion: {
                question: "¿Cuál es el nombre de tu primera mascota?",
                answer: "chuli"
              },
              hasConfiguredSecurity: false
            } 
          }
        );
        updatedCount++;
        console.log(`   ✅ Actualizado: ${user.name} (${user.email})`);
      }
    }

    console.log('\n🎉 ACTUALIZACIÓN COMPLETADA!');
    console.log(`📊 Resumen: ${updatedCount} usuarios actualizados`);
    console.log('💡 Los usuarios ahora tienen pregunta de seguridad por defecto');
    console.log('🔒 Deberán configurar su propia pregunta en el primer login');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateExistingUsers();