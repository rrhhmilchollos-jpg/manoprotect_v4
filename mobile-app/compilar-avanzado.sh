#!/bin/bash
# ============================================
# MANOPROTECT - Script de Compilacion Avanzado
# Version: 2.1.0
# ============================================
#
# Uso:
#   ./compilar-avanzado.sh              # Build release AAB
#   ./compilar-avanzado.sh --apk        # Build release APK
#   ./compilar-avanzado.sh --debug      # Build debug APK
#   ./compilar-avanzado.sh --clean      # Clean before build
#   ./compilar-avanzado.sh --skip-bundle # Skip JS bundle
#   ./compilar-avanzado.sh --analyze    # Analyze APK/AAB size
#   ./compilar-avanzado.sh --sign-info  # Show signing info
#   ./compilar-avanzado.sh --doctor     # Check environment
#   ./compilar-avanzado.sh --all        # Clean + Bundle + AAB + APK
#
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
APP_NAME="ManoProtect"
APP_VERSION="2.0.1"
BUILD_TYPE="release"
BUILD_FORMAT="aab"
CLEAN=false
SKIP_BUNDLE=false
ANALYZE=false
SIGN_INFO=false
DOCTOR=false
BUILD_ALL=false
START_TIME=$(date +%s)

# Script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANDROID_DIR="$SCRIPT_DIR/android"
AAB_PATH="$ANDROID_DIR/app/build/outputs/bundle/release/app-release.aab"
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
DEBUG_APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
LOG_DIR="$SCRIPT_DIR/build-logs"
LOG_FILE="$LOG_DIR/build_$(date +%Y%m%d_%H%M%S).log"

# ============================================
# HELPER FUNCTIONS
# ============================================

print_header() {
    echo ""
    echo -e "${BLUE}${BOLD}========================================"
    echo -e "  $APP_NAME v$APP_VERSION - Build System"
    echo -e "========================================${NC}"
    echo ""
}

print_step() {
    local step=$1
    local total=$2
    local msg=$3
    echo -e "${CYAN}[$step/$total]${NC} ${BOLD}$msg${NC}"
}

print_ok() {
    echo -e "  ${GREEN}OK${NC} $1"
}

print_warn() {
    echo -e "  ${YELLOW}WARN${NC} $1"
}

print_error() {
    echo -e "  ${RED}ERROR${NC} $1"
}

print_info() {
    echo -e "  ${BLUE}INFO${NC} $1"
}

elapsed_time() {
    local end_time=$(date +%s)
    local elapsed=$((end_time - START_TIME))
    local minutes=$((elapsed / 60))
    local seconds=$((elapsed % 60))
    echo "${minutes}m ${seconds}s"
}

# ============================================
# PARSE ARGUMENTS
# ============================================

for arg in "$@"; do
    case $arg in
        --clean)       CLEAN=true ;;
        --skip-bundle) SKIP_BUNDLE=true ;;
        --apk)         BUILD_FORMAT="apk" ;;
        --debug)       BUILD_TYPE="debug"; BUILD_FORMAT="apk" ;;
        --analyze)     ANALYZE=true ;;
        --sign-info)   SIGN_INFO=true ;;
        --doctor)      DOCTOR=true ;;
        --all)         BUILD_ALL=true; CLEAN=true ;;
        --help|-h)
            echo "Uso: $0 [opciones]"
            echo ""
            echo "Opciones:"
            echo "  --clean        Limpiar build anterior"
            echo "  --skip-bundle  No crear bundle JS"
            echo "  --apk          Generar APK (en vez de AAB)"
            echo "  --debug        Build de debug"
            echo "  --analyze      Analizar tamano del build"
            echo "  --sign-info    Mostrar info de firma"
            echo "  --doctor       Verificar entorno"
            echo "  --all          Clean + Bundle + AAB + APK"
            echo "  --help         Mostrar esta ayuda"
            exit 0
            ;;
        *)
            echo "Opcion desconocida: $arg"
            echo "Usa --help para ver opciones disponibles"
            exit 1
            ;;
    esac
done

# ============================================
# DOCTOR MODE - Environment Check
# ============================================

