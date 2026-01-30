#!/bin/bash
# ================================================
# ManoProtect - Script de Compilación Android
# Ejecutar en tu ordenador local con Android Studio instalado
# ================================================

echo "🛡️ ManoProtect - Compilador de APK/AAB"
echo "======================================="
echo ""

# Verificar que Android SDK está configurado
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ Error: ANDROID_HOME no está configurado"
    echo "   Por favor, configura la variable de entorno ANDROID_HOME"
    echo "   Ejemplo: export ANDROID_HOME=~/Android/Sdk"
    exit 1
fi

echo "✅ ANDROID_HOME: $ANDROID_HOME"

# Verificar Java
if ! command -v java &> /dev/null; then
    echo "❌ Error: Java no está instalado"
    echo "   Por favor, instala Java JDK 17+"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -1)
echo "✅ Java: $JAVA_VERSION"

# Navegar al directorio Android
cd "$(dirname "$0")"

echo ""
echo "📦 Compilando APK de Debug..."
echo ""

# Compilar APK de Debug
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ APK de Debug compilado exitosamente!"
    echo "📍 Ubicación: app/build/outputs/apk/debug/app-debug.apk"
    
    # Copiar a ubicación fácil de encontrar
    mkdir -p ../dist
    cp app/build/outputs/apk/debug/app-debug.apk ../dist/ManoProtect-debug.apk
    echo "📱 Copiado a: dist/ManoProtect-debug.apk"
else
    echo "❌ Error al compilar APK de Debug"
    exit 1
fi

echo ""
read -p "¿Quieres compilar también el AAB para Play Store? (s/n): " compile_release

if [ "$compile_release" = "s" ] || [ "$compile_release" = "S" ]; then
    echo ""
    echo "📦 Compilando AAB de Release..."
    echo ""
    
    ./gradlew bundleRelease
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ AAB de Release compilado exitosamente!"
        echo "📍 Ubicación: app/build/outputs/bundle/release/app-release.aab"
        
        cp app/build/outputs/bundle/release/app-release.aab ../dist/ManoProtect-release.aab
        echo "📱 Copiado a: dist/ManoProtect-release.aab"
    else
        echo "❌ Error al compilar AAB de Release"
    fi
fi

echo ""
echo "======================================="
echo "🎉 ¡Compilación completada!"
echo ""
echo "Archivos generados:"
ls -la ../dist/
echo ""
echo "Para subir a Play Store, usa el archivo .aab"
echo "Para probar en tu dispositivo, usa el archivo .apk"
