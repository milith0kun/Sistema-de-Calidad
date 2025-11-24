# Script de prueba completo para Google Sign-In
# Ejecutar después de configurar el OAuth Consent Screen en modo PRODUCCIÓN

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Test de Autenticación de Google - Sistema HACCP          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Paso 1: Limpiar caché de Google Play Services
Write-Host "[1/5] Limpiando caché de Google Play Services..." -ForegroundColor Yellow
adb shell pm clear com.google.android.gms | Out-Null
Start-Sleep -Seconds 2

# Paso 2: Limpiar logs de Android
Write-Host "[2/5] Limpiando logs de Android..." -ForegroundColor Yellow
adb logcat -c

# Paso 3: Abrir la app
Write-Host "[3/5] Abriendo la app Sistema HACCP..." -ForegroundColor Yellow
adb shell am start -n com.sistemahaccp.calidad/.MainActivity | Out-Null
Start-Sleep -Seconds 3

# Paso 4: Presionar botón de Google (simulación táctil)
Write-Host "[4/5] Simulando toque en botón de Google..." -ForegroundColor Yellow
Write-Host "         (Si no funciona, presiona manualmente el botón)" -ForegroundColor Gray
# Coordenadas aproximadas del botón de Google - ajustar según tu pantalla
adb shell input tap 540 1200
Start-Sleep -Seconds 2

# Paso 5: Capturar logs
Write-Host "[5/5] Capturando logs (15 segundos)...`n" -ForegroundColor Yellow

$timeout = 15
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$foundSuccess = $false
$foundError = $false
$errorMessage = ""

Write-Host "═══════════════ LOGS EN TIEMPO REAL ═══════════════" -ForegroundColor Cyan

adb logcat | ForEach-Object {
    if ($stopwatch.Elapsed.TotalSeconds -gt $timeout) {
        break
    }

    # Detectar logs importantes
    if ($_ -match "GoogleAuthUiClient|AuthViewModel|CredentialManager.*sistemahaccp|BAD_AUTH|NoCredential") {

        # Colorear según tipo de mensaje
        if ($_ -match "buildCredentialRequest|Nonce generado|Client ID") {
            Write-Host $_ -ForegroundColor Green
        } elseif ($_ -match "ERROR|BAD_AUTH|No credentials") {
            Write-Host $_ -ForegroundColor Red
            $foundError = $true
            if ($_ -match "BAD_AUTHENTICATION") {
                $errorMessage = "BAD_AUTHENTICATION"
            } elseif ($_ -match "No credentials") {
                $errorMessage = "No credentials available"
            }
        } elseif ($_ -match "SUCCESS|Login exitoso|Token obtenido") {
            Write-Host $_ -ForegroundColor Green
            $foundSuccess = $true
        } else {
            Write-Host $_ -ForegroundColor Gray
        }
    }
}

$stopwatch.Stop()

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

# Análisis de resultados
Write-Host "`n╔════════════════ RESULTADO ════════════════╗`n" -ForegroundColor Cyan

if ($foundSuccess) {
    Write-Host "  ✅ ÉXITO: Autenticación funcionó correctamente" -ForegroundColor Green
    Write-Host "  La configuración de Google OAuth está correcta`n" -ForegroundColor Green
} elseif ($foundError) {
    Write-Host "  ❌ ERROR DETECTADO: $errorMessage`n" -ForegroundColor Red

    if ($errorMessage -eq "BAD_AUTHENTICATION") {
        Write-Host "  Causa probable:" -ForegroundColor Yellow
        Write-Host "  - La propagación de Google aún no se completó" -ForegroundColor White
        Write-Host "  - Acabas de cambiar a modo Producción (espera 5-30 min)`n" -ForegroundColor White

        Write-Host "  Solución:" -ForegroundColor Yellow
        Write-Host "  1. Espera 10-15 minutos más" -ForegroundColor White
        Write-Host "  2. Ejecuta este script de nuevo: .\test-google-login.ps1" -ForegroundColor White
        Write-Host "  3. Si después de 1 hora sigue fallando, revisa la configuración`n" -ForegroundColor White
    } elseif ($errorMessage -eq "No credentials available") {
        Write-Host "  Causa probable:" -ForegroundColor Yellow
        Write-Host "  - La app aún no está registrada correctamente en Google" -ForegroundColor White
        Write-Host "  - Propagación de Google incompleta (esperar más tiempo)`n" -ForegroundColor White

        Write-Host "  Solución:" -ForegroundColor Yellow
        Write-Host "  1. Verifica que el Client ID exista en Google Cloud Console" -ForegroundColor White
        Write-Host "  2. Espera 30 minutos desde el cambio a modo Producción" -ForegroundColor White
        Write-Host "  3. Ejecuta este script cada 10-15 minutos para verificar`n" -ForegroundColor White
    }
} else {
    Write-Host "  ⚠️  NO SE DETECTARON LOGS`n" -ForegroundColor Yellow
    Write-Host "  Posibles causas:" -ForegroundColor Yellow
    Write-Host "  - El botón de Google no se presionó" -ForegroundColor White
    Write-Host "  - La app no se abrió correctamente" -ForegroundColor White
    Write-Host "  - Dispositivo no conectado vía ADB`n" -ForegroundColor White

    Write-Host "  Solución:" -ForegroundColor Yellow
    Write-Host "  1. Verifica que 'adb devices' muestre tu dispositivo" -ForegroundColor White
    Write-Host "  2. Ejecuta el script de nuevo" -ForegroundColor White
    Write-Host "  3. Presiona MANUALMENTE el botón de Google cuando se abra la app`n" -ForegroundColor White
}

Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Mostrar información de configuración actual
Write-Host "Configuración actual:" -ForegroundColor Cyan
Write-Host "  Client ID: 802542269966-bg9ron54a1qrtddc23osnbof1unte90v.apps.googleusercontent.com" -ForegroundColor Gray
Write-Host "  Package:   com.sistemahaccp.calidad" -ForegroundColor Gray
Write-Host "  SHA-1:     31:FA:5A:E9:46:6D:CA:FC:B2:73:48:8B:E4:61:20:FB:3E:C8:98:9D" -ForegroundColor Gray
Write-Host "  Estado:    PRODUCCIÓN (cambiado recientemente)" -ForegroundColor Green
Write-Host ""

Write-Host "Para ver logs completos, ejecuta:" -ForegroundColor Cyan
Write-Host '  adb logcat -d | Select-String -Pattern "GoogleAuthUiClient|AuthViewModel" | Select-Object -Last 50' -ForegroundColor White
Write-Host ""
