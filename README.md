# SprintFlow - Servidor (Backend)

Este repositorio contiene el backend de la aplicación SprintFlow. Provee una API RESTful para que el cliente (frontend) pueda gestionar proyectos, sprints, tareas y usuarios.

# SprintFlow API Documentation

API REST para gestión de usuarios con autenticación JWT y roles diferenciados (Admin/User).

## 🔗 Base URL

```
http://localhost:4000/api
```

## 📋 Índice

- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Códigos de Estado](#códigos-de-estado)
- [Autenticación JWT](#autenticación-jwt)
- [Roles de Usuario](#roles-de-usuario)
- [Notas](#notas)

---

## 🔐 Autenticación

### Registro de Usuario

Crea una nueva cuenta de usuario.

**Endpoint:** `POST /users/register`

**Body (JSON):**

```json
{
    "name": "Usuario",
    "email": "user@test.com",
    "password": "password123"
}
```

**Respuesta exitosa (201):**

```json
{
  "id": "uuid",
  "name": "Usuario",
  "email": "user@test.com",
  "role": "user",
}
```

---

### Login - Usuario

Inicia sesión como usuario regular.

**Endpoint:** `POST /login`

**Body (JSON):**

```json
{
  "email": "user@test.com",
  "password": "password123"
}
```

**Respuesta exitosa (200 OK):**

```json
{
  "token": "jwt_token_here",
 "userId": "uuid",
   "name": "Usuario",
  "email": "user@test.com",
   "role": "Developer" 
}
```

---

### Login - Administrador

Inicia sesión como administrador.

**Endpoint:** `POST /login`

**Body (JSON):**

```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Respuesta exitosa (200):**

```json
{
  "token": "jwt_token_here",
 "userId": "uuid",
   "name": "AdminUser",
  "email": "Adminuser@test.com",
   "role": "Admin" 
}
```

---

## 👥 Usuarios

### Obtener Todos los Usuarios (Admin)

Obtiene la lista completa de usuarios. Requiere permisos de administrador.

**Endpoint:** `GET /users`

**Headers:**

```
Authorization: Bearer {jwt_token}
```

**Respuesta exitosa (200):**

```json
[
  {
    "_id": "uuid",
    "name": "Username",
    "email": "user1@test.com",
    "role": "Developer",
    "isAdmin": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "__v": 0
  },
  {
    "_id": "uuid",
    "name": "Adminname",
    "email": "adminuser1@test.com",
    "role": "Admin",
    "isAdmin": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "__v": 0
  },
]
```

---

### Obtener Todos los Usuarios (User)

Obtiene la lista de usuarios. Los usuarios regulares no pueden ver lista de usuarios.

**Respuesta exitosa (403 FORBIDDEN):**

```json

  {
    "message": "Acceso restringido a administradores"
  }

```

---

### Obtener Usuario por ID (Admin)

Obtiene los detalles de un usuario específico. Requiere permisos de administrador.

**Endpoint:** `GET /users/:id`

**Headers:**

```
Authorization: Bearer {jwt_token}
```

**Parámetros URL:**

- `id` (string): ID del usuario

**Respuesta exitosa (200):**

```json
  {
    "_id": "uuid",
    "name": "Adminname",
    "email": "adminuser1@test.com",
    "role": "Admin",
    "isAdmin": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "__v": 0
  },
```

---

### Obtener Usuario por ID (User)

Obtiene los detalles de un usuario. Los usuarios regulares solo pueden ver su propia información.

**Respuesta exitosa (403 FORBIDDEN):**

```json

  {
    "message": "Acceso restringido a administradores",
  }

```

---

### Actualizar Rol de Usuario (Admin)

Actualiza el rol de un usuario específico. Solo administradores pueden realizar esta acción.

**Endpoint:** `PUT /api/users/:id/role`

**Headers:**

```
Authorization: Bearer {jwt_token}
```

**Parámetros URL:**

- `id` (string): ID del usuario

**Body (JSON):**

```json
{
  "role": "admin"
}
```

**Respuesta exitosa (200):**

```json
  {
    "_id": "uuid",
    "name": "Username",
    "email": "user1@test.com",
    "role": "Scrum Master",
    "isAdmin": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "__v": 0
  },
```

---

### Actualizar Rol de Usuario (User)

Los usuarios regulares no tienen permisos para actualizar roles.

**Endpoint:** `PUT /api/users/:id/role`

**Respuesta exitosa (403 FORBIDDEN):**

```json

  {
    "message": "Acceso restringido a administradores"
  }

```

---

### Eliminar Usuario (Admin)

Elimina un usuario del sistema. Requiere permisos de administrador.

**Endpoint:** `DELETE /users/:id`

**Headers:**

```
Authorization: Bearer {jwt_token}
```

**Parámetros URL:**

- `id` (string): ID del usuario a eliminar

**Respuesta exitosa (200):**

```
{
    "message": "Usuario eliminado correctamente"
}
```

---

### Eliminar Usuario (User)

Los usuarios regulares no pueden eliminar cuentas. 

**Endpoint:** `DELETE /users/:id`

**Respuesta exitosa (403 FORBIDDEN):**

```json

  {
    "message": "Acceso restringido a administradores",
  }

```

---


---

## 🔑 Autenticación JWT

Todos los endpoints protegidos requieren un token JWT en el header de autorización:

```
Authorization: Bearer {tu_token_jwt}
```

El token se obtiene al hacer login o registrarse.

---

## 👤 Roles de Usuario

### Developer (Usuario Regular)

- Puede registrarse y hacer login
- Puede ver su propia información
- **NO** puede actualizar sus propios datos
- **NO** puede eliminar su propia cuenta
- **NO** puede acceder a información de otros usuarios
- **NO** puede cambiar roles

### Admin (Administrador)

- Tiene todos los permisos de un usuario regular
- Puede ver todos los usuarios del sistema
- Puede ver información detallada de cualquier usuario
- Puede actualizar roles de otros usuarios
- Puede eliminar cualquier usuario
- Tiene acceso completo a todos los recursos

---
