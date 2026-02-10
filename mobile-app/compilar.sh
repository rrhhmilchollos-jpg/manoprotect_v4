#!/bin/bash
# ============================================
# COMPILAR MANOPROTECT - Android AAB (macOS/Linux)
# ============================================
# Requisitos:
#   - JDK 17
#   - Node.js 18+
#   - Android SDK
# ============================================

set -e

CLEAN=false
SKIP_BUNDLE=false

for arg in "$@"; do
    case $arg in
        --clean) CLEAN=true ;;
        --skip-bundle) SKIP_BUNDLE=true ;;
    esac
done

echo ""
echo "========================================"
echo "  COMPILAR MANOPROTECT v2.0.1 - AAB"
echo "========================================"
echo ""

# Verificar Java
echo "[1/7] Verificando Java..."
if ! command -v java &> /dev/null; then
    echo "  ERROR: Java no encontrado. Instala JDK 17"
    exit 1
fi
java -version 2>&1 | head -1
echo "  OK"

# Verificar Node
echo "[2/7] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "  ERROR: Node.js no encontrado"
    exit 1
fi
echo "  OK: Node $(node --version)"

# Directorio
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"
echo "[3/7] Directorio: $SCRIPT_DIR"

# Instalar dependencias
echo "[4/7] Instalando dependencias..."
if [ -f "yarn.lock" ]; then
    yarn install
else
    npm install --legacy-peer-deps
fi
echo "  OK"

# Bundle JS
echo "[5/7] Creando bundle JavaScript..."
mkdir -p android/app/src/main/assets

if [ "$SKIP_BUNDLE" = false ]; then
    npx react-native bundle \
        --platform android \
        --dev false \
        --entry-file index.js \
        --bundle-output android/app/src/main/assets/index.android.bundle \
        --assets-dest android/app/src/main/res/
    echo "  OK"
else
    echo "  SKIP"
fi

# Entrar a android
cd android
chmod +x gradlew

# Limpiar
if [ "$CLEAN" = true ]; then
    echo "[6/7] Limpiando build anterior..."
    ./gradlew clean
    echo "  OK"
else
    echo "[6/7] Limpieza omitida (usa --clean para forzar)"
fi

# Compilar
echo "[7/7] Compilando AAB de release..."
echo "  Esto puede tardar varios minutos..."
./gradlew bundleRelease --no-daemon --stacktrace

# Verificar
AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
if [ -f "$AAB_PATH" ]; then
    SIZE=$(du -h "$AAB_PATH" | cut -f1)
    echo ""
    echo "========================================"
    echo "  COMPILACION EXITOSA!"
    echo "========================================"
    echo "  Archivo: $AAB_PATH"
    echo "  Tamano: $SIZE"
    echo ""
    echo "  Sube este archivo a Google Play Console"
    echo "  https://play.google.com/console"
    echo ""
else
    echo ""
    echo "========================================"
    echo "  ERROR: AAB no generado"
    echo "========================================"
    exit 1
fi

cd "$SCRIPT_DIR"
