# ============================================
# MANOPROTECT - Script de Compilacion Avanzado (PowerShell)
# Version: 2.1.0
# ============================================
#
# Uso:
#   .\compilar-avanzado.ps1                # Build release AAB
#   .\compilar-avanzado.ps1 -BuildType apk # Build release APK
#   .\compilar-avanzado.ps1 -Debug         # Build debug APK
#   .\compilar-avanzado.ps1 -Clean         # Clean before build
#   .\compilar-avanzado.ps1 -SkipBundle    # Skip JS bundle
#   .\compilar-avanzado.ps1 -Doctor        # Check environment
#   .\compilar-avanzado.ps1 -All           # Clean + Bundle + AAB + APK
#
# ============================================

param(
    [string]$BuildType = "aab",
    [switch]$Debug,
    [switch]$Clean,
    [switch]$SkipBundle,
    [switch]$Doctor,
    [switch]$All,
    [switch]$Analyze,
    [switch]$SignInfo
)

$ErrorActionPreference = "Stop"
$AppName = "ManoProtect"
$AppVersion = "2.0.1"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AndroidDir = Join-Path $ScriptDir "android"
$LogDir = Join-Path $ScriptDir "build-logs"
$LogFile = Join-Path $LogDir "build_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$StartTime = Get-Date

# ============================================
# HELPER FUNCTIONS
# ============================================

function Write-Header {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host "  $AppName v$AppVersion - Build System" -ForegroundColor Blue
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host ""
}

function Write-Step([int]$Step, [int]$Total, [string]$Message) {
    Write-Host "[$Step/$Total] " -ForegroundColor Cyan -NoNewline
    Write-Host "$Message" -ForegroundColor White
}

function Write-OK([string]$Message) {
    Write-Host "  OK " -ForegroundColor Green -NoNewline
    Write-Host "$Message"
}

function Write-Warn([string]$Message) {
    Write-Host "  WARN " -ForegroundColor Yellow -NoNewline
    Write-Host "$Message"
}

function Write-Err([string]$Message) {
    Write-Host "  ERROR " -ForegroundColor Red -NoNewline
    Write-Host "$Message"
}

function Get-ElapsedTime {
    $elapsed = (Get-Date) - $StartTime
    return "{0}m {1}s" -f [math]::Floor($elapsed.TotalMinutes), $elapsed.Seconds
}

# ============================================
# DOCTOR MODE
# ============================================

if ($Doctor) {
    Write-Header
    Write-Host "Diagnostico del Entorno" -ForegroundColor White
    Write-Host ""
    $issues = 0

    # Java
    Write-Host "Java:" -ForegroundColor Cyan
    try {
        $javaVer = & java -version 2>&1 | Select-Object -First 1
        Write-OK "$javaVer"
        if ($javaVer -notmatch "17|18|19|20|21") {
            Write-Warn "Se recomienda JDK 17+"
            $issues++
        }
    } catch {
        Write-Err "Java no encontrado"
        $issues++
    }

    # JAVA_HOME
    Write-Host "JAVA_HOME:" -ForegroundColor Cyan
    if ($env:JAVA_HOME) {
        Write-OK "$env:JAVA_HOME"
    } else {
        Write-Warn "JAVA_HOME no configurado"
        $issues++
    }

    # Node.js
    Write-Host "Node.js:" -ForegroundColor Cyan
    try {
        $nodeVer = & node --version
        Write-OK "$nodeVer"
    } catch {
        Write-Err "Node.js no encontrado"
        $issues++
    }

    # Android SDK
    Write-Host "Android SDK:" -ForegroundColor Cyan
    if ($env:ANDROID_HOME) {
        Write-OK "$env:ANDROID_HOME"
    } elseif ($env:ANDROID_SDK_ROOT) {
        Write-OK "$env:ANDROID_SDK_ROOT"
    } else {
        Write-Warn "ANDROID_HOME no configurado"
        $issues++
    }

    # Keystore
    Write-Host "Keystore:" -ForegroundColor Cyan
    $gradleProps = Join-Path $AndroidDir "gradle.properties"
    if (Test-Path $gradleProps) {
        $ksLine = Get-Content $gradleProps | Where-Object { $_ -match "MYAPP_UPLOAD_STORE_FILE" }
        if ($ksLine) {
            $ksFile = ($ksLine -split "=")[1]
            $ksPath = Join-Path $AndroidDir "app" $ksFile
            if (Test-Path $ksPath) {
                Write-OK "$ksFile encontrado"
            } else {
                Write-Warn "$ksFile configurado pero no encontrado"
                $issues++
            }
        }
    }

    # Dependencias
    Write-Host "Dependencias:" -ForegroundColor Cyan
    $nmPath = Join-Path $ScriptDir "node_modules"
    if (Test-Path $nmPath) {
        $depCount = (Get-ChildItem $nmPath -Directory).Count
        Write-OK "$depCount paquetes instalados"
    } else {
        Write-Warn "node_modules no encontrado"
        $issues++
    }

    Write-Host ""
    if ($issues -eq 0) {
        Write-Host "Entorno OK - Listo para compilar" -ForegroundColor Green
    } else {
        Write-Host "$issues problemas detectados" -ForegroundColor Yellow
    }
    exit 0
}

# ============================================
# MAIN BUILD
# ============================================

Write-Header

if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }

$buildMode = if ($Debug) { "debug" } else { "release" }
$buildFmt = if ($Debug) { "apk" } else { $BuildType }

Write-Host "Configuracion:" -ForegroundColor Blue
Write-Host "  Tipo: $buildMode"
Write-Host "  Formato: $buildFmt"
Write-Host "  Clean: $Clean"
Write-Host ""

$totalSteps = 7
if ($All) { $totalSteps = 9; $Clean = $true }