run_doctor() {
    echo -e "\n${BOLD}Diagnostico del Entorno${NC}\n"
    local issues=0

    # Java
    echo -e "${CYAN}Java:${NC}"
    if command -v java &> /dev/null; then
        JAVA_VER=$(java -version 2>&1 | head -1)
        print_ok "$JAVA_VER"
        if ! echo "$JAVA_VER" | grep -q "17\|18\|19\|20\|21"; then
            print_warn "Se recomienda JDK 17+"
            issues=$((issues + 1))
        fi
    else
        print_error "Java no encontrado"
        issues=$((issues + 1))
    fi

    # JAVA_HOME
    echo -e "${CYAN}JAVA_HOME:${NC}"
    if [ -n "$JAVA_HOME" ]; then
        print_ok "$JAVA_HOME"
    else
        print_warn "JAVA_HOME no configurado (puede causar problemas)"
        issues=$((issues + 1))
    fi

    # Node.js
    echo -e "${CYAN}Node.js:${NC}"
    if command -v node &> /dev/null; then
        NODE_VER=$(node --version)
        print_ok "$NODE_VER"
        NODE_MAJOR=$(echo "$NODE_VER" | sed 's/v//' | cut -d. -f1)
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_warn "Se recomienda Node 18+"
            issues=$((issues + 1))
        fi
    else
        print_error "Node.js no encontrado"
        issues=$((issues + 1))
    fi

    # Yarn/npm
    echo -e "${CYAN}Package Manager:${NC}"
    if command -v yarn &> /dev/null; then
        print_ok "yarn $(yarn --version)"
    elif command -v npm &> /dev/null; then
        print_ok "npm $(npm --version)"
    else
        print_error "npm/yarn no encontrado"
        issues=$((issues + 1))
    fi

    # Android SDK
    echo -e "${CYAN}Android SDK:${NC}"
    if [ -n "$ANDROID_HOME" ]; then
        print_ok "$ANDROID_HOME"
    elif [ -n "$ANDROID_SDK_ROOT" ]; then
        print_ok "$ANDROID_SDK_ROOT"
    else
        print_warn "ANDROID_HOME/ANDROID_SDK_ROOT no configurado"
        issues=$((issues + 1))
    fi

    # Gradle wrapper
    echo -e "${CYAN}Gradle Wrapper:${NC}"
    if [ -f "$ANDROID_DIR/gradlew" ]; then
        print_ok "Encontrado"
        if [ ! -x "$ANDROID_DIR/gradlew" ]; then
            print_warn "gradlew no tiene permisos de ejecucion"
        fi
    else
        print_error "gradlew no encontrado en $ANDROID_DIR"
        issues=$((issues + 1))
    fi

    # Keystore
    echo -e "${CYAN}Keystore:${NC}"
    KS_FILE=$(grep "MYAPP_UPLOAD_STORE_FILE" "$ANDROID_DIR/gradle.properties" 2>/dev/null | cut -d= -f2)
    if [ -n "$KS_FILE" ] && [ -f "$ANDROID_DIR/app/$KS_FILE" ]; then
        print_ok "$KS_FILE encontrado"
    elif [ -n "$KS_FILE" ]; then
        print_warn "Keystore configurado ($KS_FILE) pero archivo no encontrado"
        issues=$((issues + 1))
    else
        print_warn "No hay keystore configurado"
        issues=$((issues + 1))
    fi

    # node_modules
    echo -e "${CYAN}Dependencias:${NC}"
    if [ -d "$SCRIPT_DIR/node_modules" ]; then
        DEP_COUNT=$(ls "$SCRIPT_DIR/node_modules" | wc -l)
        print_ok "$DEP_COUNT paquetes instalados"
    else
        print_warn "node_modules no encontrado (ejecuta yarn install)"
        issues=$((issues + 1))
    fi

    # Disk space
    echo -e "${CYAN}Espacio en disco:${NC}"
    DISK_FREE=$(df -h "$SCRIPT_DIR" | tail -1 | awk '{print $4}')
    print_info "$DISK_FREE disponible"

    # Summary
    echo ""
    if [ $issues -eq 0 ]; then
        echo -e "${GREEN}${BOLD}Entorno OK - Listo para compilar${NC}"
    else
        echo -e "${YELLOW}${BOLD}$issues problemas detectados${NC}"
    fi
    echo ""
}

if [ "$DOCTOR" = true ]; then
    print_header
    run_doctor
    exit 0
fi

# ============================================
# SIGN INFO MODE
# ============================================

