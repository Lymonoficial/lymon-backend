# Configuración Rápida de Email

## ⚡ Opción 1: Gmail (RECOMENDADO - Más Fácil)

### Pasos:

1. **Crear una Contraseña de Aplicación en Gmail:**
   - Ve a: https://myaccount.google.com/security
   - Activa la **"Verificación en 2 pasos"**
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro dispositivo personalizado"
   - Escribe "Lymon Backend"
   - Copia la contraseña de 16 caracteres que aparece

2. **Configurar en `.env`:**
   ```env
   EMAIL_PROVIDER=gmail
   EMAIL_USER=tu-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # La contraseña de aplicación (16 caracteres)
   EMAIL_FROM_NAME=Lymon Hotel Management
   ```

3. **Reiniciar el servidor:**
   ```bash
   # El servidor se reiniciará automáticamente con --watch
   ```

4. **Verificar:**
   Deberías ver en la consola:
   ```
   ✅ Email service is ready to send emails
   📧 Using provider: gmail
   ```

### ✅ Ventajas de Gmail:
- Configuración más simple
- No requiere OAuth2
- Mayor límite de envíos (500 correos/día)
- Más confiable

---

## 📧 Opción 2: Outlook (Si prefieres usar Lymonoficial@outlook.com)

### Pasos:

1. **Crear una Contraseña de Aplicación en Outlook:**
   - Ve a: https://account.microsoft.com/security
   - Activa la **"Verificación en dos pasos"**
   - Busca **"Contraseñas de aplicación"**
   - Crea una nueva contraseña
   - Copia la contraseña generada

2. **Configurar en `.env`:**
   ```env
   EMAIL_PROVIDER=outlook
   EMAIL_USER=Lymonoficial@outlook.com
   EMAIL_PASSWORD=tu-contraseña-de-aplicacion
   EMAIL_FROM_NAME=Lymon Hotel Management
   ```

3. **Reiniciar el servidor**

### ⚠️ Nota sobre Outlook:
Outlook deshabilitó la autenticación básica en 2022. DEBES usar una contraseña de aplicación, no tu contraseña normal.

---

## 🧪 Probar la Configuración

Una vez configurado, prueba con:

```http
POST http://localhost:3000/email-templates/test
Authorization: Bearer {tu-jwt-token}
Content-Type: application/json

{
  "to": "tu-email-personal@gmail.com"
}
```

Si funciona, recibirás un correo de prueba.

---

## 🆘 Solución de Problemas

### Error: "Invalid login: 535 5.7.139 Authentication unsuccessful"
**Causa:** Outlook no permite autenticación básica
**Solución:** Usa Gmail o crea una contraseña de aplicación en Outlook

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Causa Gmail:** No estás usando una contraseña de aplicación
**Solución:** 
1. Activa 2FA en Gmail
2. Crea una contraseña de aplicación
3. Usa esa contraseña en `.env`

### Error: "self signed certificate in certificate chain"
**Causa:** Problema con certificados SSL
**Solución:** Ya está configurado en el código para ignorar esto

### El servidor no detecta los cambios en .env
**Solución:** Reinicia completamente el servidor (Ctrl+C y luego `npm run start:dev`)

---

## 📊 Comparación

| Característica | Gmail | Outlook |
|----------------|-------|---------|
| Facilidad de configuración | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Límite de envíos/día | 500 | 300 |
| Requiere 2FA | ✅ | ✅ |
| Contraseña de aplicación | ✅ | ✅ |
| Confiabilidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 🎯 Recomendación

**Usa Gmail** para desarrollo y pruebas. Es más fácil de configurar y más confiable.

Si necesitas enviar desde `@outlook.com` específicamente en producción, configura Outlook después con una contraseña de aplicación.
