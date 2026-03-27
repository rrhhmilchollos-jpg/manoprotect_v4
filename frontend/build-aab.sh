#!/bin/bash

# ============================================
# 🚀 ManoProtect - Script de Build AAB v1.1.0
# ============================================
# Este script genera el AAB para subir a Google Play Console
# Ejecutar desde: /app/frontend

set -e

echo "🛡️ ManoProtect - Generando AAB para Google Play"
echo "================================================"

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde /app/frontend"
    exit 1
fi

# 2. Verificar keystore
if [ ! -f "android/keystore.properties" ]; then
    echo "⚠️  ADVERTENCIA: No existe keystore.properties"
    echo "   Copia keystore.properties.example a keystore.properties y configúralo"
    echo ""
    echo "   cp android/keystore.properties.example android/keystore.properties"
    echo ""
fi

# 3. Build de React para producción
echo ""
echo "📦 Paso 1/4: Compilando React para producción..."
REACT_APP_BACKEND_URL=https://manoprotectt.com yarn build

# 4. Sincronizar con Capacitor
echo ""
echo "🔄 Paso 2/4: Sincronizando con Capacitor..."
npx cap sync android

# 5. Generar AAB
echo ""
echo "🔧 Paso 3/4: Generando Android App Bundle (AAB)..."
cd android

# Limpiar builds anteriores
./gradlew clean

# Generar AAB release
./gradlew bundleRelease

echo ""
echo "✅ Paso 4/4: ¡Build completado!"
echo ""
echo "================================================"
echo "📍 Tu archivo AAB está en:"
echo "   android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "📱 Información de versión:"
echo "   versionCode: 2"
echo "   versionName: 1.1.0"
echo ""
echo "🎯 Próximos pasos:"
echo "   1. Ve a Google Play Console"
echo "   2. Selecciona ManoProtect"
echo "   3. Release > Production > Create new release"
echo "   4. Sube el archivo app-release.aab"
echo "   5. Añade notas de la versión"
echo "   6. Review and rollout"
echo "================================================"
