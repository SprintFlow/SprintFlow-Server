// scripts/fixDatabase.js
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Diagnóstico de configuración de base de datos\n');

// Leer el archivo .env
const envPath = join(__dirname, '../.env');
let envContent = '';

if (existsSync(envPath)) {
  envContent = readFileSync(envPath, 'utf8');
  console.log('📄 Contenido de .env:');
  console.log('-------------------');
  console.log(envContent);
  console.log('-------------------\n');
} else {
  console.log('❌ No existe archivo .env\n');
}

// Buscar variables de base de datos
const dbVars = envContent.match(/.*(MONGO|DATABASE|DB|URL).*=.*/g) || [];
console.log('🔎 Variables de BD encontradas:');
if (dbVars.length > 0) {
  dbVars.forEach(variable => {
    // Ocultar contraseñas
    const safeVar = variable.replace(/:([^@]+)@/, ':***@');
    console.log(`   📍 ${safeVar}`);
  });
} else {
  console.log('   ❌ Ninguna variable de BD encontrada');
}

console.log('\n💡 SOLUCIONES:');
console.log('1. Si usas MongoDB Atlas, agrega esto a .env:');
console.log('   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/sprintflow');
console.log('\n2. Si quieres probar local, usa:');
console.log('   MONGODB_URI=mongodb://localhost:27017/sprintflow');
console.log('\n3. Luego ejecuta: node scripts/populateAtlas.js');

// Crear .env temporal si no existe
if (!existsSync(envPath)) {
  console.log('\n🎯 Creando .env temporal...');
  const fs = await import('fs');
  fs.writeFileSync(envPath, 'MONGODB_URI=mongodb://localhost:27017/sprintflow\n');
  console.log('✅ .env creado con configuración local');
}