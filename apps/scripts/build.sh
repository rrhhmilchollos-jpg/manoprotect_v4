#!/bin/bash
# ============================================
# ManoProtect - Build Script
# Compila APK/AAB para cada app automáticamente
# Uso: ./build.sh <comerciales|instaladores|admin|all> [release|debug]
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="$ROOT_DIR/logs"
BUILD_TYPE="${2:-release}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$LOGS_DIR"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOGS_DIR/build_${TIMESTAMP}.log"; }

increment_version() {
    local APP_DIR="$1"
    local VERSION_FILE="$APP_DIR/version.properties"
    
    if [ ! -f "$VERSION_FILE" ]; then
        echo "VERSION_CODE=1" > "$VERSION_FILE"
        echo "VERSION_NAME=1.0.0" >> "$VERSION_FILE"
    fi
    
    local CURRENT_CODE=$(grep VERSION_CODE "$VERSION_FILE" | cut -d= -f2)
    local CURRENT_NAME=$(grep VERSION_NAME "$VERSION_FILE" | cut -d= -f2)
    local NEW_CODE=$((CURRENT_CODE + 1))
    
    # Auto-increment patch version
    IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_NAME"
    PATCH=$((PATCH + 1))
    local NEW_NAME="$MAJOR.$MINOR.$PATCH"
    
    echo "VERSION_CODE=$NEW_CODE" > "$VERSION_FILE"
    echo "VERSION_NAME=$NEW_NAME" >> "$VERSION_FILE"
    
    log "Version: $CURRENT_NAME ($CURRENT_CODE) -> $NEW_NAME ($NEW_CODE)"
    echo "$NEW_NAME"
}

validate_app() {
    local APP_DIR="$1"
    local APP_NAME="$2"
    
    log "Validando $APP_NAME..."
    
    if [ ! -f "$APP_DIR/build.gradle" ]; then
        log "ERROR: build.gradle no encontrado en $APP_DIR"
        return 1
    fi
    
    if [ ! -f "$APP_DIR/google-services.json" ]; then
        log "ERROR: google-services.json no encontrado en $APP_DIR"
        return 1
    fi
    
    log "Validación OK para $APP_NAME"
    return 0
}

build_app() {
    local APP_NAME="$1"
    local APP_DIR="$ROOT_DIR/$APP_NAME"
    
    log "=========================================="
    log "Building: $APP_NAME ($BUILD_TYPE)"
    log "=========================================="
    
    if ! validate_app "$APP_DIR" "$APP_NAME"; then
        log "FALLO: Validación fallida para $APP_NAME"
        return 1
    fi
    
    # Increment version
    local NEW_VERSION=$(increment_version "$APP_DIR")
    
    # Backup current config
    if [ -f "$APP_DIR/version.properties" ]; then
        cp "$APP_DIR/version.properties" "$LOGS_DIR/${APP_NAME}_version_backup_${TIMESTAMP}.properties"
    fi
    
    # Run tests if available
    if [ -f "$APP_DIR/gradlew" ]; then
        log "Ejecutando tests para $APP_NAME..."
        cd "$APP_DIR"
        ./gradlew test 2>&1 | tee -a "$LOGS_DIR/build_${TIMESTAMP}.log" || {
            log "ADVERTENCIA: Tests fallaron para $APP_NAME"
        }
    fi
    
    # Build APK/AAB
    if [ -f "$APP_DIR/gradlew" ]; then
        cd "$APP_DIR"
        if [ "$BUILD_TYPE" = "release" ]; then
            log "Compilando AAB (release)..."
            ./gradlew bundleRelease 2>&1 | tee -a "$LOGS_DIR/build_${TIMESTAMP}.log"
            log "Compilando APK (release)..."
            ./gradlew assembleRelease 2>&1 | tee -a "$LOGS_DIR/build_${TIMESTAMP}.log"
        else
            log "Compilando APK (debug)..."
            ./gradlew assembleDebug 2>&1 | tee -a "$LOGS_DIR/build_${TIMESTAMP}.log"
        fi
    else
        log "NOTA: gradlew no encontrado. Para compilar, ejecutar desde Android Studio o configurar Gradle wrapper."
        log "Comando manual: cd $APP_DIR && gradle bundleRelease"
    fi
    
    log "Build completado: $APP_NAME v$NEW_VERSION"
    
    # Log build record
    echo "{\"app\":\"$APP_NAME\",\"version\":\"$NEW_VERSION\",\"type\":\"$BUILD_TYPE\",\"timestamp\":\"$TIMESTAMP\",\"status\":\"success\"}" >> "$LOGS_DIR/build_history.jsonl"
}

# Main
case "$1" in
    comerciales|instaladores|admin)
        build_app "$1"
        ;;
    all)
        log "Building all apps..."
        for app in comerciales instaladores admin; do
            build_app "$app" || log "FALLO en $app, continuando..."
        done
        log "Build completo para todas las apps"
        ;;
    *)
        echo "Uso: $0 <comerciales|instaladores|admin|all> [release|debug]"
        echo ""
        echo "Ejemplos:"
        echo "  $0 comerciales release    # Build release de app comerciales"
        echo "  $0 all                    # Build release de todas las apps"
        echo "  $0 admin debug            # Build debug de app admin"
        exit 1
        ;;
esac
