# 🗄️ Configuración de MongoDB - SprintFlow

## 📋 Estructura de la Base de Datos

MongoDB es una base de datos NoSQL que **NO requiere crear tablas manualmente**. Las colecciones (equivalentes a tablas en SQL) se crean automáticamente cuando insertas el primer documento.

### Colecciones que se crearán automáticamente:

#### 1️⃣ **users** (Modelo: UserModel.js)
```javascript
{
  _id: ObjectId,
  name: String,              // Nombre del usuario
  email: String,             // Email único
  password: String,          // Contraseña hasheada
  role: String,              // "Developer" | "QA" | "Scrum Master" | "Admin"
  isAdmin: Boolean,          // true/false
  createdAt: Date,           // Fecha de creación
  updatedAt: Date            // Fecha de última actualización
}
```

#### 2️⃣ **completions** (Modelo: Completion.js)
```javascript
{
  _id: ObjectId,
  sprintId: ObjectId,                  // Referencia al sprint
  userId: ObjectId,                    // Referencia al usuario
  completedStories: [                  // Historias completadas
    {
      score: Number,                   // Puntos de la historia
      quantity: Number                 // Cantidad completada
    }
  ],
  totalCompletedPoints: Number,        // Total de puntos calculados
  interruptions: Array,                // Interrupciones registradas
  notes: String,                       // Notas adicionales
  submissionDate: Date,                // Fecha de envío
  createdAt: Date,
  updatedAt: Date
}
```

#### 3️⃣ **sprints** (Modelo: Sprint.js)
Según tu estructura, esta colección almacena la información de los sprints.

#### 4️⃣ **stories** (Modelo: StoryModel.js)
Almacena las historias de usuario.

---

## 🚀 Configuración Inicial

### Opción 1: MongoDB Local (Desarrollo)

1. **Instalar MongoDB Community Edition:**
   - Descarga desde: https://www.mongodb.com/try/download/community
   - Sigue las instrucciones de instalación para Windows

2. **Iniciar MongoDB:**
   ```bash
   # En Windows, MongoDB suele iniciarse como servicio automático
   # Si no, ejecuta:
   mongod
   ```

3. **Configurar .env:**
   ```env
   MONGO_URI=mongodb://localhost:27017/sprintflow
   ```

### Opción 2: MongoDB Atlas (Recomendado para Producción)

1. **Crear cuenta en MongoDB Atlas:**
   - Ve a: https://www.mongodb.com/cloud/atlas
   - Crea una cuenta gratuita

2. **Crear un Cluster:**
   - Selecciona el plan FREE (M0)
   - Elige la región más cercana
   - Dale un nombre a tu cluster

3. **Configurar acceso:**
   - Crea un usuario de base de datos
   - Añade tu IP a la whitelist (o usa 0.0.0.0/0 para desarrollo)

4. **Obtener la cadena de conexión:**
   - Click en "Connect" → "Connect your application"
   - Copia la URI de conexión
   - Reemplaza `<password>` con tu contraseña

5. **Configurar .env:**
   ```env
   MONGO_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/sprintflow?retryWrites=true&w=majority
   ```

---

## ✅ Verificación de Conexión

### 1. Crear archivo .env
```bash
# En la raíz del proyecto SprintFlow-Server
cp .env.example .env
```

### 2. Editar .env con tus credenciales
```env
PORT=4000
MONGO_URI=tu_uri_de_mongodb_aqui
JWT_SECRET=tu_secreto_aqui
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Iniciar el servidor
```bash
cd SprintFlow-Server
npm install
npm start
```

### 4. Verificar en consola
Deberías ver:
```
✅ Conectado a MongoDB correctamente
🚀 Servidor corriendo en http://localhost:4000
```

---

## 🔍 Índices Importantes

MongoDB creará automáticamente estos índices al insertar datos:

1. **users.email** - Índice único para evitar emails duplicados
2. **completions (sprintId + userId)** - Índice único compuesto

---

## 📊 Endpoints que utilizan MongoDB

### Usuarios (users collection):
- `POST /api/auth/register` - Crea nuevo usuario
- `POST /api/auth/login` - Busca usuario por email
- `GET /api/auth/me` - Obtiene usuario actual + estadísticas
- `GET /api/users/me` - Perfil completo con estadísticas
- `PUT /api/users/profile` - Actualiza nombre/email
- `PUT /api/users/change-password` - Actualiza contraseña
- `GET /api/users` - Lista todos los usuarios (Admin)
- `POST /api/users` - Crea usuario (Admin)
- `PUT /api/users/:id` - Actualiza usuario (Admin)
- `DELETE /api/users/:id` - Elimina usuario (Admin)

### Completions (completions collection):
- Utilizada en `/api/auth/me` y `/api/users/me` para calcular:
  - **totalPoints**: Suma de `totalCompletedPoints`
  - **completedStories**: Cuenta de historias en array `completedStories`

---

## 🛠️ Comandos Útiles

### Conexión directa con MongoDB (si usas local):
```bash
# Abrir shell de MongoDB
mongosh

# Ver bases de datos
show dbs

# Usar la base de datos sprintflow
use sprintflow

# Ver colecciones
show collections

# Ver usuarios
db.users.find().pretty()

# Ver completions
db.completions.find().pretty()

# Contar documentos
db.users.countDocuments()
db.completions.countDocuments()
```

### Si usas MongoDB Compass (GUI):
1. Descarga MongoDB Compass: https://www.mongodb.com/products/compass
2. Conecta usando tu MONGO_URI
3. Navega visualmente por tus colecciones

---

## ⚠️ Notas Importantes

### ❌ NO necesitas:
- Crear tablas manualmente
- Ejecutar scripts SQL
- Crear esquemas antes de usar la BD
- Migrar bases de datos

### ✅ SÍ necesitas:
- Tener MongoDB corriendo (local) o MongoDB Atlas configurado
- Configurar correctamente el archivo .env
- Asegurarte que la URI de conexión sea correcta
- Tener los modelos correctamente definidos (ya los tienes)

---

## 🐛 Troubleshooting

### Error: "MongoServerError: bad auth"
- Verifica usuario y contraseña en MONGO_URI
- Asegúrate de escapar caracteres especiales en la contraseña

### Error: "ECONNREFUSED"
- MongoDB no está corriendo (si es local)
- Verifica que el servicio de MongoDB esté activo

### Error: "MongooseServerSelectionError"
- Problema de red o firewall
- En Atlas: verifica la whitelist de IPs
- Verifica que la URI sea correcta

### Error: "Collection already exists"
- No es un error crítico, MongoDB maneja esto automáticamente

---

## 📝 Resumen

**¿Necesitas crear tablas?** ❌ NO

**¿Qué debes hacer?**
1. ✅ Instalar MongoDB o crear cuenta en Atlas
2. ✅ Configurar `.env` con tu MONGO_URI
3. ✅ Iniciar el servidor
4. ✅ Las colecciones se crean automáticamente al usar los endpoints

**Las colecciones se crearán automáticamente cuando:**
- Registres el primer usuario → crea `users`
- Se complete el primer sprint → crea `completions`
- Se cree el primer sprint → crea `sprints`
- Se cree la primera historia → crea `stories`

¡MongoDB se encarga de todo! 🎉
