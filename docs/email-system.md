# Sistema de Correos Automáticos

Este documento explica cómo configurar y usar el sistema de correos automáticos parametrizables en Lymon.

## 🎯 Descripción

El sistema permite a los gerentes de hotel configurar correos automáticos personalizados para mejorar la atención al cliente sin trabajo manual. Los correos son completamente parametrizables y se envían desde **Lymonoficial@outlook.com**.

### Tipos de Correos Disponibles

1. **WELCOME** - Correo de bienvenida al hacer check-in
2. **ARRIVAL_INSTRUCTIONS** - Instrucciones de llegada antes del check-in
3. **SATISFACTION_SURVEY** - Encuesta de satisfacción después del check-out

## 🔐 Configuración Inicial

### 1. Configurar Variables de Entorno

Edita el archivo `.env` y configura las credenciales de Outlook:

```env
EMAIL_USER=Lymonoficial@outlook.com
EMAIL_PASSWORD=tu_contraseña_de_outlook
```

**⚠️ IMPORTANTE:** Para usar Outlook, necesitas:
- Una cuenta activa de Outlook
- Habilitar "Permitir aplicaciones menos seguras" o usar una contraseña de aplicación
- Verificar que el correo no esté bloqueado para envíos SMTP

### 2. Verificar Configuración

Usa el endpoint de prueba para verificar que el correo esté funcionando:

```http
POST /email-templates/test
Authorization: Bearer {tu-jwt-token}
Content-Type: application/json

{
  "to": "tu-email@example.com"
}
```

## 📋 Endpoints Disponibles

### 1. Crear Plantilla de Correo

**Endpoint:** `POST /email-templates`

**Autenticación:** Requiere JWT Token

**Request:**
```http
POST /email-templates HTTP/1.1
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "hotelId": "675fb26f9154c4dde1c80aa1",
  "type": "welcome",
  "subject": "¡Bienvenido a {{hotelName}}!",
  "body": "<h1>Hola {{guestName}}</h1><p>Gracias por elegir <strong>{{hotelName}}</strong>. Tu habitación <strong>{{roomNumber}}</strong> está lista.</p><p>Check-in: {{checkInDate}}</p><p>¡Esperamos que disfrutes tu estadía!</p>",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "abc-123-def",
  "hotelId": "675fb26f9154c4dde1c80aa1",
  "type": "welcome",
  "subject": "¡Bienvenido a {{hotelName}}!",
  "body": "<h1>Hola {{guestName}}...</h1>",
  "isActive": true,
  "createdAt": "2026-01-30T10:00:00.000Z"
}
```

### 2. Obtener Plantillas de un Hotel

**Endpoint:** `GET /email-templates?hotelId={hotelId}`

**Autenticación:** Requiere JWT Token

**Request:**
```http
GET /email-templates?hotelId=675fb26f9154c4dde1c80aa1 HTTP/1.1
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
[
  {
    "id": "abc-123-def",
    "hotelId": "675fb26f9154c4dde1c80aa1",
    "type": "welcome",
    "subject": "¡Bienvenido a {{hotelName}}!",
    "body": "...",
    "isActive": true,
    "createdAt": "2026-01-30T10:00:00.000Z"
  },
  {
    "id": "xyz-789-ghi",
    "hotelId": "675fb26f9154c4dde1c80aa1",
    "type": "arrival_instructions",
    "subject": "Instrucciones de llegada - {{hotelName}}",
    "body": "...",
    "isActive": true,
    "createdAt": "2026-01-30T11:00:00.000Z"
  }
]
```

### 3. Actualizar Plantilla

**Endpoint:** `PATCH /email-templates/:id`

**Autenticación:** Requiere JWT Token

**Request:**
```http
PATCH /email-templates/abc-123-def HTTP/1.1
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "subject": "¡Bienvenido a {{hotelName}}, {{guestName}}!",
  "body": "<h1>Hola {{guestName}}</h1><p>Es un placer recibirte en {{hotelName}}...</p>",
  "isActive": true
}
```

### 4. Enviar Correo Usando Plantilla

**Endpoint:** `POST /email-templates/send`

**Autenticación:** Requiere JWT Token

**Descripción:** Envía un correo usando la plantilla configurada, reemplazando las variables con valores reales.

**Request:**
```http
POST /email-templates/send HTTP/1.1
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "hotelId": "675fb26f9154c4dde1c80aa1",
  "templateType": "welcome",
  "to": "cliente@example.com",
  "variables": {
    "guestName": "Juan Pérez",
    "hotelName": "Hotel Paradise",
    "roomNumber": "301",
    "checkInDate": "15 de febrero de 2026"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully to cliente@example.com"
}
```

