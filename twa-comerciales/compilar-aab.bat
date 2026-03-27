@echo off
REM ============================================
REM Script de Compilacion - ManoProtect TWA
REM ============================================

echo.
echo ========================================
echo   ManoProtect TWA - Compilador de AAB
echo ========================================
echo.

REM Verificar Java
java -version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Java no esta instalado o no esta en el PATH
    echo Por favor instala Java JDK 17 desde: https://adoptium.net/
    pause
    exit /b 1
)

echo [OK] Java encontrado
echo.

REM Navegar al directorio del proyecto
cd /d "%~dp0"

REM Limpiar builds anteriores
echo Limpiando builds anteriores...
call gradlew.bat clean --no-daemon

echo.
echo Compilando AAB...
echo.

REM Compilar AAB
call gradlew.bat bundleRelease --no-daemon --stacktrace

if %ERRORLEVEL% neq 0 (
    echo.
    echo ========================================
    echo   ERROR: La compilacion fallo
    echo ========================================
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Compilacion Exitosa!
echo ========================================
echo.
echo El AAB se encuentra en:
echo app\build\outputs\bundle\release\app-release.aab
echo.

REM Verificar que el archivo existe
if exist "app\build\outputs\bundle\release\app-release.aab" (
    echo [OK] Archivo AAB verificado
    for %%A in (app\build\outputs\bundle\release\app-release.aab) do echo Tamano: %%~zA bytes
) else (
    echo [ERROR] No se encontro el archivo AAB
)

echo.
pause
