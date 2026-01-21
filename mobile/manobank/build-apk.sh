#!/bin/bash
# Script para compilar ManoBank APK

echo "🏦 ManoBank - Compilador de APK"
echo "================================"

# Verificar requisitos
command -v node >/dev/null 2>&1 || { echo "❌ Node.js no instalado. Instálalo desde https://nodejs.org"; exit 1; }
command -v java >/dev/null 2>&1 || { echo "❌ Java no instalado. Instala Android Studio primero"; exit 1; }

echo "✅ Requisitos verificados"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Sincronizar Capacitor
echo "🔄 Sincronizando con Android..."
npx cap sync android

# Compilar APK
echo "🔨 Compilando APK Debug..."
cd android
chmod +x gradlew
./gradlew assembleDebug

if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    echo ""
    echo "✅ ¡APK compilada exitosamente!"
    echo "📁 Ubicación: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "📱 Para instalar en tu móvil:"
    echo "   1. Copia el archivo APK a tu móvil"
    echo "   2. Activa 'Orígenes desconocidos' en Ajustes > Seguridad"
    echo "   3. Abre el archivo APK e instala"
else
    echo "❌ Error al compilar. Revisa los mensajes de error arriba."
fi