if [ "$SIGN_INFO" = true ]; then
    print_header
    echo -e "${BOLD}Informacion de Firma${NC}\n"

    KS_FILE=$(grep "MYAPP_UPLOAD_STORE_FILE" "$ANDROID_DIR/gradle.properties" 2>/dev/null | cut -d= -f2)
    KS_ALIAS=$(grep "MYAPP_UPLOAD_KEY_ALIAS" "$ANDROID_DIR/gradle.properties" 2>/dev/null | cut -d= -f2)
    KS_PATH="$ANDROID_DIR/app/$KS_FILE"

    echo -e "${CYAN}Keystore:${NC} $KS_FILE"
    echo -e "${CYAN}Alias:${NC} $KS_ALIAS"

    if [ -f "$KS_PATH" ] && command -v keytool &> /dev/null; then
        KS_PASS=$(grep "MYAPP_UPLOAD_STORE_PASSWORD" "$ANDROID_DIR/gradle.properties" 2>/dev/null | cut -d= -f2)
        echo ""
        keytool -list -v -keystore "$KS_PATH" -storepass "$KS_PASS" -alias "$KS_ALIAS" 2>/dev/null | head -20 || print_warn "No se pudo leer el keystore"
    fi
    exit 0
fi

# ============================================
# MAIN BUILD FLOW
# ============================================

print_header

# Create log directory
mkdir -p "$LOG_DIR"

echo -e "${BLUE}Configuracion:${NC}"
echo -e "  Tipo: ${BOLD}$BUILD_TYPE${NC}"
echo -e "  Formato: ${BOLD}$BUILD_FORMAT${NC}"
echo -e "  Clean: $CLEAN"
echo -e "  Log: $LOG_FILE"
echo ""

TOTAL_STEPS=7
if [ "$BUILD_ALL" = true ]; then
    TOTAL_STEPS=9
fi

# Step 1: Java
print_step 1 $TOTAL_STEPS "Verificando Java..."
if ! command -v java &> /dev/null; then
    print_error "Java no encontrado. Instala JDK 17"
    exit 1
fi
JAVA_VER=$(java -version 2>&1 | head -1)
print_ok "$JAVA_VER"

# Step 2: Node.js
print_step 2 $TOTAL_STEPS "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no encontrado"
    exit 1
fi
print_ok "Node $(node --version)"

# Step 3: Navigate
print_step 3 $TOTAL_STEPS "Preparando directorio..."
cd "$SCRIPT_DIR"
print_ok "$SCRIPT_DIR"

# Step 4: Install dependencies
print_step 4 $TOTAL_STEPS "Instalando dependencias..."
if [ -f "yarn.lock" ]; then
    yarn install --frozen-lockfile 2>&1 | tail -3 | tee -a "$LOG_FILE"
else
    npm install --legacy-peer-deps 2>&1 | tail -3 | tee -a "$LOG_FILE"
fi
print_ok "Dependencias instaladas"

# Step 5: JS Bundle
print_step 5 $TOTAL_STEPS "Creando bundle JavaScript..."
mkdir -p android/app/src/main/assets

if [ "$SKIP_BUNDLE" = false ]; then
    npx react-native bundle \
        --platform android \
        --dev false \
        --entry-file index.js \
        --bundle-output android/app/src/main/assets/index.android.bundle \
        --assets-dest android/app/src/main/res/ \
        2>&1 | tee -a "$LOG_FILE"

    BUNDLE_SIZE=$(du -h android/app/src/main/assets/index.android.bundle 2>/dev/null | cut -f1)
    print_ok "Bundle creado ($BUNDLE_SIZE)"
else
    print_warn "Bundle omitido (--skip-bundle)"
fi

# Step 6: Clean (optional)
cd android
chmod +x gradlew

print_step 6 $TOTAL_STEPS "Limpieza..."
if [ "$CLEAN" = true ]; then
    ./gradlew clean 2>&1 | tee -a "$LOG_FILE"
    print_ok "Limpieza completada"
else
    print_info "Omitida (usa --clean para forzar)"
fi

# Step 7: Build
print_step 7 $TOTAL_STEPS "Compilando ($BUILD_TYPE $BUILD_FORMAT)..."
echo -e "  ${YELLOW}Esto puede tardar varios minutos...${NC}"