# Step 1: Java
Write-Step 1 $totalSteps "Verificando Java..."
try {
    $javaVer = & java -version 2>&1 | Select-Object -First 1
    Write-OK "$javaVer"
} catch {
    Write-Err "Java no encontrado. Instala JDK 17."
    exit 1
}

# Step 2: Node.js
Write-Step 2 $totalSteps "Verificando Node.js..."
try {
    $nodeVer = & node --version
    Write-OK "Node $nodeVer"
} catch {
    Write-Err "Node.js no encontrado"
    exit 1
}

# Step 3: Directory
Write-Step 3 $totalSteps "Preparando directorio..."
Set-Location $ScriptDir
Write-OK "$ScriptDir"

# Step 4: Install deps
Write-Step 4 $totalSteps "Instalando dependencias..."
if (Test-Path "yarn.lock") {
    & yarn install --frozen-lockfile 2>&1 | Select-Object -Last 3 | Tee-Object -FilePath $LogFile -Append
} else {
    & npm install --legacy-peer-deps 2>&1 | Select-Object -Last 3 | Tee-Object -FilePath $LogFile -Append
}
Write-OK "Dependencias instaladas"

# Step 5: JS Bundle
Write-Step 5 $totalSteps "Creando bundle JavaScript..."
$assetsDir = Join-Path $AndroidDir "app\src\main\assets"
if (-not (Test-Path $assetsDir)) { New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null }

if (-not $SkipBundle) {
    & npx react-native bundle `
        --platform android `
        --dev false `
        --entry-file index.js `
        --bundle-output "$assetsDir\index.android.bundle" `
        --assets-dest "$AndroidDir\app\src\main\res\" 2>&1 | Tee-Object -FilePath $LogFile -Append

    $bundlePath = Join-Path $assetsDir "index.android.bundle"
    if (Test-Path $bundlePath) {
        $bundleSize = (Get-Item $bundlePath).Length / 1MB
        Write-OK ("Bundle creado ({0:N1} MB)" -f $bundleSize)
    }
} else {
    Write-Warn "Bundle omitido (--SkipBundle)"
}

# Step 6: Clean
Set-Location $AndroidDir
Write-Step 6 $totalSteps "Limpieza..."
if ($Clean) {
    & .\gradlew.bat clean 2>&1 | Tee-Object -FilePath $LogFile -Append
    Write-OK "Limpieza completada"
} else {
    Write-Host "  INFO Omitida (usa -Clean para forzar)" -ForegroundColor Blue
}

# Step 7: Build
Write-Step 7 $totalSteps "Compilando ($buildMode $buildFmt)..."
Write-Host "  Esto puede tardar varios minutos..." -ForegroundColor Yellow

if ($Debug) {
    & .\gradlew.bat assembleDebug --no-daemon --stacktrace 2>&1 | Tee-Object -FilePath $LogFile -Append
} elseif ($buildFmt -eq "apk") {
    & .\gradlew.bat assembleRelease --no-daemon --stacktrace 2>&1 | Tee-Object -FilePath $LogFile -Append
} else {
    & .\gradlew.bat bundleRelease --no-daemon --stacktrace 2>&1 | Tee-Object -FilePath $LogFile -Append
}

# Build ALL
if ($All) {
    Write-Step 8 $totalSteps "Compilando APK adicional..."
    & .\gradlew.bat assembleRelease --no-daemon 2>&1 | Tee-Object -FilePath $LogFile -Append
    Write-OK "APK generado"

    Write-Step 9 $totalSteps "Compilando AAB adicional..."
    & .\gradlew.bat bundleRelease --no-daemon 2>&1 | Tee-Object -FilePath $LogFile -Append
    Write-OK "AAB generado"
}

# ============================================
# VERIFY OUTPUT
# ============================================

Set-Location $ScriptDir

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue

$aabPath = Join-Path $AndroidDir "app\build\outputs\bundle\release\app-release.aab"
$apkPath = Join-Path $AndroidDir "app\build\outputs\apk\release\app-release.apk"
$dbgPath = Join-Path $AndroidDir "app\build\outputs\apk\debug\app-debug.apk"

if (Test-Path $aabPath) {
    $size = (Get-Item $aabPath).Length / 1MB
    Write-Host "  AAB GENERADO CORRECTAMENTE" -ForegroundColor Green
    Write-Host "  Archivo: $aabPath"
    Write-Host ("  Tamano: {0:N1} MB" -f $size)
}

if (Test-Path $apkPath) {
    $size = (Get-Item $apkPath).Length / 1MB
    Write-Host "  APK RELEASE GENERADO" -ForegroundColor Green
    Write-Host "  Archivo: $apkPath"
    Write-Host ("  Tamano: {0:N1} MB" -f $size)
}

if ($Debug -and (Test-Path $dbgPath)) {
    $size = (Get-Item $dbgPath).Length / 1MB
    Write-Host "  APK DEBUG GENERADO" -ForegroundColor Green
    Write-Host "  Archivo: $dbgPath"
    Write-Host ("  Tamano: {0:N1} MB" -f $size)
}

$elapsed = Get-ElapsedTime
Write-Host ""
Write-Host "  Tiempo total: $elapsed"
Write-Host "  Log: $LogFile"
Write-Host ""

if ($Analyze) {
    Write-Host "Analisis del Build" -ForegroundColor White
    if (Test-Path $aabPath) {
        $hash = (Get-FileHash $aabPath -Algorithm SHA256).Hash
        Write-Host "  SHA-256: $hash" -ForegroundColor Cyan
    }
}

Write-Host "  Sube el AAB a Google Play Console" -ForegroundColor Green
Write-Host "  https://play.google.com/console"
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""