## 🎨 Sistema de Variables

Las plantillas soportan variables que se reemplazan automáticamente usando la sintaxis `{{nombreVariable}}`.

### Variables Comunes

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{guestName}}` | Nombre del huésped | "Juan Pérez" |
| `{{hotelName}}` | Nombre del hotel | "Hotel Paradise" |
| `{{roomNumber}}` | Número de habitación | "301" |
| `{{checkInDate}}` | Fecha de check-in | "15 de febrero de 2026" |
| `{{checkOutDate}}` | Fecha de check-out | "18 de febrero de 2026" |
| `{{confirmationCode}}` | Código de confirmación | "ABC123XYZ" |
| `{{totalPrice}}` | Precio total | "$450.00" |

**Nota:** Puedes crear tus propias variables según tus necesidades.

## 📝 Ejemplos de Plantillas

### Plantilla 1: Correo de Bienvenida

```json
{
  "type": "welcome",
  "subject": "¡Bienvenido a {{hotelName}}!",
  "body": "
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
      <h1 style='color: #2c3e50;'>¡Bienvenido {{guestName}}!</h1>
      <p>Es un placer recibirte en <strong>{{hotelName}}</strong>.</p>
      
      <div style='background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;'>
        <h3>Detalles de tu Reserva:</h3>
        <ul style='list-style: none; padding: 0;'>
          <li>🏨 <strong>Hotel:</strong> {{hotelName}}</li>
          <li>🚪 <strong>Habitación:</strong> {{roomNumber}}</li>
          <li>📅 <strong>Check-in:</strong> {{checkInDate}}</li>
          <li>📅 <strong>Check-out:</strong> {{checkOutDate}}</li>
          <li>🔑 <strong>Código de confirmación:</strong> {{confirmationCode}}</li>
        </ul>
      </div>
      
      <p>Nuestro equipo está listo para atenderte. ¡Disfruta tu estadía!</p>
      
      <hr style='border: 1px solid #eee; margin: 30px 0;'>
      <p style='color: #7f8c8d; font-size: 12px;'>
        {{hotelName}} - Atención al cliente<br>
        Este es un correo automático, por favor no responder.
      </p>
    </div>
  "
}
```

### Plantilla 2: Instrucciones de Llegada

```json
{
  "type": "arrival_instructions",
  "subject": "Instrucciones de llegada - {{hotelName}}",
  "body": "
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
      <h1 style='color: #2c3e50;'>Hola {{guestName}}</h1>
      <p>Tu reserva en <strong>{{hotelName}}</strong> está confirmada para el <strong>{{checkInDate}}</strong>.</p>
      
      <div style='background-color: #e8f4f8; padding: 20px; border-radius: 5px; margin: 20px 0;'>
        <h3>📍 Cómo llegar:</h3>
        <p>Dirección: Calle Principal 123, Centro</p>
        <p>Horario de Check-in: 3:00 PM - 11:00 PM</p>
        <p>Si llegas antes, con gusto guardaremos tu equipaje.</p>
      </div>
      
      <div style='background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;'>
        <h3>🅿️ Estacionamiento:</h3>
        <p>Contamos con estacionamiento gratuito para huéspedes.</p>
      </div>
      
      <p><strong>¿Necesitas algo más?</strong> Contáctanos al +52 123 456 7890</p>
      
      <p>¡Nos vemos pronto!</p>
    </div>
  "
}
```

### Plantilla 3: Encuesta de Satisfacción

```json
{
  "type": "satisfaction_survey",
  "subject": "¿Cómo fue tu experiencia en {{hotelName}}?",
  "body": "
    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
      <h1 style='color: #2c3e50;'>Gracias por visitarnos, {{guestName}}</h1>
      <p>Esperamos que hayas disfrutado tu estadía en <strong>{{hotelName}}</strong>.</p>
      
      <div style='background-color: #f0f8ff; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;'>
        <h3>¿Nos ayudas con tu opinión?</h3>
        <p>Tu feedback es muy importante para nosotros.</p>
        <a href='https://forms.google.com/survey?code={{confirmationCode}}' 
           style='display: inline-block; background-color: #3498db; color: white; 
                  padding: 15px 30px; text-decoration: none; border-radius: 5px; 
                  margin: 10px 0;'>
          Completar Encuesta
        </a>
      </div>
      
      <p>Como agradecimiento, recibirás un <strong>10% de descuento</strong> en tu próxima reserva.</p>
      
      <p style='color: #7f8c8d; font-size: 14px;'>
        ¿Tuviste algún problema durante tu estadía?<br>
        Por favor contáctanos directamente: soporte@hotel.com
      </p>
    </div>
  "
}
```

## 🔄 Flujo de Automatización

### Escenario: Envío Automático al Hacer Check-in

1. **Cliente hace check-in** en el sistema
2. El sistema obtiene los datos: nombre, habitación, hotel, etc.
3. Se ejecuta el caso de uso `SendEmailUseCase`:
   ```typescript
   await sendEmailUseCase.execute({
     hotelId: booking.hotelId,
     templateType: EmailTemplateType.WELCOME,
     to: booking.guestEmail,
     variables: {
       guestName: booking.guestName,
       hotelName: hotel.name,
       roomNumber: booking.roomNumber,
       checkInDate: booking.checkInDate,
       checkOutDate: booking.checkOutDate,
       confirmationCode: booking.confirmationCode,
     }
   });
   ```
4. El sistema busca la plantilla activa de tipo `WELCOME` para ese hotel
5. Reemplaza las variables con los datos reales
6. Envía el correo desde `Lymonoficial@outlook.com`

## 🛠️ Integración en tu Código

### Ejemplo: Enviar correo después de crear una reserva

```typescript
import { SendEmailUseCase } from './application/use-cases/send-email.use-case';
import { EmailTemplateType } from './domain/entities/email-template.entity';

