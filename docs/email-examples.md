# Ejemplos de Uso - Sistema de Correos

Esta guía proporciona ejemplos prácticos de cómo usar el sistema de correos en Postman.

## 🔑 Autenticación

Todos los endpoints requieren un token JWT. Primero obtén tu token:

```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "tu-email@example.com",
  "password": "tu-password"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Copia el token** y úsalo en todos los siguientes requests como:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📧 Ejemplos de Plantillas

### 1. Crear Plantilla de Bienvenida

```http
POST http://localhost:3000/email-templates
Content-Type: application/json
Authorization: Bearer {tu-token}

{
  "hotelId": "675fb26f9154c4dde1c80aa1",
  "type": "welcome",
  "subject": "¡Bienvenido a {{hotelName}}, {{guestName}}!",
  "body": "<div style='font-family: Arial, sans-serif; padding: 20px;'><h1 style='color: #2c3e50;'>¡Hola {{guestName}}!</h1><p>Es un placer recibirte en <strong>{{hotelName}}</strong>.</p><div style='background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;'><h3>Detalles de tu Reserva:</h3><ul><li>🚪 Habitación: <strong>{{roomNumber}}</strong></li><li>📅 Check-in: <strong>{{checkInDate}}</strong></li><li>📅 Check-out: <strong>{{checkOutDate}}</strong></li><li>🔑 Código: <strong>{{confirmationCode}}</strong></li></ul></div><p>¡Esperamos que disfrutes tu estadía!</p><hr style='margin: 30px 0;'><p style='color: #7f8c8d; font-size: 12px;'>{{hotelName}} - Este es un correo automático</p></div>",
  "isActive": true
}
```

### 2. Crear Plantilla de Instrucciones de Llegada

```http
POST http://localhost:3000/email-templates
Content-Type: application/json
Authorization: Bearer {tu-token}

{
  "hotelId": "675fb26f9154c4dde1c80aa1",
  "type": "arrival_instructions",
  "subject": "Instrucciones de llegada - {{hotelName}}",
  "body": "<div style='font-family: Arial, sans-serif; padding: 20px;'><h1 style='color: #2c3e50;'>Hola {{guestName}}</h1><p>Tu reserva en <strong>{{hotelName}}</strong> está confirmada para el <strong>{{checkInDate}}</strong>.</p><div style='background-color: #e8f4f8; padding: 20px; border-radius: 5px; margin: 20px 0;'><h3>📍 Cómo llegar:</h3><p><strong>Dirección:</strong> Av. Principal 123, Centro Histórico</p><p><strong>Horario de Check-in:</strong> 3:00 PM - 11:00 PM</p><p>Si llegas antes de las 3:00 PM, con gusto guardaremos tu equipaje.</p></div><div style='background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;'><h3>🅿️ Estacionamiento:</h3><p>Contamos con estacionamiento gratuito. Menciona tu habitación en recepción.</p></div><div style='background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0;'><h3>📱 Contacto:</h3><p>WhatsApp: +52 123 456 7890</p><p>Email: recepcion@hotel.com</p></div><p><strong>Tu código de confirmación:</strong> {{confirmationCode}}</p><p>¡Nos vemos pronto!</p></div>",
  "isActive": true
}
```

### 3. Crear Plantilla de Encuesta de Satisfacción

```http
POST http://localhost:3000/email-templates
Content-Type: application/json
Authorization: Bearer {tu-token}

