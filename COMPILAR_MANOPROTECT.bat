@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================
REM COMPILADOR MANOPROTECT v2.0.1
REM Compatible con Android 15/16
REM ============================================

echo.
echo ╔════════════════════════════════════════════╗
echo ║   COMPILADOR MANOPROTECT v2.0.1            ║
echo ║   Listo para Google Play Store             ║
echo ╚════════════════════════════════════════════╝
echo.

REM Verificar ubicación
if not exist "mobile-app\android\gradlew.bat" (
    echo [ERROR] No se encuentra el proyecto.
    echo.
    echo Asegurate de ejecutar este archivo desde la carpeta:
    echo   manoprotect_v1-main
    echo.
    echo La estructura debe ser:
    echo   manoprotect_v1-main\
    echo     ├── COMPILAR_MANOPROTECT.bat  (este archivo)
    echo     ├── manoprotect-2025.keystore
    echo     └── mobile-app\
    echo.
    pause
    exit /b 1
)

echo [1/6] Verificando keystore...
if not exist "manoprotect-2025.keystore" (
    echo [ERROR] No se encuentra el archivo: manoprotect-2025.keystore
    echo.
    echo Por favor, copia tu archivo keystore a esta carpeta.
    echo.
    pause
    exit /b 1
)
echo       OK - Keystore encontrado

echo [2/6] Copiando keystore al proyecto...
copy /Y "manoprotect-2025.keystore" "mobile-app\android\app\" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] No se pudo copiar el keystore
    pause
    exit /b 1
)
echo       OK - Keystore copiado

echo [3/6] Verificando configuracion de firma...
findstr /C:"MYAPP_UPLOAD_STORE_FILE" "mobile-app\android\gradle.properties" >nul 2>&1
if errorlevel 1 (
    echo       Anadiendo configuracion de firma...
    echo. >> mobile-app\android\gradle.properties
    echo MYAPP_UPLOAD_STORE_FILE=manoprotect-2025.keystore >> mobile-app\android\gradle.properties
    echo MYAPP_UPLOAD_KEY_ALIAS=manoprotect >> mobile-app\android\gradle.properties
    echo MYAPP_UPLOAD_STORE_PASSWORD=19862210Des >> mobile-app\android\gradle.properties
    echo MYAPP_UPLOAD_KEY_PASSWORD=19862210Des >> mobile-app\android\gradle.properties
)
echo       OK - Configuracion lista

echo [4/6] Limpiando compilaciones anteriores...
cd mobile-app\android
call gradlew.bat clean >nul 2>&1
echo       OK - Limpieza completada

echo [5/6] Compilando AAB (esto tarda 5-10 minutos)...
echo.
echo       Por favor espera, no cierres esta ventana...
echo.
call gradlew.bat bundleRelease --stacktrace

if errorlevel 1 (
    echo.
    echo ╔════════════════════════════════════════════╗
    echo ║   ERROR EN LA COMPILACION                  ║
    echo ╚════════════════════════════════════════════╝
    echo.
    echo Posibles soluciones:
    echo   1. Abre Android Studio
    echo   2. File -^> Open -^> mobile-app\android
    echo   3. Espera que sincronice
    echo   4. Build -^> Generate Signed Bundle / APK
    echo.
    cd ..\..
    pause
    exit /b 1
)

cd ..\..

echo [6/6] Buscando AAB generado...

set "AAB_PATH=mobile-app\android\app\build\outputs\bundle\release\app-release.aab"

if exist "%AAB_PATH%" (
    echo.
    echo ╔════════════════════════════════════════════╗
    echo ║   COMPILACION EXITOSA!                     ║
    echo ╚════════════════════════════════════════════╝
    echo.
    echo Tu archivo AAB esta en:
    echo   %AAB_PATH%
    echo.
    
    REM Copiar al escritorio
    copy "%AAB_PATH%" "%USERPROFILE%\Desktop\ManoProtect-2.0.1.aab" >nul 2>&1
    if not errorlevel 1 (
        echo Tambien lo copie a tu escritorio como:
        echo   ManoProtect-2.0.1.aab
        echo.
    )
    
    echo ════════════════════════════════════════════
    echo SIGUIENTE PASO:
    echo   1. Ve a Google Play Console
    echo   2. Selecciona ManoProtect
    echo   3. Release -^> Production -^> Create new release
    echo   4. Sube el archivo ManoProtect-2.0.1.aab
    echo ════════════════════════════════════════════
) else (
    echo.
    echo [ERROR] No se encontro el archivo AAB
    echo Revisa los mensajes de error arriba.
)

echo.
pause