@Injectable()
export class BookingService {
  constructor(
    private readonly sendEmailUseCase: SendEmailUseCase,
  ) {}

  async createBooking(data: CreateBookingDto) {
    // 1. Crear la reserva
    const booking = await this.bookingRepository.save(data);
    
    // 2. Enviar correo de bienvenida automáticamente
    try {
      await this.sendEmailUseCase.execute({
        hotelId: booking.hotelId,
        templateType: EmailTemplateType.WELCOME,
        to: booking.guestEmail,
        variables: {
          guestName: booking.guestName,
          hotelName: data.hotelName,
          roomNumber: booking.roomNumber,
          checkInDate: booking.checkInDate.toLocaleDateString('es-MX'),
          confirmationCode: booking.id,
        }
      });
    } catch (error) {
      // Log error pero no falla la reserva
      console.error('Error sending welcome email:', error);
    }
    
    return booking;
  }
}
```

## 🔐 Seguridad

- ✅ Todos los endpoints requieren autenticación JWT
- ✅ Solo usuarios autorizados pueden crear/editar plantillas
- ✅ Las credenciales de correo están en variables de entorno
- ✅ No se exponen credenciales en respuestas API

## 📊 Arquitectura

```
┌─────────────────┐
│  EmailController │ ← Endpoints REST
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  Use Cases          │
│ - CreateTemplate    │
│ - UpdateTemplate    │
│ - SendEmail         │
│ - GetTemplates      │
└────────┬────────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌─────────┐  ┌──────────────┐
│Template │  │EmailService  │
│Repo     │  │(Nodemailer)  │
└────┬────┘  └──────┬───────┘
     │              │
     ▼              ▼
┌─────────┐   ┌──────────┐
│MongoDB  │   │ Outlook  │
│         │   │   SMTP   │
└─────────┘   └──────────┘
```

## 🐛 Solución de Problemas

### Error: "Cannot send email - Authentication failed"

**Solución:**
1. Verifica las credenciales en `.env`
2. Asegúrate de usar la contraseña correcta de Outlook
3. Considera usar una "contraseña de aplicación" en lugar de tu contraseña principal

### Error: "No active email template found"

**Solución:**
1. Verifica que la plantilla esté creada con `isActive: true`
2. Comprueba que el `hotelId` y `templateType` coincidan

### Los correos no se envían

**Solución:**
1. Ejecuta el endpoint `/email-templates/test` para verificar la configuración
2. Revisa los logs del servidor
3. Verifica que Outlook no haya bloqueado el acceso SMTP

## 📚 Próximas Mejoras

- [ ] Sistema de cola para envío masivo de correos
- [ ] Plantillas HTML con editor visual
- [ ] Estadísticas de correos enviados/abiertos
- [ ] Soporte para adjuntos (PDFs, imágenes)
- [ ] Programación de envío automático por fecha
- [ ] Múltiples idiomas por plantilla
- [ ] Webhooks para notificar eventos de correo

## 📞 Soporte

Si tienes problemas con el sistema de correos:
1. Verifica la configuración en `.env`
2. Ejecuta el endpoint de prueba
3. Revisa los logs del servidor
4. Contacta al equipo de desarrollo