if [ "$BUILD_TYPE" = "debug" ]; then
    ./gradlew assembleDebug --no-daemon --stacktrace 2>&1 | tee -a "$LOG_FILE"
    OUTPUT_PATH="$DEBUG_APK_PATH"
elif [ "$BUILD_FORMAT" = "apk" ]; then
    ./gradlew assembleRelease --no-daemon --stacktrace 2>&1 | tee -a "$LOG_FILE"
    OUTPUT_PATH="$APK_PATH"
else
    ./gradlew bundleRelease --no-daemon --stacktrace 2>&1 | tee -a "$LOG_FILE"
    OUTPUT_PATH="$AAB_PATH"
fi

# Build ALL: also build the other format
if [ "$BUILD_ALL" = true ]; then
    print_step 8 $TOTAL_STEPS "Compilando APK adicional..."
    if [ "$BUILD_FORMAT" = "aab" ]; then
        ./gradlew assembleRelease --no-daemon 2>&1 | tee -a "$LOG_FILE"
        print_ok "APK generado"
    fi

    print_step 9 $TOTAL_STEPS "Compilando AAB adicional..."
    if [ "$BUILD_FORMAT" = "apk" ]; then
        ./gradlew bundleRelease --no-daemon 2>&1 | tee -a "$LOG_FILE"
        print_ok "AAB generado"
    fi
fi

# ============================================
# VERIFY OUTPUT
# ============================================

cd "$SCRIPT_DIR"

echo ""
echo -e "${BLUE}${BOLD}========================================${NC}"

# Check AAB
if [ -f "$AAB_PATH" ]; then
    AAB_SIZE=$(du -h "$AAB_PATH" | cut -f1)
    echo -e "${GREEN}${BOLD}  AAB GENERADO CORRECTAMENTE${NC}"
    echo -e "  Archivo: $AAB_PATH"
    echo -e "  Tamano:  $AAB_SIZE"
fi

# Check Release APK
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo -e "${GREEN}${BOLD}  APK RELEASE GENERADO${NC}"
    echo -e "  Archivo: $APK_PATH"
    echo -e "  Tamano:  $APK_SIZE"
fi

# Check Debug APK
if [ "$BUILD_TYPE" = "debug" ] && [ -f "$DEBUG_APK_PATH" ]; then
    DBG_SIZE=$(du -h "$DEBUG_APK_PATH" | cut -f1)
    echo -e "${GREEN}${BOLD}  APK DEBUG GENERADO${NC}"
    echo -e "  Archivo: $DEBUG_APK_PATH"
    echo -e "  Tamano:  $DBG_SIZE"
fi

# Check if nothing was generated
if [ ! -f "$AAB_PATH" ] && [ ! -f "$APK_PATH" ] && [ ! -f "$DEBUG_APK_PATH" ]; then
    echo -e "${RED}${BOLD}  ERROR: No se genero ningun archivo${NC}"
    echo -e "  Revisa el log: $LOG_FILE"
    echo -e "${BLUE}${BOLD}========================================${NC}"
    exit 1
fi

ELAPSED=$(elapsed_time)
echo ""
echo -e "  Tiempo total: ${BOLD}$ELAPSED${NC}"
echo -e "  Log: $LOG_FILE"
echo ""

# ============================================
# ANALYZE (optional)
# ============================================

if [ "$ANALYZE" = true ]; then
    echo -e "\n${BOLD}Analisis del Build${NC}\n"

    if [ -f "$AAB_PATH" ]; then
        echo -e "${CYAN}AAB Info:${NC}"
        echo "  Tamano: $(du -h "$AAB_PATH" | cut -f1)"
        echo "  SHA-256: $(sha256sum "$AAB_PATH" | cut -d' ' -f1)"
        echo "  Fecha: $(stat -c %y "$AAB_PATH" 2>/dev/null || stat -f %Sm "$AAB_PATH" 2>/dev/null)"
    fi

    if [ -f "$APK_PATH" ]; then
        echo -e "${CYAN}APK Info:${NC}"
        echo "  Tamano: $(du -h "$APK_PATH" | cut -f1)"
        echo "  SHA-256: $(sha256sum "$APK_PATH" | cut -d' ' -f1)"
    fi
fi

echo -e "${GREEN}${BOLD}  Sube el AAB a Google Play Console${NC}"
echo -e "  https://play.google.com/console"
echo -e "${BLUE}${BOLD}========================================${NC}"
echo ""
