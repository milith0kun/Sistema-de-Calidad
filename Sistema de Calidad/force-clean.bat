@echo off
echo ================================================
echo   LIMPIEZA FORZADA - Requiere Administrador
echo ================================================
echo.

REM Ir al directorio del proyecto
cd /d "%~dp0"

echo [1/6] Cerrando Android Studio y procesos relacionados...
taskkill /F /IM studio64.exe /T 2>nul
taskkill /F /IM java.exe /T 2>nul
taskkill /F /IM adb.exe /T 2>nul
taskkill /F /IM gradle.exe /T 2>nul
echo Esperando 3 segundos para que los procesos terminen...
timeout /t 3 /nobreak >nul

echo.
echo [2/6] Desbloqueando archivos con handle.exe (si está disponible)...
where handle.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    handle.exe "R.jar" /accepteula | findstr /i "pid" > temp_handles.txt
    for /f "tokens=5" %%a in (temp_handles.txt) do (
        echo Cerrando handle de PID %%a
        handle.exe -c %%a -p %%a /accepteula >nul 2>&1
    )
    del temp_handles.txt 2>nul
) else (
    echo handle.exe no encontrado, omitiendo...
)

echo.
echo [3/6] Eliminando carpeta build de forma forzada...
if exist "app\build" (
    echo Eliminando app\build...
    rmdir /s /q "app\build" 2>nul
    if exist "app\build" (
        echo Intentando con PowerShell...
        powershell -Command "Remove-Item -Path 'app\build' -Recurse -Force -ErrorAction SilentlyContinue"
    )
)

if exist "build" (
    echo Eliminando build root...
    rmdir /s /q "build" 2>nul
    if exist "build" (
        powershell -Command "Remove-Item -Path 'build' -Recurse -Force -ErrorAction SilentlyContinue"
    )
)

echo.
echo [4/6] Eliminando cache de Gradle...
if exist ".gradle" (
    rmdir /s /q ".gradle" 2>nul
    powershell -Command "Remove-Item -Path '.gradle' -Recurse -Force -ErrorAction SilentlyContinue"
)

echo.
echo [5/6] Deteniendo Gradle daemon...
call gradlew.bat --stop 2>nul

echo.
echo [6/6] Limpiando archivos temporales del sistema...
del /f /s /q "%TEMP%\*.tmp" 2>nul
del /f /s /q "%TEMP%\gradle*" 2>nul

echo.
echo ================================================
echo   LIMPIEZA COMPLETA!
echo ================================================
echo.
echo Ahora puedes ejecutar: gradlew assembleDebug
echo.
pause
