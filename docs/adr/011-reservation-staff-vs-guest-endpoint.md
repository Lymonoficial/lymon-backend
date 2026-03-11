# ADR-011: Separación de Endpoints de Reservación — Staff vs. Huésped Autenticado

**Fecha:** 2026-03-11  
**Estado:** Aceptado

---

## Contexto

Lymon es un PMS multi-tenant. Existen dos actores distintos que pueden originar una reservación:

1. **Staff del tenant** (Felipe como operador) — crea reservaciones manualmente desde el dashboard administrativo.
2. **Huésped autenticado** (Pablo como cliente final) — se reserva a sí mismo desde la página del tenant en Lymon.

Durante el diseño surgió la pregunta: ¿deben ambos flujos compartir el mismo endpoint `POST /reservations`?

---

## Decisión

Se implementan **dos endpoints separados**:

|                   | Staff                                  | Huésped                                     |
| ----------------- | -------------------------------------- | ------------------------------------------- |
| Endpoint          | `POST /reservations`                   | `POST /guest/reservations` _(futuro)_       |
| Guard             | `JwtAuthGuard` (JWT de staff)          | `GuestJwtAuthGuard` (JWT de guest account)  |
| `guestId`         | Enviado en el body por el staff        | Derivado del token, nunca del body          |
| `tenantId`        | Del JWT del staff                      | Resuelto desde la unidad que se reserva     |
| `source`          | `MANUAL` o `DIRECT` (enum restringido) | Siempre `DIRECT`, hardcodeado en el handler |
| Permiso requerido | `RESERVATION_CREATE`                   | Ninguno (el huésped reserva para sí mismo)  |

---

## Razones

### 1. Los sistemas de autenticación son incompatibles en un mismo endpoint

`JwtAuthGuard` valida tokens de staff (firmados con las credenciales de la aplicación interna). `GuestJwtAuthGuard` valida tokens de `GuestAccount` (huéspedes registrados en la plataforma). No existe un guard "intenta ambos" que sea seguro y mantenible.

### 2. Riesgo de escalación de privilegios

Si el endpoint aceptara `guestId` en el body y fuera accesible por huéspedes, Pablo podría enviar el `guestId` de otro huésped y crear una reservación en su nombre. El endpoint de huésped debe derivar `guestId` **exclusivamente** del token JWT — esta restricción solo es posible de garantizar a nivel de controlador, no de validación de DTO.

### 3. Formas de entrada distintas

El staff envía: `{ unitId, guestId, propertyId, checkIn, checkOut, source, guestsCount }`  
El huésped envía: `{ unitId, checkIn, checkOut, guestsCount }` — sin `guestId`, sin `source`, sin `propertyId`

Un DTO con campos opcionales que tienen semánticas distintas según quién llama es un anti-patrón.

### 4. Trazabilidad de auditoría

El `actorId` en el log de auditoría es el staff que creó la reservación (incluso si la crea en nombre de un huésped). En el flujo de huésped, el `actorId` sería el propio huésped. Mezclar ambos en un mismo endpoint complica el modelo de auditoría.

### 5. Consistencia con el resto del sistema

El sistema ya separa rutas por tipo de actor: `/auth/...` para staff y `/guest-auth/...` para huéspedes. Este ADR extiende ese mismo principio al módulo de reservaciones.

---

## Flujo OTA (Channex)

Las reservaciones provenientes de OTAs (Airbnb, Booking.com, VRBO) **no pasan por ninguno de estos endpoints**. Llegan mediante un webhook adapter en `src/infrastructure/channex/` que:

1. Verifica la firma del webhook de Channex
2. Hace upsert del huésped por email o ID externo
3. Llama directamente a `Reservation.createConfirmed()` con `source = AIRBNB | BOOKING | VRBO`
4. Usa `externalReservationId + source` como clave de idempotencia

Este flujo está previsto pero no implementado en el MVP.

---

## Consecuencias

- `POST /reservations` (staff) está implementado y funcional.
- `POST /guest/reservations` (huésped autenticado) se implementa cuando se construya la UI de reservas de la página del tenant — el `CreateReservationCommand` no requiere cambios.
- El webhook de Channex se implementa como un módulo de infraestructura independiente cuando se integre el channel manager.
