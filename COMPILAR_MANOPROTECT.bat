@echo off
REM ============================================
REM COMPILADOR AUTOMATICO DE MANOPROTECT
REM Solo ejecuta este archivo y espera
REM ============================================

echo.
echo ========================================
echo   COMPILADOR MANOPROTECT v2.0.1
echo   Preparado para Google Play
echo ========================================
echo.

REM Verificar que estamos en la carpeta correcta
if not exist "mobile-app\android\gradlew.bat" (
    echo ERROR: Ejecuta este archivo desde la carpeta del proyecto
    echo Debe estar en: manoprotect_v1-main
    pause
    exit /b 1
)

echo [1/5] Verificando keystore...
if not exist "manoprotect-2025.keystore" (
    echo ERROR: No se encuentra manoprotect-2025.keystore
    echo Copia el archivo keystore a esta carpeta
    pause
    exit /b 1
)

echo [2/5] Copiando keystore al proyecto...
copy /Y "manoprotect-2025.keystore" "mobile-app\android\app\" >nul

echo [3/5] Configurando firma...
echo. >> mobile-app\android\gradle.properties
echo # Signing config for release >> mobile-app\android\gradle.properties
echo MYAPP_UPLOAD_STORE_FILE=manoprotect-2025.keystore >> mobile-app\android\gradle.properties
echo MYAPP_UPLOAD_KEY_ALIAS=manoprotect >> mobile-app\android\gradle.properties
echo MYAPP_UPLOAD_STORE_PASSWORD=19862210Des >> mobile-app\android\gradle.properties
echo MYAPP_UPLOAD_KEY_PASSWORD=19862210Des >> mobile-app\android\gradle.properties

echo [4/5] Compilando AAB (esto tarda 5-10 minutos)...
cd mobile-app\android
call gradlew.bat bundleRelease

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR en la compilacion
    echo Abre Android Studio y compila manualmente
    pause
    exit /b 1
)

echo [5/5] Buscando AAB generado...
cd ..\..

if exist "mobile-app\android\app\build\outputs\bundle\release\app-release.aab" (
    echo.
    echo ========================================
    echo   COMPILACION EXITOSA!
    echo ========================================
    echo.
    echo Tu archivo AAB esta en:
    echo mobile-app\android\app\build\outputs\bundle\release\app-release.aab
    echo.
    echo Copia ese archivo y subelo a Google Play Console
    echo.
    
    REM Copiar al escritorio para facil acceso
    copy "mobile-app\android\app\build\outputs\bundle\release\app-release.aab" "%USERPROFILE%\Desktop\ManoProtect-2.0.1.aab"
    echo Tambien lo copie a tu escritorio como: ManoProtect-2.0.1.aab
) else (
    echo.
    echo No se encontro el archivo AAB
    echo Revisa los errores arriba
)

echo.
pause
