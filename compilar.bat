@echo off
echo ========================================
echo   ManoProtect - Compilador de Apps
echo ========================================
echo.

:MENU
echo Selecciona que quieres compilar:
echo.
echo [1] Compilar Desktop (.exe)
echo [2] Compilar Android (.aab)
echo [3] Compilar ambos
echo [4] Salir
echo.
set /p opcion=Opcion: 

if "%opcion%"=="1" goto DESKTOP
if "%opcion%"=="2" goto ANDROID
if "%opcion%"=="3" goto AMBOS
if "%opcion%"=="4" exit
goto MENU

:DESKTOP
echo.
echo === Compilando Desktop (.exe) ===
cd desktop-app
call yarn install
call yarn build:win
echo.
echo ✅ Desktop compilado!
echo Archivo: desktop-app\dist\ManoProtect-Empleados-Setup-1.0.0.exe
echo.
pause
goto MENU

:ANDROID
echo.
echo === Compilando Android (.aab) ===
echo.
echo Asegurate de:
echo 1. Tener el keystore en mobile-app\android\app\
echo 2. Haber configurado gradle.properties
echo.
cd mobile-app
call yarn install
cd android
call gradlew bundleRelease
echo.
echo ✅ Android compilado!
echo Archivo: mobile-app\android\app\build\outputs\bundle\release\app-release.aab
echo.
pause
goto MENU

:AMBOS
call :DESKTOP
call :ANDROID
echo.
echo ✅ Ambas apps compiladas!
pause
goto MENU
