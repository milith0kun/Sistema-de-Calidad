# Script para capturar logs detallados al presionar botón de Google
# Ejecutar JUSTO ANTES de presionar el botón

Write-Host "`n=== MONITOREO DE LOGS EN TIEMPO REAL ===" -ForegroundColor Cyan
Write-Host "Limpiando logs..." -ForegroundColor Yellow
adb logcat -c

Write-Host "Iniciando captura... Presiona el botón AHORA" -ForegroundColor Green
Write-Host "Capturando por 10 segundos..." -ForegroundColor Yellow

# Capturar logs en tiempo real por 10 segundos
$timeout = 10
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

adb logcat | ForEach-Object {
    if ($stopwatch.Elapsed.TotalSeconds -gt $timeout) {
        break
    }
    
    # Filtrar solo logs relevantes
    if ($_ -match "GoogleAuthUiClient|AuthViewModel|CredentialManager.*sistemahaccp|BAD_AUTH.*sistemahaccp|NoCredential|buildCredentialRequest|Client ID|Nonce") {
        Write-Host $_ -ForegroundColor Gray
    }
}

$stopwatch.Stop()

Write-Host "`n=== RESUMEN ===" -ForegroundColor Cyan
Write-Host "Captura finalizada. Buscando errores..." -ForegroundColor Yellow

# Obtener logs completos y analizar
$allLogs = adb logcat -d | Select-String -Pattern "GoogleAuthUiClient|AuthViewModel" -CaseSensitive:$false

if ($allLogs -match "BAD_AUTHENTICATION") {
    Write-Host "❌ ERROR: BAD_AUTHENTICATION detectado" -ForegroundColor Red
} elseif ($allLogs -match "No credentials") {
    Write-Host "❌ ERROR: No credentials available" -ForegroundColor Red  
} elseif ($allLogs -match "buildCredentialRequest") {
    Write-Host "✓ buildCredentialRequest ejecutado" -ForegroundColor Green
} else {
    Write-Host "⚠️  No se detectaron logs de autenticación" -ForegroundColor Yellow
    Write-Host "Verifica que hayas presionado el botón" -ForegroundColor Yellow
}

Write-Host "`nLogs completos guardados. Ejecuta este comando para verlos:" -ForegroundColor Cyan
Write-Host 'adb logcat -d | Select-String -Pattern "GoogleAuthUiClient|AuthViewModel" | Select-Object -Last 50' -ForegroundColor White
