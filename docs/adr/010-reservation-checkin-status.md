# ADR-010: Diseño del Estado CHECKED_IN en Reservaciones

**Fecha:** 2026-03-11  
**Estado:** Aceptado

---

## Contexto

Durante la implementación del módulo de reservaciones surgió la pregunta: ¿tiene sentido rastrear el estado `CHECKED_IN` en el PMS si los OTAs (Airbnb, Booking.com, VRBO) no envían webhooks de check-in?

La duda es válida: si la mayoría de reservaciones vienen de OTAs vía Channex, y el OTA no notifica cuándo el huésped llega físicamente, ¿para qué existe el estado en el sistema?

---

## Decisión

Se mantiene el estado `CHECKED_IN` como estado de dominio explícito con las siguientes reglas:

1. **Check-in manual es el flujo primario** — el staff registra el check-in cuando el huésped llega físicamente a la propiedad.
2. **Scheduler como fallback** — un cron job corre a las 11pm y hace auto check-in de todas las reservaciones `CONFIRMED` con `checkIn <= hoy` que no fueron procesadas manualmente.
3. **Los OTAs nunca envían check-in** — ningún OTA (Airbnb, Booking, VRBO) emite un webhook de check-in. Este evento siempre es responsabilidad interna del PMS.

---

## Razones

### Por qué mantener CHECKED_IN

**1. Reservaciones directas y manuales**
Las reservaciones con `source = MANUAL` o `DIRECT` (creadas por el staff) no tienen una plataforma externa que valide la llegada del huésped. El staff necesita confirmarlo explícitamente.

**2. Detección de no-shows**
Sin el estado `CHECKED_IN`, el sistema no puede distinguir entre:

- Una reservación activa (huésped en la propiedad)
- Una reservación futura (huésped aún no llegó)
- Un no-show (huésped nunca llegó)

La transición `CONFIRMED → NO_SHOW` solo tiene sentido si existe el estado intermedio `CHECKED_IN` como contraste.

**3. Triggers operacionales futuros**
Estados como `CHECKED_IN` habilitarán en iteraciones futuras:

- Gestión de housekeeping (qué habitaciones están ocupadas vs. libres)
- Integración con cerraduras inteligentes (activar/desactivar códigos de acceso)
- Reporte de ocupación real vs. ocupación reservada

**4. Reportes de ocupación**
Una reservación cancelada a último momento no debe contabilizar como noche ocupada. `CHECKED_IN` es la señal de que el huésped efectivamente estuvo en la propiedad.

---

## Alternativa descartada

**Eliminar CHECKED_IN del estado de dominio y tratar CONFIRMED como "activo":**

- Pierde la capacidad de detectar no-shows con precisión
- Mezcla "reservación confirmada futura" con "huésped actualmente en la propiedad"
- Dificulta la integración de cerraduras inteligentes y housekeeping en el futuro

---

## Consecuencias

- El dominio tiene 6 estados: `PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT`, con terminales `CANCELLED` y `NO_SHOW`.
- El scheduler `ReservationCheckInScheduler` corre a las 11pm diariamente.
- Futura mejora: agregar `checkInTime` a la unidad para que el scheduler respete el horario de check-in configurado por el tenant en lugar de usar fin de día como heurística.