{
  "hotelId": "675fb26f9154c4dde1c80aa1",
  "type": "satisfaction_survey",
  "subject": "¿Cómo fue tu experiencia en {{hotelName}}?",
  "body": "<div style='font-family: Arial, sans-serif; padding: 20px;'><h1 style='color: #2c3e50;'>Gracias por tu visita, {{guestName}}</h1><p>Esperamos que hayas disfrutado tu estadía en <strong>{{hotelName}}</strong>.</p><div style='background-color: #f0f8ff; padding: 30px; border-radius: 10px; margin: 30px 0; text-align: center;'><h3 style='margin-bottom: 20px;'>¿Nos ayudas con tu opinión?</h3><p style='margin-bottom: 25px;'>Tu feedback es muy importante para seguir mejorando.</p><a href='https://forms.google.com/survey?code={{confirmationCode}}' style='display: inline-block; background-color: #3498db; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold;'>Completar Encuesta (2 minutos)</a></div><div style='background-color: #fffacd; padding: 20px; border-radius: 5px; text-align: center;'><p style='margin: 0; font-size: 18px;'><strong>🎁 Regalo Especial</strong></p><p>Como agradecimiento, recibe un <strong>15% de descuento</strong> en tu próxima reserva.</p></div><hr style='margin: 30px 0;'><p style='color: #7f8c8d; font-size: 14px;'>¿Tuviste algún problema? Contáctanos: soporte@hotel.com</p></div>",
  "isActive": true
}
```

---

## 📨 Enviar Correos

### Ejemplo 1: Enviar Correo de Bienvenida

```http
POST http://localhost:3000/email-templates/send
Content-Type: application/json
Authorization: Bearer {tu-token}

{
  "hotelId": "675fb26f9154c4dde1c80aa1",
  "templateType": "welcome",
  "to": "cliente@example.com",
  "variables": {
    "guestName": "Juan Pérez",
    "hotelName": "Hotel Paradise",
    "roomNumber": "301",
    "checkInDate": "15 de febrero de 2026",
    "checkOutDate": "18 de febrero de 2026",
    "confirmationCode": "ABC123XYZ"
  }
}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Email sent successfully to cliente@example.com"
}
```

### Ejemplo 2: Enviar Instrucciones de Llegada

```http
POST http://localhost:3000/email-templates/send
Content-Type: application/json
Authorization: Bearer {tu-token}

{
  "hotelId": "675fb26f9154c4dde1c80aa1",
  "templateType": "arrival_instructions",
  "to": "maria.garcia@example.com",
  "variables": {
    "guestName": "María García",
    "hotelName": "Hotel Paradise",
    "checkInDate": "20 de febrero de 2026",
    "confirmationCode": "XYZ789ABC"
  }
}
```

### Ejemplo 3: Enviar Encuesta de Satisfacción

```http
POST http://localhost:3000/email-templates/send
Content-Type: application/json
Authorization: Bearer {tu-token}

{
  "hotelId": "675fb26f9154c4dde1c80aa1",
  "templateType": "satisfaction_survey",
  "to": "carlos.lopez@example.com",
  "variables": {
    "guestName": "Carlos López",
    "hotelName": "Hotel Paradise",
    "confirmationCode": "DEF456GHI"
  }
}
```

---

## 📋 Consultar Plantillas

### Obtener todas las plantillas de un hotel

```http
GET http://localhost:3000/email-templates?hotelId=675fb26f9154c4dde1c80aa1
Authorization: Bearer {tu-token}
```

**Respuesta:**
```json
[
  {
    "id": "template-id-1",
    "hotelId": "675fb26f9154c4dde1c80aa1",
    "type": "welcome",
    "subject": "¡Bienvenido a {{hotelName}}, {{guestName}}!",
    "body": "...",
    "isActive": true,
    "createdAt": "2026-01-30T10:00:00.000Z"
  },
  {
    "id": "template-id-2",
    "hotelId": "675fb26f9154c4dde1c80aa1",
    "type": "arrival_instructions",
    "subject": "Instrucciones de llegada - {{hotelName}}",
    "body": "...",
    "isActive": true,
    "createdAt": "2026-01-30T11:00:00.000Z"
  }
]
```

---

## ✏️ Actualizar Plantillas

### Actualizar el contenido de una plantilla

```http
PATCH http://localhost:3000/email-templates/{template-id}
Content-Type: application/json
Authorization: Bearer {tu-token}

{
  "subject": "¡Bienvenido a nuestro hotel, {{guestName}}!",
  "body": "<div>Nuevo contenido del correo...</div>",
  "isActive": true
}
```

### Desactivar una plantilla

```http
PATCH http://localhost:3000/email-templates/{template-id}
Content-Type: application/json
Authorization: Bearer {tu-token}

{
  "isActive": false
}
```

---

## 🧪 Correo de Prueba

### Enviar correo de prueba para verificar configuración

```http
POST http://localhost:3000/email-templates/test
Content-Type: application/json
Authorization: Bearer {tu-token}

