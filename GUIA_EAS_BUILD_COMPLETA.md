# 🚀 GUÍA COMPLETA: COMPILAR CON EAS BUILD

## ✅ **TODO YA ESTÁ PREPARADO**

He configurado tu proyecto para EAS Build. Ahora solo necesitas ejecutar los comandos.

---

## 📋 **INSTRUCCIONES PASO A PASO**

### **PASO 1: Instalar Node.js (si no lo tienes)**

1. Ve a: https://nodejs.org/
2. Descarga la versión **LTS** (recomendada)
3. Instala normalmente (Next → Next → Install)

---

### **PASO 2: Descargar tu código de GitHub**

**Opción A: Con Git (si lo tienes instalado)**
```bash
git clone https://github.com/rrhhmilchollos-jpg/manoprotect_v4.git
cd manoprotect_v4/mobile-app
```

**Opción B: Sin Git**
1. Ve a: https://github.com/rrhhmilchollos-jpg/manoprotect_v4
2. Click en el botón verde **"Code"**
3. Click en **"Download ZIP"**
4. Descomprime el ZIP
5. Abre **CMD** o **PowerShell** en la carpeta `mobile-app`

---

### **PASO 3: Instalar EAS CLI**

Abre **CMD** o **PowerShell** y ejecuta:

```bash
npm install -g eas-cli
```

Espera a que termine (1-2 minutos).

---

### **PASO 4: Crear cuenta en Expo (si no tienes)**

1. Ve a: https://expo.dev/signup
2. Crea cuenta (es GRATIS)
3. Verifica tu email

---

### **PASO 5: Login en EAS**

En tu terminal (CMD/PowerShell), ejecuta:

```bash
eas login
```

Ingresa tu email y password de Expo.

---

### **PASO 6: Compilar el .aab**

Asegúrate de estar en la carpeta `mobile-app`:

```bash
cd mobile-app
```

Luego ejecuta:

```bash
eas build --platform android --profile production --local
```

⚠️ **Te pedirá las credenciales del keystore:**

**Cuando pregunte por:**
- **Keystore path:** Presiona Enter (usará el que ya está configurado)
- **Keystore password:** `19862210Des`
- **Key alias:** `manoprotect`
- **Key password:** `19862210Des`

---

### **PASO 7: Esperar (10-15 minutos)**

Verás algo como:
```
✔ Build successfully started
🔨 Building...
⚙️ Installing dependencies...
📦 Bundling JavaScript...
🔨 Compiling Android...
```

**NO CIERRES LA TERMINAL** hasta que termine.

---

### **PASO 8: Descargar el .aab**

Cuando termine, verás:

```
✔ Build finished!
📦 Artifact: /ruta/a/tu/build.aab
```

¡ESE ES TU ARCHIVO! Cópialo y súbelo a Google Play Store. 🎉

---

## 🆘 **SI ALGO FALLA:**

### Error: "AAPT2 not found"
**Solución:** Instala Android SDK o usa build en la nube:
```bash
eas build --platform android --profile production
```
(Sin el `--local` se compila en servidores de Expo)

### Error: "Keystore not found"
**Solución:** 
1. Ve a `mobile-app/android/app/`
2. Asegúrate de que `manoprotect-2025.keystore` esté ahí
3. Si no está, descárgalo desde donde lo guardaste

### Error: "Expo account required"
**Solución:** Crea cuenta gratis en https://expo.dev/signup

---

## 💰 **COSTOS:**

- **Compilación local (--local):** GRATIS ✅
- **Compilación en nube:** Primeras builds GRATIS, luego $29/mes

**Usa `--local` para que sea gratis.**

---

## 📞 **NECESITAS AYUDA?**

Si algo no funciona:
1. Copia el mensaje de error completo
2. Envíamelo
3. Lo arreglaremos juntos

---

**¡SUERTE! 🚀**
