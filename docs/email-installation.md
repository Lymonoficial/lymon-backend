# Instalación del Sistema de Correos

## 📦 Dependencias Requeridas

El sistema de correos requiere las siguientes dependencias de npm:

```bash
npm install nodemailer @types/nodemailer
```

O si prefieres usar pnpm:

```bash
pnpm install nodemailer @types/nodemailer
```

## ⚙️ Configuración

### 1. Instalar las dependencias

Ejecuta el comando de instalación desde la raíz del proyecto.

### 2. Configurar variables de entorno

Edita el archivo `.env` en la raíz del proyecto:

```env
# Email Configuration (Outlook)
EMAIL_USER=Lymonoficial@outlook.com
EMAIL_PASSWORD=tu_contraseña_aquí
```

### 3. Configurar Outlook

Para que el sistema funcione con Outlook, necesitas:

#### Opción A: Contraseña de Aplicación (Recomendado)

1. Inicia sesión en tu cuenta de Outlook
2. Ve a **Seguridad** > **Opciones de seguridad avanzadas**
3. En **Seguridad adicional**, selecciona **Crear una contraseña de aplicación**
4. Copia la contraseña generada
5. Úsala en el campo `EMAIL_PASSWORD` del archivo `.env`

#### Opción B: Permitir acceso de aplicaciones menos seguras

1. Ve a la configuración de seguridad de tu cuenta Microsoft
2. Activa "Permitir el acceso de aplicaciones menos seguras"
3. Usa tu contraseña normal en `EMAIL_PASSWORD`

**⚠️ Nota de seguridad:** La opción A es más segura y es la recomendada por Microsoft.

### 4. Reiniciar el servidor

Después de instalar las dependencias y configurar las variables de entorno:

```bash
npm run start:dev
```

El servidor debería mostrar:
```
✅ Email service is ready to send emails
```

Si ves un error, verifica tu configuración en `.env`.

## 🧪 Prueba de Configuración

### Endpoint de Prueba

Después de iniciar el servidor, puedes probar que el correo funciona:

```bash
POST http://localhost:3000/email-templates/test
Authorization: Bearer {tu-jwt-token}
Content-Type: application/json

{
  "to": "tu-email@example.com"
}
```

Si todo está bien configurado, recibirás un correo de prueba.

## 🔧 Solución de Problemas

### Error: "Cannot find module 'nodemailer'"

**Solución:** Ejecuta `npm install nodemailer @types/nodemailer`

### Error: "Error connecting to email service"

**Posibles causas:**
1. Credenciales incorrectas en `.env`
2. Outlook bloqueando el acceso SMTP
3. Firewall bloqueando el puerto 587

**Solución:**
1. Verifica `EMAIL_USER` y `EMAIL_PASSWORD` en `.env`
2. Usa una contraseña de aplicación en lugar de la contraseña normal
3. Verifica que tu firewall permita conexiones salientes al puerto 587

### El servidor no detecta las variables de entorno

**Solución:**
1. Asegúrate de que el archivo `.env` esté en la raíz del proyecto
2. Reinicia completamente el servidor
3. Verifica que no haya espacios extras en las variables del `.env`

## 📁 Archivos Creados

El sistema de correos incluye los siguientes archivos:

### Dominio
- `src/domain/entities/email-template.entity.ts`
- `src/domain/repositories/email-template.repository.ts`

### Infraestructura
- `src/infrastructure/persistence/mongoose/email-template.schema.ts`
- `src/infrastructure/persistence/mongoose/repositories/email-template.repository.ts`
- `src/infrastructure/dtos/create-email-template.dto.ts`
- `src/infrastructure/dtos/update-email-template.dto.ts`
- `src/infrastructure/dtos/send-email.dto.ts`
- `src/infrastructure/controllers/email/email.controller.ts`
- `src/infrastructure/modules/email/email.module.ts`

### Aplicación
- `src/application/services/email.service.ts`
- `src/application/use-cases/create-email-template.use-case.ts`
- `src/application/use-cases/update-email-template.use-case.ts`
- `src/application/use-cases/send-email.use-case.ts`
- `src/application/use-cases/get-email-templates.use-case.ts`

### Documentación
- `docs/email-system.md` - Documentación completa del sistema

## ✅ Verificación Final

Después de la instalación, verifica que:

- [ ] Las dependencias están instaladas (`node_modules/nodemailer` existe)
- [ ] El archivo `.env` tiene `EMAIL_USER` y `EMAIL_PASSWORD` configurados
- [ ] El servidor inicia sin errores
- [ ] Ves el mensaje "✅ Email service is ready to send emails" en los logs
- [ ] El endpoint `/email-templates/test` funciona correctamente

## 🚀 Siguiente Paso

Lee la documentación completa en `docs/email-system.md` para aprender a:
- Crear plantillas de correo personalizadas
- Enviar correos automáticos
- Integrar el sistema con tus reservas
- Usar variables en las plantillas
