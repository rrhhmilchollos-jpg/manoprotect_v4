@echo off
REM ============================================
REM MANOPROTECT - Compilacion Local Windows
REM Kotlin 1.9.22, Gradle 8.3, AGP 8.1.4
REM ============================================

echo ========================================
echo   ManoProtect - Build Local Windows
echo ========================================
echo.

REM Verificar Java 17
java -version 2>&1 | findstr "17" >nul
if errorlevel 1 (
    echo ERROR: Se requiere Java JDK 17
    echo Descarga de: https://adoptium.net/
    exit /b 1
)
echo OK: Java 17 detectado

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no encontrado
    exit /b 1
)
echo OK: Node.js detectado

echo.
echo [1/6] Limpiando proyecto...
cd /d "%~dp0"
cd mobile-app

REM Limpiar node_modules y caches
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist android\build rmdir /s /q android\build
if exist android\app\build rmdir /s /q android\app\build
echo OK: Proyecto limpio

echo.
echo [2/6] Instalando dependencias...
REM IMPORTANTE: Usar yarn, NO npm (para respetar yarn.lock con versiones fijadas)
call yarn install
if errorlevel 1 (
    echo ERROR: yarn install fallo
    echo Instala yarn: npm install -g yarn
    exit /b 1
)
echo OK: Dependencias instaladas

REM Verificar versiones criticas
echo.
echo Verificando versiones de librerias criticas:
node -e "console.log('  gesture-handler: ' + require('react-native-gesture-handler/package.json').version)"
node -e "console.log('  screens: ' + require('react-native-screens/package.json').version)"
node -e "console.log('  vision-camera: ' + require('react-native-vision-camera/package.json').version)"

echo.
echo [3/6] Creando bundle JavaScript...
if not exist android\app\src\main\assets mkdir android\app\src\main\assets

call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res\
if errorlevel 1 (
    echo ERROR: Bundle JS fallo
    exit /b 1
)
echo OK: Bundle JS creado

echo.
echo [4/6] Limpiando build Android...
cd android
call .\gradlew.bat clean
echo OK: Build limpio

echo.
echo [5/6] Compilando AAB Release...
echo     Esto puede tardar 10-15 minutos...
echo.

REM IMPORTANTE: bundleRelease genera AAB para Google Play
REM             assembleRelease genera APK (NO sirve para Play Store)
call .\gradlew.bat bundleRelease --no-daemon --stacktrace
if errorlevel 1 (
    echo.
    echo ========================================
    echo   ERROR: Build fallo
    echo   Revisa los errores arriba
    echo ========================================
    cd ..
    exit /b 1
)

echo.
echo [6/6] Verificando AAB...
cd ..

set AAB_PATH=android\app\build\outputs\bundle\release\app-release.aab
if exist %AAB_PATH% (
    echo.
    echo ========================================
    echo   AAB GENERADO CORRECTAMENTE
    echo   Archivo: %AAB_PATH%
    echo.
    echo   Sube este archivo a Google Play Console:
    echo   https://play.google.com/console
    echo ========================================
) else (
    echo ERROR: AAB no encontrado en %AAB_PATH%
    exit /b 1
)

echo.
pause
