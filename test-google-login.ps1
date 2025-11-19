# Script para probar Google OAuth después de la propagación
# Ejecutar después de esperar 15-20 minutos desde que agregaste el SHA-1

Write-Host "`n=== PRUEBA DE GOOGLE OAUTH ===" -ForegroundColor Cyan
Write-Host "Inicio: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray

# Paso 1: Limpiar caché de Google Play Services
Write-Host "`n[1/5] Limpiando caché de Google Play Services..." -ForegroundColor Yellow
adb shell pm clear com.google.android.gms
Start-Sleep -Seconds 2

# Paso 2: Limpiar logs
Write-Host "[2/5] Limpiando logs anteriores..." -ForegroundColor Yellow
adb logcat -c
Start-Sleep -Seconds 1

# Paso 3: Cerrar panel de notificaciones y limpiar pantalla
Write-Host "[3/6] Preparando pantalla..." -ForegroundColor Yellow
adb shell input keyevent KEYCODE_BACK  # Cerrar notificaciones si están abiertas
Start-Sleep -Seconds 1
adb shell input keyevent KEYCODE_HOME  # Ir a home
Start-Sleep -Seconds 1

# Paso 4: Abrir la app
Write-Host "[4/6] Abriendo Sistema HACCP..." -ForegroundColor Yellow
adb shell am start -n com.sistemahaccp.calidad/com.example.sistemadecalidad.MainActivity
Start-Sleep -Seconds 4

# Paso 5: Presionar botón "Continuar con Google" (centro de la pantalla, parte media-baja)
Write-Host "[5/6] Presionando 'Continuar con Google'..." -ForegroundColor Yellow
adb shell input tap 540 1600
Start-Sleep -Seconds 3

# Paso 6: Capturar logs
Write-Host "[6/6] Capturando logs de autenticación..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
$logs = adb logcat -d | Select-String -Pattern "GoogleAuth|Credential|sistemahaccp|AuthViewModel|BAD_AUTH|NoCredential" -CaseSensitive:$false | Select-Object -Last 60

Write-Host "`n=== RESULTADOS ===" -ForegroundColor Cyan

# Analizar resultados
if ($logs -match "BAD_AUTHENTICATION") {
    Write-Host "❌ ERROR: Todavía aparece BAD_AUTHENTICATION" -ForegroundColor Red
    Write-Host "   La propagación aún no se completó. Espera 10 minutos más." -ForegroundColor Yellow
} elseif ($logs -match "No credentials available") {
    Write-Host "❌ ERROR: App no reconocida por Google" -ForegroundColor Red
    Write-Host "   Verifica la configuración en Google Cloud Console" -ForegroundColor Yellow
} elseif ($logs -match "Sign.*in.*success|Login.*success") {
    Write-Host "✅ ÉXITO: Login con Google funcionó correctamente" -ForegroundColor Green
} else {
    Write-Host "⚠️  VERIFICAR: No se detectaron errores ni éxito claro" -ForegroundColor Yellow
    Write-Host "   Revisa los logs manualmente" -ForegroundColor Yellow
}

Write-Host "`n=== LOGS CAPTURADOS ===" -ForegroundColor Cyan
$logs | ForEach-Object { Write-Host $_ -ForegroundColor Gray }

Write-Host "`nFin: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
