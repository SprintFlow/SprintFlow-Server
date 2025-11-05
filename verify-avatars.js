// Script para verificar avatars en la base de datos
import mongoose from 'mongoose';
import User from './src/models/UserModel.js';
import 'dotenv/config';

const verifyAvatars = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Conectado a MongoDB');

        const users = await User.find({}).select('name email avatar');
        
        console.log('\n📊 AVATARS POR USUARIO:\n');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email})`);
            console.log(`   Avatar: ${user.avatar ? 'SÍ (' + user.avatar.substring(0, 50) + '...)' : 'NO'}`);
            console.log('');
        });

        await mongoose.connection.close();
        console.log('🔌 Desconectado de MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
    }
};

verifyAvatars();
