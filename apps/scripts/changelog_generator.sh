#!/bin/bash
# ============================================
# ManoProtect - Changelog Generator
# Genera changelog automático basado en commits de Git
# Uso: ./changelog_generator.sh <comerciales|instaladores|admin|all>
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="$ROOT_DIR/logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$LOGS_DIR"

generate_changelog() {
    local APP_NAME="$1"
    local APP_DIR="$ROOT_DIR/$APP_NAME"
    local VERSION_FILE="$APP_DIR/version.properties"
    local OUTPUT="$LOGS_DIR/changelog_${APP_NAME}_${TIMESTAMP}.txt"
    local LATEST="$LOGS_DIR/changelog_${APP_NAME}_latest.txt"
    
    echo "=========================================="
    echo "Generando changelog para: $APP_NAME"
    echo "=========================================="
    
    local VERSION_NAME="1.0.0"
    local VERSION_CODE="1"
    if [ -f "$VERSION_FILE" ]; then
        VERSION_NAME=$(grep VERSION_NAME "$VERSION_FILE" | cut -d= -f2)
        VERSION_CODE=$(grep VERSION_CODE "$VERSION_FILE" | cut -d= -f2)
    fi
    
    {
        echo "# Changelog - ManoProtect $APP_NAME"
        echo "## Versión $VERSION_NAME (Build $VERSION_CODE)"
        echo "Fecha: $(date '+%d/%m/%Y %H:%M')"
        echo ""
        
        # Try to get git log for the app directory
        if git -C "$ROOT_DIR/.." log --oneline -20 -- "$APP_NAME/" 2>/dev/null | head -20 | grep -q .; then
            echo "### Cambios recientes"
            git -C "$ROOT_DIR/.." log --oneline -20 -- "$APP_NAME/" 2>/dev/null | while read -r line; do
                echo "- $line"
            done
        else
            # Fallback: generate from deploy history
            echo "### Cambios en esta versión"
            if [ -f "$LOGS_DIR/deploy_history.jsonl" ]; then
                echo "- Última versión desplegada"
                grep "$APP_NAME" "$LOGS_DIR/deploy_history.jsonl" 2>/dev/null | tail -3 | while read -r line; do
                    echo "- Deploy: $line"
                done
            fi
            echo "- Mejoras de rendimiento y estabilidad"
            echo "- Correcciones de errores menores"
            echo "- Actualización de seguridad"
        fi
        
        echo ""
        echo "### Funcionalidades principales"
        case "$APP_NAME" in
            comerciales)
                echo "- Consulta de stock en tiempo real"
                echo "- Creación de pedidos y presupuestos"
                echo "- Historial de clientes"
                echo "- Notificaciones de stock bajo"
                ;;
            instaladores)
                echo "- Órdenes de instalación asignadas"
                echo "- Actualización de estado en tiempo real"
                echo "- Manuales de instalación"
                echo "- Notificaciones de nuevas asignaciones"
                ;;
            admin)
                echo "- Dashboard con métricas en tiempo real"
                echo "- Gestión de usuarios y roles"
                echo "- Control de inventario"
                echo "- Gestión de pedidos e instalaciones"
                echo "- Logs de auditoría"
                ;;
        esac
    } > "$OUTPUT"
    
    # Copy as latest
    cp "$OUTPUT" "$LATEST"
    
    echo "Changelog generado: $OUTPUT"
    echo "Última versión: $LATEST"
    cat "$OUTPUT"
}

case "$1" in
    comerciales|instaladores|admin)
        generate_changelog "$1"
        ;;
    all)
        for app in comerciales instaladores admin; do
            generate_changelog "$app"
            echo ""
        done
        ;;
    *)
        echo "Uso: $0 <comerciales|instaladores|admin|all>"
        exit 1
        ;;
esac
