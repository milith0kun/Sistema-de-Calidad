// =====================================================
// SCRIPT DE PRUEBA: SIMULACIÓN DE EXPORTACIONES FRONTEND
// =====================================================
// Este script simula exactamente cómo se llaman las funciones
// de exportación desde las páginas del panel web

import { 
  exportarControlCoccion,
  exportarLavadoFrutas,
  exportarFormularioVacioLavadoFrutas,
  exportarLavadoManos,
  exportarTemperaturaCamaras,
  exportarRecepcionMercaderia,
  exportarRecepcionAbarrotes,
  exportarRecepcionFrutasVerduras
} from './WebPanel/src/utils/exportExcel.js';

console.log('🔍 INICIANDO PRUEBAS DE EXPORTACIÓN FRONTEND');
console.log('============================================================');

// Datos de ejemplo que simularían los datos del backend
const datosEjemplo = [
  {
    id: 1,
    fecha: '2025-01-15',
    hora: '08:30',
    alimento: 'Pollo a la plancha',
    proceso: 'P',
    temperatura_inicial: 65,
    temperatura_final: 75,
    tiempo_coccion: 15,
    conformidad: 'C',
    observaciones: 'Cocción correcta',
    responsable: 'Juan Pérez'
  },
  {
    id: 2,
    fecha: '2025-01-15',
    hora: '12:00',
    alimento: 'Carne al horno',
    proceso: 'H',
    temperatura_inicial: 70,
    temperatura_final: 80,
    tiempo_coccion: 25,
    conformidad: 'C',
    observaciones: 'Temperatura adecuada',
    responsable: 'María García'
  }
];

const mes = 1; // Enero
const anio = 2025;

async function probarExportaciones() {
  try {
    console.log('\n📋 1. PROBANDO: Control de Cocción...');
    await exportarControlCoccion(datosEjemplo, mes, anio);
    console.log('   ✅ Control de Cocción - OK');

    console.log('\n🍎 2. PROBANDO: Lavado de Frutas con datos...');
    await exportarLavadoFrutas(datosEjemplo, mes, anio, 'Cloro', '200 ppm');
    console.log('   ✅ Lavado de Frutas con datos - OK');

    console.log('\n📄 3. PROBANDO: Formulario vacío de Lavado de Frutas...');
    await exportarFormularioVacioLavadoFrutas(mes, anio, 'Cloro', '200 ppm');
    console.log('   ✅ Formulario vacío Lavado de Frutas - OK');

    console.log('\n🧼 4. PROBANDO: Lavado de Manos...');
    await exportarLavadoManos(datosEjemplo, mes, anio);
    console.log('   ✅ Lavado de Manos - OK');

    console.log('\n🌡️ 5. PROBANDO: Temperatura de Cámaras...');
    await exportarTemperaturaCamaras(datosEjemplo, mes, anio);
    console.log('   ✅ Temperatura de Cámaras - OK');

    console.log('\n🥬 6. PROBANDO: Recepción de Mercadería (Frutas/Verduras)...');
    await exportarRecepcionMercaderia(datosEjemplo, mes, anio, 'FRUTAS_VERDURAS');
    console.log('   ✅ Recepción Frutas/Verduras - OK');

    console.log('\n📦 7. PROBANDO: Recepción de Abarrotes...');
    await exportarRecepcionAbarrotes(datosEjemplo, mes, anio);
    console.log('   ✅ Recepción Abarrotes - OK');

    console.log('\n🎉 ¡TODAS LAS EXPORTACIONES COMPLETADAS!');
    console.log('============================================================');
    console.log('📁 Los archivos se han descargado en la carpeta de Descargas del navegador');

  } catch (error) {
    console.error('❌ ERROR en las exportaciones:', error);
    console.error('Detalles del error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar las pruebas
probarExportaciones();