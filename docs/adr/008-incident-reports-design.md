# ADR-008: Diseño de Incident Reports (US-11)

**Fecha:** 2026-03-02  
**Estado:** Aceptado

---

## Contexto

Se implementó la feature de registro de novedades laborales (`IncidentReport`) como entidad de dominio propia con CRUD completo. Durante el diseño surgieron tres decisiones no triviales que se documentan aquí.

---

## Decisión 1 — `createdBy` se toma del JWT, no del body

### Problema

El campo que identifica quién reporta el incidente podría provenir de:

- **Opción A:** El `userId` del actor que tiene sesión activa (`actorId` del JWT) → almacenado como `createdBy`
- **Opción B:** Un `workerId` enviado en el body → permite a un ADMIN crear un reporte "en nombre de" otro usuario

### Decisión

Se eligió la **Opción A**. El campo `createdBy` se asigna siempre como `command.actorId` en el handler; no existe en el DTO de creación.

### Razón

La Opción B crea ambigüedad de ownership: si ADMIN crea un reporte con el ID de otro usuario como `workerId`, ese usuario podría reclamar propiedad sobre él — o no poder editarlo aunque figure como autor. La restricción de ownership para STAFF (`createdBy === actorId`) funciona correctamente solo si `createdBy` siempre es quien tiene la sesión activa.

---

## Decisión 2 — Soft delete

### Problema

El borrado físico (`findByIdAndDelete`) elimina permanentemente el registro, lo que destruye trazabilidad histórica.

### Decisión

El borrado es un **soft delete**: se establece `deletedAt: Date` en el documento. Todas las queries filtran `{ deletedAt: null }`. El documento permanece en MongoDB para auditoría.

### Razón

Los incident reports son documentos con valor forense/operativo. Borrar físicamente un reporte de daño reportado por un huésped podría tener implicaciones legales. El soft delete preserva el dato manteniendo la ilusión de borrado para el resto de la aplicación.

---

## Decisión 3 — `attachmentUrls` como campo de URLs, upload separado

### Problema

Los incident reports necesitarán adjuntos (fotos de daños, documentos). Se podría:

- **Opción A:** Implementar upload de archivos junto con la feature
- **Opción B:** Almacenar solo las URLs como `string[]`; el upload a storage es responsabilidad de un flujo separado (futuro)

### Decisión

Se eligió la **Opción B**. El campo `attachmentUrls: string[]` existe en la entidad, schema y DTOs. El endpoint de upload no existe aún.

### Razón

El scope de US-11 no incluye gestión de storage. Forzar el upload en el mismo endpoint acopla la feature a una infraestructura de almacenamiento que aún no está definida. Las URLs se pueden poblar manualmente o mediante un endpoint dedicado cuando se implemente el storage.

---

## Consecuencias

- El DTO de creación no tiene campo `createdBy` — no se documenta en Swagger ni se valida
- Los documentos borrados permanecen en MongoDB; habrá que considerar un job de purga si el volumen crece
- El campo `attachmentUrls` debe validarse como `@IsUrl()` en los DTOs para evitar datos arbitrarios antes de implementar la lógica de upload real
