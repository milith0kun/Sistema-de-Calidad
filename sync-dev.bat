@echo off
echo 🔄 Sincronizando cambios con el servidor...

REM Hacer commit automático si hay cambios
git add .
git commit -m "Auto-sync: %date% %time%"

REM Subir a GitHub
echo 📤 Subiendo a GitHub...
git push origin main

echo ✅ Cambios sincronizados
echo 🌐 Accede a tu app en: http://ec2-54-91-127-89.compute-1.amazonaws.com:3000
pause