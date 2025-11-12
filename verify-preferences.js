// Script para verificar preferencias en la base de datos
import mongoose from 'mongoose';
import User from './src/models/UserModel.js';
import 'dotenv/config';

const verifyPreferences = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB\n');

        const users = await User.find({}).select('name email preferences avatar');
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 PREFERENCIAS Y AVATARS POR USUARIO');
        console.log('═══════════════════════════════════════════════════════\n');
        
        if (users.length === 0) {
            console.log('⚠️  No hay usuarios en la base de datos\n');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. 👤 ${user.name}`);
                console.log(`   📧 Email: ${user.email}`);
                console.log(`   📷 Avatar: ${user.avatar ? '✅ SÍ (' + user.avatar.substring(0, 30) + '...)' : '❌ NO'}`);
                
                if (user.preferences) {
                    console.log(`   ⚙️  Preferencias:`);
                    console.log(`      📧 Notificaciones Email: ${user.preferences.emailNotifications ? '✅ ACTIVADAS' : '❌ DESACTIVADAS'}`);
                    console.log(`      🔔 Recordatorios Diarios: ${user.preferences.dailyReminders ? '✅ ACTIVADOS' : '❌ DESACTIVADOS'}`);
                } else {
                    console.log(`   ⚙️  Preferencias: ⚠️  No configuradas (se usarán valores por defecto)`);
                }
                console.log('');
            });
            
            console.log('═══════════════════════════════════════════════════════');
            console.log(`📊 RESUMEN:`);
            console.log(`   Total de usuarios: ${users.length}`);
            console.log(`   Con avatar: ${users.filter(u => u.avatar).length}`);
            console.log(`   Con preferencias configuradas: ${users.filter(u => u.preferences).length}`);
            console.log('═══════════════════════════════════════════════════════\n');
        }

        await mongoose.connection.close();
        console.log('🔌 Desconectado de MongoDB');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

verifyPreferences();
