# Lymon Backend - Sistema de Gestión Hotelera

## 🚀 Características Implementadas

### ✅ Sistema de Autenticación
- **Registro de usuarios** (`POST /auth/register`)
- **Login de usuarios** (`POST /auth/login`)
- Autenticación mediante JWT (JSON Web Tokens)
- Contraseñas encriptadas con bcrypt
- Guards de protección para rutas privadas

### 🏨 Gestión de Hoteles
- **Registro de hoteles** (`POST /hotels/register`) - Requiere autenticación
- Campos del hotel:
  - Nombre del hotel
  - Subdominio único
  - Ubicación
  - Imagen
  - Color principal (formato hexadecimal)
  - Descripción
- Relación automática con el usuario autenticado

### 🛏️ Gestión de Habitaciones
- **Crear habitación** (`POST /rooms`) - Requiere autenticación
- Campos de la habitación:
  - Número de habitación
  - Nombre descriptivo
  - Tipo de habitación (ID del room-type)
  - Piso
  - Imagen
  - Servicios incluidos (array): WiFi, TV, Aire acondicionado, etc.
  - Descripción
- **Crear tipo de habitación** (`POST /rooms/room-types`) - Requiere autenticación
- **Asignar unidades a tipo de habitación** (`POST /rooms/room-types/assign-units`) - Requiere autenticación

## 📦 Tecnologías Utilizadas

- **NestJS** - Framework backend
- **TypeScript** - Lenguaje de programación
- **MongoDB Atlas** - Base de datos (Cloud)
- **Mongoose** - ODM para MongoDB
- **Passport & JWT** - Autenticación
- **Bcrypt** - Encriptación de contraseñas
- **Swagger** - Documentación de API

## 🔧 Instalación

1. **Instalar dependencias:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configurar variables de entorno:**
   
   El archivo \`.env\` ya está configurado con:
   \`\`\`env
   MONGO_URI=yourMongoUrl
   appName=yourClusterName
   JWT_SECRET=yourJwt-Secret
   JWT_EXPIRES_IN=yourJwtExpiration
   PORT=yourPort
   NODE_ENV=development
   \`\`\`

   ⚠️ **IMPORTANTE:** Si tienes problemas de conexión a MongoDB:
   - Verifica que tu IP esté en la lista blanca de MongoDB Atlas
   - Ve a MongoDB Atlas → Network Access → Add IP Address
   - Agrega tu IP actual o usa "Allow Access from Anywhere" (0.0.0.0/0) para desarrollo

3. **Compilar el proyecto:**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Iniciar en modo desarrollo:**
   \`\`\`bash
   npm run start:dev
   \`\`\`

## 📚 Documentación de API (Swagger)

Una vez que la aplicación esté corriendo, accede a:

**http://localhost:3000/api/docs**

Aquí encontrarás la documentación interactiva completa con todos los endpoints disponibles.

## 🔐 Flujo de Uso de la Aplicación

### 1. Registrar un Usuario
\`\`\`http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "name": "Juan Pérez",
  "password": "password123"
}
\`\`\`

**Respuesta:**
\`\`\`json
{
  "user": {
    "id": "user_...",
    "email": "usuario@example.com",
    "name": "Juan Pérez"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`

