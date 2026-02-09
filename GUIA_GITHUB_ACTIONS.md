# 🚀 GUÍA: Compilar ManoProtect con GitHub Actions

## Paso 1: Guardar el proyecto en GitHub

1. En Emergent (donde estamos hablando), busca abajo en la barra de chat
2. Busca el icono de **GitHub** o texto **"Save to GitHub"**
3. Conecta tu cuenta de GitHub si no lo has hecho
4. Crea un nuevo repositorio o selecciona uno existente
5. Guarda el proyecto

---

## Paso 2: Convertir el Keystore a Base64

Necesitas convertir tu archivo `manoprotect-2025.keystore` a texto Base64.

### En Windows (PowerShell):
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\ruta\a\manoprotect-2025.keystore")) | Set-Clipboard
```

### O usa esta web:
1. Ve a: https://base64.guru/converter/encode/file
2. Sube tu archivo `manoprotect-2025.keystore`
3. Copia el texto Base64 generado

---

## Paso 3: Configurar Secretos en GitHub

1. Ve a tu repositorio en GitHub
2. Clic en **Settings** (Configuración)
3. En el menú izquierdo: **Secrets and variables → Actions**
4. Clic en **New repository secret**

### Añade estos 4 secretos:

| Nombre | Valor |
|--------|-------|
| `KEYSTORE_BASE64` | (el texto Base64 de tu keystore) |
| `KEYSTORE_PASSWORD` | `19862210Des` |
| `KEY_ALIAS` | `manoprotect` |
| `KEY_PASSWORD` | `19862210Des` |

---

## Paso 4: Ejecutar la compilación

1. Ve a tu repositorio en GitHub
2. Clic en la pestaña **Actions**
3. En el menú izquierdo, selecciona **"Build Android AAB"**
4. Clic en **"Run workflow"** (botón verde a la derecha)
5. Clic en **"Run workflow"** en el desplegable

---

## Paso 5: Descargar el AAB

1. Espera a que termine (5-15 minutos)
2. Cuando veas ✅ verde, clic en el workflow completado
3. Baja hasta **"Artifacts"**
4. Descarga **"ManoProtect-release-aab"**
5. Descomprime el ZIP → Tendrás tu `app-release.aab`

---

## Paso 6: Subir a Google Play

1. Ve a Google Play Console
2. Selecciona ManoProtect
3. Production → Create new release
4. Sube el `app-release.aab`
5. ¡Listo! 🎉

---

## ⚠️ Notas importantes

- La compilación tarda 5-15 minutos
- El AAB se guarda por 30 días en GitHub
- Puedes ejecutar la compilación cuando quieras
- Cada vez que hagas "push" al repositorio, se compilará automáticamente

---

## 🔑 Tus credenciales (guárdalas)

- **Keystore**: `manoprotect-2025.keystore`
- **Password**: `19862210Des`
- **Alias**: `manoprotect`
