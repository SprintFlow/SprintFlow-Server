# SprintFlow API - Endpoints Disponibles

## ✅ RUTAS ARREGLADAS
Los errores 404 que aparecían en tu frontend han sido solucionados:

### 🔐 Autenticación (`/api/auth`)
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - **✅ NUEVO** - Obtener usuario actual (requiere token)

### 👤 Usuarios (`/api/users`)
- `POST /api/users/register` - Registrar usuario
- `POST /api/users/login` - Iniciar sesión
- `GET /api/users/profile` - **✅ NUEVO** - Obtener perfil del usuario actual (requiere token)
- `GET /api/users` - Obtener todos los usuarios (admin)
- `GET /api/users/:id` - Obtener usuario por ID (admin)
- `PUT /api/users/:id/role` - Actualizar rol de usuario (admin)
- `DELETE /api/users/:id` - Eliminar usuario (admin)

### 🏃‍♂️ Sprints (`/api/sprints`)
- Rutas disponibles según la configuración actual

### 📖 Historias (`/api/stories`)
- Rutas disponibles según la configuración actual

### ✅ Completions (`/api/completions`)
- Rutas disponibles según la configuración actual

### ⚙️ Configuración (`/api/configuration`)
- `GET /api/configuration` - **✅ NUEVO** - Información del servidor
- `GET /api/configuration/client` - **✅ NUEVO** - Configuración para el cliente

## 🔧 CÓMO USAR LAS NUEVAS RUTAS

### Para obtener información del usuario actual:
```javascript
// Opción 1: Usar /api/auth/me
fetch('http://localhost:4000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

// Opción 2: Usar /api/users/profile  
fetch('http://localhost:4000/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Para obtener configuración del servidor:
```javascript
fetch('http://localhost:4000/api/configuration')
// o
fetch('http://localhost:4000/api/configuration/client')
```

## 📝 NOTAS IMPORTANTES

1. **Servidor corriendo en puerto 4000** - No en 5174
2. **CORS habilitado** - Permite conexiones desde tu frontend
3. **JWT Authentication** - Las rutas protegidas requieren token en header Authorization
4. **Base de datos conectada** - MongoDB funcionando correctamente

Los errores 404 que veías ahora deberían estar resueltos ✅
