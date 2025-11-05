// corregirSprintsAtlas.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// FORZAR la URI de Atlas (cambia esto por tu connection string real)
const MONGODB_URI = 'mongodb+srv://tuusuario:tupassword@cluster0.xxxxx.mongodb.net/sprintflow?retryWrites=true&w=majority';

console.log('🔗 Conectando a MongoDB Atlas...');
console.log('URI:', MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Oculta password

const calculateSprintStatus = (sprint) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(sprint.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(sprint.endDate);
    endDate.setHours(0, 0, 0, 0);

    let status;
    if (today < startDate) {
        status = "Planificado";
    } else if (today >= startDate && today <= endDate) {
        status = "Activo";
    } else {
        status = "Completado";
    }
    
    if (status === "Completado") {
        const plannedPoints = sprint.plannedTotalPoints || 0;
        const completedPoints = sprint.completedPoints || 0;
        
        if (plannedPoints > 0 && completedPoints < plannedPoints) {
            return "Completado Parcial";
        }
    }
    
    return status;
};

const corregirEstadosSprints = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Conectado a MongoDB Atlas');

        const Sprint = (await import('./src/models/Sprint.js')).default;
        const sprints = await Sprint.find({});
        console.log(`📊 Encontrados ${sprints.length} sprints`);
        
        let actualizados = 0;
        
        for (const sprint of sprints) {
            const estadoCorrecto = calculateSprintStatus(sprint);
            
            if (sprint.status !== estadoCorrecto) {
                await Sprint.findByIdAndUpdate(sprint._id, { status: estadoCorrecto });
                console.log(`✅ Sprint "${sprint.name}" actualizado: ${sprint.status} → ${estadoCorrecto}`);
                actualizados++;
            } else {
                console.log(`ℹ️  Sprint "${sprint.name}" ya correcto: ${sprint.status}`);
            }
        }
        
        console.log(`🎉 ${actualizados} sprints actualizados`);
    } catch (error) {
        console.error('❌ Error conectando a Atlas:', error.message);
        console.log('💡 Verifica:');
        console.log('   1. Tu connection string en .env');
        console.log('   2. Que tu IP esté en la whitelist de Atlas');
        console.log('   3. Tu usuario y contraseña');
    } finally {
        await mongoose.connection.close();
        console.log('🔒 Conexión cerrada');
    }
};

corregirEstadosSprints();