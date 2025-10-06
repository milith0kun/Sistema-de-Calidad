// =====================================================
// SCRIPT DE SIMULACIÓN: EXPORTACIONES COMO EL FRONTEND
// =====================================================
// Este script simula exactamente lo que hacen las funciones
// de exportación del frontend, pero guarda archivos en lugar de descargarlos

import { 
  generarFormularioControlCoccion,
  generarFormularioLavadoFrutas,
  generarFormularioLavadoManos,
  generarFormularioTemperaturaCamaras,
  generarFormularioRecepcionAbarrotes,
  generarFormularioRecepcionFrutasVerduras
} from './WebPanel/src/utils/exportExcel.js';
import fs from 'fs';
import path from 'path';

console.log('🔍 SIMULANDO EXPORTACIONES DEL FRONTEND');
console.log('============================================================');

// Crear directorio de salida
const outputDir = './test_frontend_simulation_output';
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

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

async function simularExportacionFrontend() {
  try {
    console.log('\n📋 1. SIMULANDO: Control de Cocción...');
    const workbook1 = await generarFormularioControlCoccion(datosEjemplo, mes, anio);
    const filePath1 = path.join(outputDir, `HACCP_Control_Coccion_Datos_${mes}_${anio}.xlsx`);
    await workbook1.xlsx.writeFile(filePath1);
    console.log(`   ✅ Guardado en: ${filePath1}`);

    console.log('\n🍎 2. SIMULANDO: Lavado de Frutas con datos...');
    const workbook2 = await generarFormularioLavadoFrutas(datosEjemplo, mes, anio, 'Cloro', '200 ppm');
    const filePath2 = path.join(outputDir, `HACCP_Lavado_Frutas_Verduras_Datos_${mes}_${anio}.xlsx`);
    await workbook2.xlsx.writeFile(filePath2);
    console.log(`   ✅ Guardado en: ${filePath2}`);

    console.log('\n📄 3. SIMULANDO: Formulario vacío de Lavado de Frutas...');
    const workbook3 = await generarFormularioLavadoFrutas(null, mes, anio, 'Cloro', '200 ppm');
    const filePath3 = path.join(outputDir, `HACCP_Lavado_Frutas_Verduras_${mes}_${anio}.xlsx`);
    await workbook3.xlsx.writeFile(filePath3);
    console.log(`   ✅ Guardado en: ${filePath3}`);

    console.log('\n🧼 4. SIMULANDO: Lavado de Manos...');
    const workbook4 = await generarFormularioLavadoManos(datosEjemplo, mes, anio);
    const filePath4 = path.join(outputDir, `HACCP_Lavado_Manos_Datos_${mes.toString().padStart(2, '0')}_${anio}.xlsx`);
    await workbook4.xlsx.writeFile(filePath4);
    console.log(`   ✅ Guardado en: ${filePath4}`);

    console.log('\n🌡️ 5. SIMULANDO: Temperatura de Cámaras...');
    const workbook5 = await generarFormularioTemperaturaCamaras(datosEjemplo, mes, anio);
    const filePath5 = path.join(outputDir, `HACCP_Control_Temperatura_Camaras_Datos_${anio}_${mes.toString().padStart(2, '0')}.xlsx`);
    await workbook5.xlsx.writeFile(filePath5);
    console.log(`   ✅ Guardado en: ${filePath5}`);

    console.log('\n🥬 6. SIMULANDO: Recepción de Frutas/Verduras...');
    const workbook6 = await generarFormularioRecepcionFrutasVerduras(datosEjemplo, mes, anio);
    const filePath6 = path.join(outputDir, `HACCP_Control_Frutas_Verduras_Datos_${mes}_${anio}.xlsx`);
    await workbook6.xlsx.writeFile(filePath6);
    console.log(`   ✅ Guardado en: ${filePath6}`);

    console.log('\n📦 7. SIMULANDO: Recepción de Abarrotes...');
    const workbook7 = await generarFormularioRecepcionAbarrotes(datosEjemplo, mes, anio);
    const filePath7 = path.join(outputDir, `HACCP_Control_Abarrotes_Datos_${mes}_${anio}.xlsx`);
    await workbook7.xlsx.writeFile(filePath7);
    console.log(`   ✅ Guardado en: ${filePath7}`);

    console.log('\n🎉 ¡TODAS LAS SIMULACIONES COMPLETADAS!');
    console.log('============================================================');
    console.log(`📁 Los archivos están en: ${path.resolve(outputDir)}`);

    // Mostrar tamaños de archivos
    console.log('\n📊 TAMAÑOS DE ARCHIVOS GENERADOS:');
    const files = fs.readdirSync(outputDir);
    files.forEach(file => {
      const filePath = path.join(outputDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   📄 ${file} (${sizeKB} KB)`);
    });

  } catch (error) {
    console.error('❌ ERROR en las simulaciones:', error);
    console.error('Detalles del error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar las simulaciones
simularExportacionFrontend();