# ============================================
# COMPILAR MANOPROTECT - Android AAB (Windows)
# ============================================
# Requisitos:
#   - JDK 17 (https://adoptium.net/temurin/releases/)
#   - Node.js 18+ (https://nodejs.org/)
#   - Android SDK (via Android Studio)
# ============================================

param(
    [switch]$Clean,
    [switch]$SkipBundle
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COMPILAR MANOPROTECT v2.0.1 - AAB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Java
Write-Host "[1/7] Verificando Java..." -ForegroundColor Yellow
try {
    $javaVersion = & java -version 2>&1 | Select-String "version"
    Write-Host "  OK: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Java no encontrado. Instala JDK 17 de https://adoptium.net/" -ForegroundColor Red
    exit 1
}

# Verificar Node.js
Write-Host "[2/7] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = & node --version 2>&1
    Write-Host "  OK: Node $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Node.js no encontrado. Instala de https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Ir al directorio del proyecto
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir
Write-Host "[3/7] Directorio: $scriptDir" -ForegroundColor Yellow

# Instalar dependencias
Write-Host "[4/7] Instalando dependencias JavaScript..." -ForegroundColor Yellow
if (Test-Path "yarn.lock") {
    & npx yarn install
} else {
    & npm install --legacy-peer-deps
}
Write-Host "  OK: Dependencias instaladas" -ForegroundColor Green

# Crear directorio de assets
Write-Host "[5/7] Creando bundle de JavaScript..." -ForegroundColor Yellow
$assetsDir = "android\app\src\main\assets"
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
}

if (-not $SkipBundle) {
    & npx react-native bundle `
        --platform android `
        --dev false `
        --entry-file index.js `
        --bundle-output "$assetsDir\index.android.bundle" `
        --assets-dest "android\app\src\main\res\"
    Write-Host "  OK: Bundle creado" -ForegroundColor Green
} else {
    Write-Host "  SKIP: Bundle omitido" -ForegroundColor Yellow
}

# Limpiar build anterior
Set-Location "android"

if ($Clean) {
    Write-Host "[6/7] Limpiando build anterior..." -ForegroundColor Yellow
    & .\gradlew.bat clean
    Write-Host "  OK: Build limpiado" -ForegroundColor Green
} else {
    Write-Host "[6/7] Limpieza omitida (usa -Clean para forzar)" -ForegroundColor Yellow
}

# Compilar AAB
Write-Host "[7/7] Compilando AAB de release..." -ForegroundColor Yellow
Write-Host "  Esto puede tardar varios minutos..." -ForegroundColor Gray
& .\gradlew.bat bundleRelease --no-daemon --stacktrace

# Verificar resultado
$aabPath = "app\build\outputs\bundle\release\app-release.aab"
if (Test-Path $aabPath) {
    $size = (Get-Item $aabPath).Length / 1MB
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  COMPILACION EXITOSA!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Archivo: $aabPath" -ForegroundColor White
    Write-Host "  Tamano: $([math]::Round($size, 2)) MB" -ForegroundColor White
    Write-Host ""
    Write-Host "  Siguiente paso:" -ForegroundColor Cyan
    Write-Host "  Sube este archivo a Google Play Console" -ForegroundColor Cyan
    Write-Host "  https://play.google.com/console" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERROR: AAB no generado" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Revisa los errores arriba" -ForegroundColor Red
    exit 1
}

Set-Location $scriptDir
