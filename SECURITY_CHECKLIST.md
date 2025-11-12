# 🛡️ Checklist de Seguridad para Tests

Este documento garantiza que tus tests NUNCA tocarán tu base de datos de producción en MongoDB Atlas.

## ✅ Antes de ejecutar tests por primera vez

Verifica estos puntos en orden:

### 1. Verificar archivo `.env`
```bash
# Tu .env debe tener tu MongoDB Atlas (producción)
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/sprintflow
JWT_SECRET=tu_secret_aqui
PORT=4000
NODE_ENV=development
```

### 2. Crear archivo `.env.test`
```bash
# Este archivo SOLO tiene configuración de test
# NO incluir MONGO_URI aquí (MongoDB Memory Server se encarga)
NODE_ENV=test
JWT_SECRET=test_secret_key_for_testing_only_12345
JWT_EXPIRES_IN=24h
```

### 3. Verificar `src/test/setup.test.js`
Debe tener esta línea:
```javascript
mongoServer = await MongoMemoryServer.create();
```

### 4. Verificar `index.js`
Debe tener esta protección al inicio:
```javascript
if (process.env.NODE_ENV === 'test') {
  console.log('🧪 Modo TEST activado - Servidor NO iniciado');
  process.exit(0);
}
```

### 5. Instalar dependencias
```bash
npm install --save-dev cross-env
```

---

## 🔍 Verificación Visual - Qué debes ver

### ✅ AL EJECUTAR TESTS (npm test)
```
🛡️  INICIANDO TESTS EN MODO SEGURO (MongoDB en memoria)
✅ Tu base de datos de Atlas NO será tocada

🧪 Conectando a MongoDB en MEMORIA (seguro)...
📍 URI: mongodb://127.0.0.1:54321/
✅ Conectado a MongoDB en memoria
```

### ❌ NUNCA debes ver esto
```
mongodb+srv://...mongodb.net
Conectado a MongoDB Atlas
```

Si ves esto, **DETÉN INMEDIATAMENTE** con `Ctrl+C`

---

## 🚨 Si algo sale mal

### Problema 1: Se conecta a Atlas durante tests
**Solución:**
1. Detén todo: `Ctrl+C`
2. Verifica que `index.js` tenga la protección de `NODE_ENV=test`
3. Verifica que uses `cross-env NODE_ENV=test` en tus scripts
4. Ejecuta: `npm run test:safe`

### Problema 2: Tests fallan con error de conexión
**Solución:**
1. Verifica que `mongodb-memory-server` esté instalado:
```bash
   npm install --save-dev mongodb-memory-server
```
2. Elimina caché: `npm run clean`
3. Reintentar: `npm test`

### Problema 3: Tests muy lentos
**Solución:**
- MongoDB Memory Server tarda en la primera ejecución
- Espera hasta 60 segundos la primera vez
- Las siguientes ejecuciones serán rápidas

---

## 📊 Comandos Seguros
```bash
# ✅ SIEMPRE SEGURO - Verifica primero
npm run test:safe

# ✅ SEGURO - Suite completa
npm test

# ✅ SEGURO - Modo desarrollo
npm run test:watch

# ✅ SEGURO - Test individual
npm run test:auth
npm run test:sprint
npm run test:user

# ❌ NO EJECUTAR - Esto inicia el servidor real
npm run dev
npm start
```

---

## 🎯 Resumen de Protecciones

| Capa | Protección | Estado |
|------|------------|--------|
| 1 | MongoDB Memory Server (DB en RAM) | ✅ |
| 2 | NODE_ENV=test en todos los scripts | ✅ |
| 3 | Bloqueo en index.js | ✅ |
| 4 | cross-env multiplataforma | ✅ |
| 5 | --runInBand (tests secuenciales) | ✅ |
| 6 | Limpieza automática afterEach | ✅ |

**Tu MongoDB Atlas está 100% protegido** 🛡️

---

## 📞 Soporte

Si tienes dudas sobre la seguridad de los tests:
1. Lee este documento completamente
2. Ejecuta `npm run test:safe` primero
3. Verifica los logs que aparecen en consola
4. Si ves "mongodb.net", detén inmediatamente

**Última actualización:** $(date)