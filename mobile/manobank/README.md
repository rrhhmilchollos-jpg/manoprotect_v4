# ManoBank - App Android

## 🚀 Compilar APK con GitHub Actions

### Pasos:

1. **Crea un repositorio en GitHub** (si no tienes uno)
   - Ve a https://github.com/new
   - Nombre: `manobank-app`
   - Hazlo público o privado

2. **Sube este proyecto a GitHub:**
   ```bash
   cd manobank
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/manobank-app.git
   git push -u origin main
   ```

3. **GitHub compilará automáticamente la APK**
   - Ve a tu repositorio en GitHub
   - Haz clic en la pestaña **"Actions"**
   - Verás el workflow ejecutándose
   - Espera 3-5 minutos

4. **Descarga la APK:**
   - Cuando termine (icono verde ✓)
   - Haz clic en el workflow completado
   - Abajo verás **"Artifacts"**
   - Descarga **"ManoBank-APK"**

## 📱 Instalar en Android

1. Pasa el archivo `app-debug.apk` a tu móvil
2. Abre el archivo en tu móvil
3. Permite instalar desde orígenes desconocidos
4. ¡Listo!

## 🔧 Información técnica

- **App ID:** com.manobank.app
- **Nombre:** ManoBank
- **URL Web:** https://security-api-suite.preview.emergentagent.com
