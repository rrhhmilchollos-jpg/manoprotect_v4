#!/bin/bash
# ============================================
# ManoProtect - Deploy to Play Store
# Sube APK/AAB a Google Play usando la API
# Uso: ./deploy_playstore.sh <comerciales|instaladores|admin|all> [production|beta|internal]
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="$ROOT_DIR/logs"
TRACK="${2:-internal}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$LOGS_DIR"

log() { echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOGS_DIR/deploy_${TIMESTAMP}.log"; }

# Google Play API configuration
SERVICE_ACCOUNT_JSON="${GOOGLE_PLAY_SERVICE_ACCOUNT:-$ROOT_DIR/play-store-credentials.json}"

PACKAGE_NAMES=(
    ["comerciales"]="com.manoprotect.comerciales"
    ["instaladores"]="com.manoprotect.instaladores"
    ["admin"]="com.manoprotect.admin"
)

get_access_token() {
    if [ ! -f "$SERVICE_ACCOUNT_JSON" ]; then
        log "ERROR: Archivo de credenciales no encontrado: $SERVICE_ACCOUNT_JSON"
        log "Descarga las credenciales desde Google Play Console > API Access"
        return 1
    fi
    
    # Use Python to generate OAuth2 token from service account
    python3 -c "
import json, time, jwt, requests

with open('$SERVICE_ACCOUNT_JSON') as f:
    creds = json.load(f)

now = int(time.time())
payload = {
    'iss': creds['client_email'],
    'scope': 'https://www.googleapis.com/auth/androidpublisher',
    'aud': 'https://oauth2.googleapis.com/token',
    'iat': now,
    'exp': now + 3600
}
token = jwt.encode(payload, creds['private_key'], algorithm='RS256')
r = requests.post('https://oauth2.googleapis.com/token', data={
    'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    'assertion': token
})
print(r.json()['access_token'])
" 2>"$LOGS_DIR/auth_error_${TIMESTAMP}.log"
}

deploy_app() {
    local APP_NAME="$1"
    local APP_DIR="$ROOT_DIR/$APP_NAME"
    local PACKAGE_NAME="${PACKAGE_NAMES[$APP_NAME]}"
    
    log "=========================================="
    log "Deploying: $APP_NAME -> $TRACK"
    log "Package: $PACKAGE_NAME"
    log "=========================================="
    
    # Find AAB file
    local AAB_FILE=$(find "$APP_DIR" -name "*.aab" -path "*/release/*" 2>/dev/null | head -1)
    
    if [ -z "$AAB_FILE" ]; then
        log "ERROR: AAB no encontrado. Ejecuta build.sh primero."
        log "Buscando en: $APP_DIR"
        return 1
    fi
    
    log "AAB encontrado: $AAB_FILE"
    
    # Get version info
    local VERSION_FILE="$APP_DIR/version.properties"
    local VERSION_NAME=$(grep VERSION_NAME "$VERSION_FILE" | cut -d= -f2)
    local VERSION_CODE=$(grep VERSION_CODE "$VERSION_FILE" | cut -d= -f2)
    
    log "Versión: $VERSION_NAME ($VERSION_CODE)"
    
    # Get changelog
    local CHANGELOG=""
    if [ -f "$ROOT_DIR/logs/changelog_${APP_NAME}_latest.txt" ]; then
        CHANGELOG=$(cat "$ROOT_DIR/logs/changelog_${APP_NAME}_latest.txt")
    else
        CHANGELOG="Versión $VERSION_NAME - Mejoras de rendimiento y corrección de errores."
    fi
    
    # Get access token
    log "Obteniendo token de autenticación..."
    local ACCESS_TOKEN
    ACCESS_TOKEN=$(get_access_token) || {
        log "ERROR: No se pudo obtener token. Verifica las credenciales."
        echo "{\"app\":\"$APP_NAME\",\"version\":\"$VERSION_NAME\",\"track\":\"$TRACK\",\"timestamp\":\"$TIMESTAMP\",\"status\":\"auth_failed\"}" >> "$LOGS_DIR/deploy_history.jsonl"
        return 1
    }
    
    # Step 1: Create edit
    log "Creando edit en Play Console..."
    local EDIT_ID
    EDIT_ID=$(curl -s -X POST \
        "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/$PACKAGE_NAME/edits" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{}' | python3 -c "import sys,json;print(json.load(sys.stdin).get('id',''))")
    
    if [ -z "$EDIT_ID" ]; then
        log "ERROR: No se pudo crear edit"
        return 1
    fi
    log "Edit ID: $EDIT_ID"
    
    # Step 2: Upload AAB
    log "Subiendo AAB ($AAB_FILE)..."
    local UPLOAD_RESULT
    UPLOAD_RESULT=$(curl -s -X POST \
        "https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/$PACKAGE_NAME/edits/$EDIT_ID/bundles" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/octet-stream" \
        --data-binary "@$AAB_FILE")
    
    log "Upload result: $UPLOAD_RESULT"
    
    # Step 3: Set track
    log "Configurando track: $TRACK..."
    curl -s -X PUT \
        "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/$PACKAGE_NAME/edits/$EDIT_ID/tracks/$TRACK" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"track\":\"$TRACK\",\"releases\":[{\"versionCodes\":[\"$VERSION_CODE\"],\"releaseNotes\":[{\"language\":\"es-ES\",\"text\":\"$CHANGELOG\"}],\"status\":\"completed\"}]}"
    
    # Step 4: Commit
    log "Publicando cambios..."
    local COMMIT_RESULT
    COMMIT_RESULT=$(curl -s -X POST \
        "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/$PACKAGE_NAME/edits/$EDIT_ID:commit" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    log "Deploy completado: $APP_NAME v$VERSION_NAME -> $TRACK"
    echo "{\"app\":\"$APP_NAME\",\"version\":\"$VERSION_NAME\",\"code\":$VERSION_CODE,\"track\":\"$TRACK\",\"timestamp\":\"$TIMESTAMP\",\"status\":\"success\"}" >> "$LOGS_DIR/deploy_history.jsonl"
    
    # Notify backend about new version
    local API_URL="${MANOPROTECT_API_URL:-https://www.manoprotect.com}"
    local ADMIN_TOKEN="${MANOPROTECT_ADMIN_TOKEN:-}"
    if [ -n "$ADMIN_TOKEN" ]; then
        curl -s -X PUT "$API_URL/api/gestion/app-versions/$APP_NAME" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"version_name\":\"$VERSION_NAME\",\"version_code\":$VERSION_CODE,\"release_notes\":\"$CHANGELOG\"}"
        log "Backend notificado de nueva versión"
    fi
}

# Main
case "$1" in
    comerciales|instaladores|admin)
        deploy_app "$1"
        ;;
    all)
        log "Deploying all apps to $TRACK..."
        for app in comerciales instaladores admin; do
            deploy_app "$app" || log "FALLO en deploy de $app"
        done
        ;;
    *)
        echo "Uso: $0 <comerciales|instaladores|admin|all> [production|beta|internal]"
        echo ""
        echo "Tracks disponibles:"
        echo "  internal    - Test interno (por defecto)"
        echo "  beta        - Beta abierta/cerrada"
        echo "  production  - Producción (Google Play Store)"
        echo ""
        echo "Requisitos:"
        echo "  - GOOGLE_PLAY_SERVICE_ACCOUNT: ruta a credenciales JSON"
        echo "  - AAB compilado (ejecutar build.sh primero)"
        exit 1
        ;;
esac