{
  "to": "tu-email-personal@gmail.com"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Test email sent successfully to tu-email-personal@gmail.com"
}
```

---

## 🎯 Casos de Uso Completos

### Caso 1: Nueva Reserva - Envío Automático

**Paso 1:** Cliente hace una reserva
**Paso 2:** Sistema crea la reserva en la base de datos
**Paso 3:** Sistema envía correo de bienvenida automáticamente

```http
POST http://localhost:3000/email-templates/send
Content-Type: application/json
Authorization: Bearer {sistema-interno-token}

{
  "hotelId": "675fb26f9154c4dde1c80aa1",
  "templateType": "welcome",
  "to": "nuevo-cliente@example.com",
  "variables": {
    "guestName": "Ana Martínez",
    "hotelName": "Hotel Paradise",
    "roomNumber": "205",
    "checkInDate": "5 de marzo de 2026",
    "checkOutDate": "8 de marzo de 2026",
    "confirmationCode": "HPX2026001"
  }
}
```

### Caso 2: 24 horas antes del Check-in

**Automatización:** Enviar instrucciones de llegada

```http
POST http://localhost:3000/email-templates/send
Content-Type: application/json
Authorization: Bearer {sistema-interno-token}

{
  "hotelId": "675fb26f9154c4dde1c80aa1",
  "templateType": "arrival_instructions",
  "to": "ana.martinez@example.com",
  "variables": {
    "guestName": "Ana Martínez",
    "hotelName": "Hotel Paradise",
    "checkInDate": "5 de marzo de 2026",
    "confirmationCode": "HPX2026001"
  }
}
```

### Caso 3: Después del Check-out

**Automatización:** Enviar encuesta de satisfacción

```http
POST http://localhost:3000/email-templates/send
Content-Type: application/json
Authorization: Bearer {sistema-interno-token}

{
  "hotelId": "675fb26f9154c4dde1c80aa1",
  "templateType": "satisfaction_survey",
  "to": "ana.martinez@example.com",
  "variables": {
    "guestName": "Ana Martínez",
    "hotelName": "Hotel Paradise",
    "confirmationCode": "HPX2026001"
  }
}
```

---

## 🔍 Tips y Mejores Prácticas

### 1. Variables Consistentes

Usa siempre las mismas variables en todas tus plantillas:
- `guestName` (no `guest_name`, `nombre`, etc.)
- `hotelName` (no `hotel_name`, `nombreHotel`, etc.)
- `checkInDate` (no `check_in_date`, `fechaEntrada`, etc.)

### 2. HTML Seguro

Siempre usa estilos inline en el HTML:
```html
<div style="background-color: #f8f9fa; padding: 20px;">
  <!-- contenido -->
</div>
```

### 3. Testing

Antes de usar en producción:
1. Envía correos de prueba a tu propio email
2. Verifica que las variables se reemplacen correctamente
3. Revisa cómo se ve en diferentes clientes de correo (Gmail, Outlook, etc.)

### 4. Error Handling

Si un correo falla, el sistema lanza un error pero no debería detener la operación principal (ej: crear la reserva):

```typescript
try {
  await sendEmailUseCase.execute(...);
} catch (error) {
  console.error('Email failed:', error);
  // La reserva ya está creada, solo logueamos el error
}
```

---

## 📱 Colección de Postman

Puedes importar esta colección JSON en Postman:

```json
{
  "info": {
    "name": "Lymon - Email System",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "hotel_id",
      "value": "675fb26f9154c4dde1c80aa1"
    }
  ]
}
```

---

## 🆘 Errores Comunes

### Error 401: Unauthorized
**Causa:** Token JWT inválido o expirado
**Solución:** Haz login nuevamente y obtén un nuevo token

### Error 404: No active email template found
**Causa:** No existe plantilla activa para ese tipo y hotel
**Solución:** Crea la plantilla primero con `POST /email-templates`

### Error 500: Error sending email
**Causa:** Problema con la configuración de Outlook
**Solución:** Verifica `EMAIL_USER` y `EMAIL_PASSWORD` en `.env`
