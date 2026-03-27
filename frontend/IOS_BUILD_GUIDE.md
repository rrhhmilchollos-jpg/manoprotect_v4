# ManoProtect iOS - Guia de Compilacion

## Requisitos
- Mac con macOS 13+ (Ventura o superior)
- Xcode 15+ instalado (App Store)
- Node.js 18+ instalado
- Cuenta de Apple Developer ($99/ano) - https://developer.apple.com

## Pasos

### 1. Clonar el repositorio
```bash
git clone [tu-repo] manoprotect
cd manoprotect/frontend
```

### 2. Instalar dependencias
```bash
yarn install
npx cap install
```

### 3. Build del frontend
```bash
yarn build
npx cap copy ios
npx cap sync ios
```

### 4. Abrir en Xcode
```bash
npx cap open ios
```

### 5. Configurar en Xcode
1. Selecciona el proyecto "App" en el navegador
2. Ve a "Signing & Capabilities"
3. Selecciona tu Team (cuenta Apple Developer)
4. El Bundle ID debe ser: `com.manoprotect.app`
5. Cambia el nombre a "ManoProtect"

### 6. Configurar URL de produccion
En `capacitor.config.json`, verifica que el hostname es correcto:
```json
{
  "server": {
    "hostname": "manoprotectt.com"
  }
}
```

### 7. Build y ejecutar
- Selecciona un dispositivo iOS o simulador
- Click en "Run" (triangulo) o Cmd+R
- Para App Store: Product > Archive

### 8. Publicar en App Store
1. Product > Archive en Xcode
2. Window > Organizer
3. Selecciona el archivo y click "Distribute App"
4. Sigue el asistente de App Store Connect

## Iconos necesarios
Los iconos deben estar en el catalogo de assets de Xcode:
- 1024x1024 (App Store)
- 180x180 (iPhone @3x)
- 120x120 (iPhone @2x)
- 167x167 (iPad Pro)
- 152x152 (iPad @2x)

## Permisos iOS (Info.plist)
Si usas funciones especiales, anade las claves:
- `NSCameraUsageDescription` - Para camaras de seguridad
- `NSLocationWhenInUseUsageDescription` - Para geolocalizacion
- `NSNotificationUsageDescription` - Para push notifications

## Soporte
Email: soporte@manoprotectt.com
