#!/bin/bash
# ============================================
# ManoProtect - Rollback Script
# Revierte a la versión anterior si hay errores
# Uso: ./rollback.sh <comerciales|instaladores|admin>
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="$ROOT_DIR/logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$LOGS_DIR"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOGS_DIR/rollback_${TIMESTAMP}.log"; }

rollback_app() {
    local APP_NAME="$1"
    local APP_DIR="$ROOT_DIR/$APP_NAME"
    local VERSION_FILE="$APP_DIR/version.properties"
    
    log "=========================================="
    log "ROLLBACK: $APP_NAME"
    log "=========================================="
    
    # Find latest backup
    local LATEST_BACKUP=$(ls -t "$LOGS_DIR/${APP_NAME}_version_backup_"*.properties 2>/dev/null | head -1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        log "ERROR: No se encontró backup de versión para $APP_NAME"
        log "Archivos disponibles en $LOGS_DIR:"
        ls -la "$LOGS_DIR/${APP_NAME}_"* 2>/dev/null || echo "Ninguno"
        return 1
    fi
    
    # Current version
    local CURRENT_VERSION=$(grep VERSION_NAME "$VERSION_FILE" | cut -d= -f2)
    local CURRENT_CODE=$(grep VERSION_CODE "$VERSION_FILE" | cut -d= -f2)
    
    # Backup version
    local BACKUP_VERSION=$(grep VERSION_NAME "$LATEST_BACKUP" | cut -d= -f2)
    local BACKUP_CODE=$(grep VERSION_CODE "$LATEST_BACKUP" | cut -d= -f2)
    
    log "Versión actual: $CURRENT_VERSION ($CURRENT_CODE)"
    log "Rollback a:     $BACKUP_VERSION ($BACKUP_CODE)"
    
    # Backup current before rollback
    cp "$VERSION_FILE" "$LOGS_DIR/${APP_NAME}_pre_rollback_${TIMESTAMP}.properties"
    
    # Restore backup
    cp "$LATEST_BACKUP" "$VERSION_FILE"
    
    log "Versión restaurada: $BACKUP_VERSION ($BACKUP_CODE)"
    log "Para redesplegar, ejecutar: ./build.sh $APP_NAME && ./deploy_playstore.sh $APP_NAME"
    
    echo "{\"app\":\"$APP_NAME\",\"from\":\"$CURRENT_VERSION\",\"to\":\"$BACKUP_VERSION\",\"timestamp\":\"$TIMESTAMP\",\"status\":\"rolled_back\"}" >> "$LOGS_DIR/rollback_history.jsonl"
    
    log "ROLLBACK COMPLETADO para $APP_NAME"
}

case "$1" in
    comerciales|instaladores|admin)
        rollback_app "$1"
        ;;
    *)
        echo "Uso: $0 <comerciales|instaladores|admin>"
        echo ""
        echo "Revierte la versión de la app al último backup disponible."
        echo "Los backups se crean automáticamente al ejecutar build.sh"
        exit 1
        ;;
esac
