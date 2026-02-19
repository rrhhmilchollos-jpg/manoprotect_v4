# Notas de Versión para Google Play Console

## Versión 1.1.0 (versionCode 2)

### 🇪🇸 Español (es-ES) - Descripción del cambio

```
🛡️ ¡Nueva versión de ManoProtect!

Novedades v1.1.0:
• Nuevo sistema de carrito de compras integrado con pago seguro
• Vista previa de colores en tiempo real para dispositivos SOS
• Diseño completamente renovado con colores más suaves y profesionales
• Mejoras de SEO y rendimiento
• Nuevo botón de acceso directo al Blog
• Correcciones de errores y mejoras de estabilidad

🔒 Tu seguridad, nuestra prioridad.
```

### 🇬🇧 English (en-US) - What's new

```
🛡️ New ManoProtect version!

What's new in v1.1.0:
• New shopping cart system with secure checkout
• Real-time color preview for SOS devices
• Completely redesigned UI with softer, professional colors
• SEO and performance improvements
• New direct access button to Blog
• Bug fixes and stability improvements

🔒 Your safety, our priority.
```

---

## Checklist para subir a Google Play Console

- [ ] Archivo AAB generado: `android/app/build/outputs/bundle/release/app-release.aab`
- [ ] versionCode incrementado: 2 (mayor que la versión actual en Play Store)
- [ ] versionName actualizado: 1.1.0
- [ ] Notas de versión copiadas arriba
- [ ] Probar en dispositivo físico antes de publicar

## Pasos en Google Play Console

1. Ir a **Production** > **Releases** > **Create new release**
2. Subir el archivo `app-release.aab`
3. Copiar las notas de versión en español
4. Click en **Review release**
5. Click en **Start rollout to Production**

## Política de rollout sugerida

Para una actualización segura:
- **Día 1-2**: Rollout al 5% de usuarios
- **Día 3-4**: Si no hay crashes, aumentar al 20%
- **Día 5-7**: Si estable, aumentar al 50%
- **Día 8+**: Rollout completo al 100%