### 2. Iniciar Sesión
\`\`\`http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
\`\`\`

**Respuesta:**
\`\`\`json
{
  "user": {
    "id": "user_...",
    "email": "usuario@example.com",
    "name": "Juan Pérez"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
\`\`\`

### 3. Registrar un Hotel (con token JWT)
\`\`\`http
POST /hotels/register
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "Hotel Paradise",
  "subdomain": "paradise",
  "location": "Calle Principal 123, Ciudad",
  "image": "https://example.com/hotel.jpg",
  "primaryColor": "#FF5733",
  "description": "Un hotel de lujo con vistas al mar"
}
\`\`\`

### 4. Crear una Habitación (con token JWT)
\`\`\`http
POST /rooms
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "roomTypeId": "room-type-id-123",
  "hotelId": "hotel-id-456",
  "roomNumber": "101",
  "name": "Suite Presidencial",
  "floor": 1,
  "image": "https://example.com/room.jpg",
  "amenities": ["WiFi", "TV", "Aire acondicionado", "Minibar"],
  "description": "Amplia suite con vista al mar"
}
\`\`\`

## 🗂️ Estructura del Proyecto

\`\`\`
src/
├── application/
│   └── use-cases/              # Casos de uso (lógica de negocio)
│       ├── auth.service.ts     # Registro y login
│       ├── register-hotel.use-case.ts
│       ├── create-room.use-case.ts
│       └── ...
├── domain/
│   ├── entities/               # Entidades del dominio
│   │   ├── user.entity.ts
│   │   ├── hotel.entity.ts
│   │   └── room.entity.ts
│   └── repositories/           # Interfaces de repositorios
│       ├── user.repository.ts
│       ├── hotel.repository.ts
│       └── room.repository.ts
├── infrastructure/
│   ├── auth/                   # Estrategias y guards de autenticación
│   │   ├── jwt.strategy.ts
│   │   └── jwt-auth.guard.ts
│   ├── controllers/            # Controladores HTTP
│   │   ├── auth/
│   │   ├── hotel/
│   │   └── rooms/
│   ├── dtos/                   # Data Transfer Objects
│   │   ├── register-user.dto.ts
│   │   ├── login.dto.ts
│   │   ├── register-hotel.dto.ts
│   │   └── create-room.dto.ts
│   ├── modules/                # Módulos de NestJS
│   │   ├── auth/
│   │   ├── hotels/
│   │   └── rooms/
│   └── persistence/
│       └── mongoose/           # Implementación de repositorios con Mongoose
│           ├── schemas/
│           └── repositories/
└── main.ts                     # Punto de entrada
\`\`\`

## 🔑 Autenticación JWT

Para acceder a las rutas protegidas, debes incluir el token JWT en el header:

\`\`\`
Authorization: Bearer YOUR_JWT_TOKEN
\`\`\`

El token se obtiene al hacer login o al registrarse.

## 📊 Colecciones de MongoDB

La aplicación crea automáticamente las siguientes colecciones:

- **users** - Usuarios de la plataforma
- **hotels** - Hoteles registrados
- **rooms** - Habitaciones de los hoteles
- **roomtypes** - Tipos de habitaciones

## ⚠️ Notas Importantes

1. **Seguridad:**
   - En producción, cambia el `JWT_SECRET` por uno más seguro
   - No compartas las credenciales de MongoDB Atlas
   - Configura CORS apropiadamente para tu dominio

2. **MongoDB Atlas:**
   - Si hay problemas de conexión, verifica la configuración de Network Access en MongoDB Atlas

3. **Desarrollo:**
   - La aplicación usa hot-reload en modo desarrollo
   - Los errores se muestran en la consola
   - Swagger se actualiza automáticamente

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
\`\`\`
ERROR [MongooseModule] Unable to connect to the database
\`\`\`

**Solución:**
1. Ve a MongoDB Atlas (https://cloud.mongodb.com)
2. Navega a: Network Access
3. Agrega tu IP actual o usa "0.0.0.0/0" para permitir todas las IPs
4. Espera 1-2 minutos y reinicia la aplicación

### Error de ejecución de scripts en PowerShell
\`\`\`
No se puede cargar el archivo ... porque la ejecución de scripts está deshabilitada
\`\`\`

**Solución:**
\`\`\`powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
\`\`\`

## 📞 Contacto y Soporte

Si tienes problemas o preguntas, revisa:
1. La documentación de Swagger en `/api/docs`
2. Los logs de la aplicación en la consola
3. El estado de MongoDB Atlas

## 🎯 Próximos Pasos Sugeridos

- [ ] Implementar paginación en listados
- [ ] Agregar filtros de búsqueda
- [ ] Implementar sistema de reservas
- [ ] Agregar validaciones adicionales
- [ ] Implementar roles (admin, recepcionista, etc.)
- [ ] Agregar sistema de reportes
- [ ] Implementar carga de imágenes a un servicio cloud (S3, Cloudinary, etc.)
