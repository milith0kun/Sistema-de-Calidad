// Script de prueba para generar todas las plantillas de Excel
// Ejecutar con: node test_plantillas_excel.js

import { 
  generarFormularioRecepcionAbarrotes,
  generarFormularioRecepcionFrutasVerduras,
  generarFormularioControlCoccion,
  generarFormularioLavadoFrutas,
  generarFormularioLavadoManos,
  generarFormularioTemperaturaCamaras
} from './WebPanel/src/utils/exportExcel.js';
import fs from 'fs';
import path from 'path';

// Crear directorio para las pruebas si no existe
const testDir = './test_excel_output';
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

async function generarTodasLasPlantillas() {
  console.log('🔄 Generando todas las plantillas de Excel...\n');

  try {
    // 1. RECEPCIÓN DE ABARROTES
    console.log('📋 1. Generando: Recepción de Abarrotes...');
    const abarrotes = await generarFormularioRecepcionAbarrotes(null, 'ENERO', '2025');
    const abarrotesPath = path.join(testDir, '1_Recepcion_Abarrotes.xlsx');
    await abarrotes.xlsx.writeFile(abarrotesPath);
    console.log(`   ✅ Guardado en: ${abarrotesPath}`);

    // 2. RECEPCIÓN DE FRUTAS Y VERDURAS
    console.log('🥬 2. Generando: Recepción de Frutas y Verduras...');
    const frutasVerduras = await generarFormularioRecepcionFrutasVerduras(null, 'ENERO', '2025');
    const frutasPath = path.join(testDir, '2_Recepcion_Frutas_Verduras.xlsx');
    await frutasVerduras.xlsx.writeFile(frutasPath);
    console.log(`   ✅ Guardado en: ${frutasPath}`);

    // 3. CONTROL DE COCCIÓN
    console.log('🍳 3. Generando: Control de Cocción...');
    const coccion = await generarFormularioControlCoccion(null, 'ENERO', '2025');
    const coccionPath = path.join(testDir, '3_Control_Coccion.xlsx');
    await coccion.xlsx.writeFile(coccionPath);
    console.log(`   ✅ Guardado en: ${coccionPath}`);

    // 4. LAVADO DE FRUTAS
    console.log('🍎 4. Generando: Lavado de Frutas...');
    const lavadoFrutas = await generarFormularioLavadoFrutas(null, 'ENERO', '2025', 'Cloro', '200 ppm');
    const lavadoFrutasPath = path.join(testDir, '4_Lavado_Frutas.xlsx');
    await lavadoFrutas.xlsx.writeFile(lavadoFrutasPath);
    console.log(`   ✅ Guardado en: ${lavadoFrutasPath}`);

    // 5. LAVADO DE MANOS
    console.log('🧼 5. Generando: Lavado de Manos...');
    const lavadoManos = await generarFormularioLavadoManos(null, 'ENERO', '2025');
    const lavadoManosPath = path.join(testDir, '5_Lavado_Manos.xlsx');
    await lavadoManos.xlsx.writeFile(lavadoManosPath);
    console.log(`   ✅ Guardado en: ${lavadoManosPath}`);

    // 6. TEMPERATURA DE CÁMARAS
    console.log('🌡️ 6. Generando: Temperatura de Cámaras...');
    const temperaturaCamaras = await generarFormularioTemperaturaCamaras(null, 'ENERO', '2025');
    const temperaturaCamarasPath = path.join(testDir, '6_Temperatura_Camaras.xlsx');
    await temperaturaCamaras.xlsx.writeFile(temperaturaCamarasPath);
    console.log(`   ✅ Guardado en: ${temperaturaCamarasPath}`);

    console.log('\n🎉 ¡Todas las plantillas han sido generadas exitosamente!');
    console.log(`📁 Revisa la carpeta: ${testDir}`);
    console.log('\n📋 Archivos generados:');
    
    // Listar archivos generados
    const files = fs.readdirSync(testDir);
    files.forEach((file, index) => {
      const filePath = path.join(testDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`   ${index + 1}. ${file} (${sizeKB} KB)`);
    });

  } catch (error) {
    console.error('❌ Error al generar las plantillas:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Función para generar plantillas con datos de ejemplo
async function generarPlantillasConDatos() {
  console.log('\n🔄 Generando plantillas con datos de ejemplo...\n');

  try {
    // Datos de ejemplo para Abarrotes
    const datosAbarrotes = [
      {
        fecha: '01/01/2025',
        hora: '08:00',
        proveedor: 'Distribuidora ABC',
        producto: 'Arroz Premium',
        cantidad: '50 kg',
        conforme: 'C',
        registro_sanitario: 'Vigente',
        vencimiento: '01/12/2025',
        empaque: 'C',
        uniforme: 'C',
        transporte: 'C',
        puntualidad: 'C',
        responsable: 'Juan Pérez',
        observaciones: 'Producto en buen estado',
        accion_correctiva: 'N/A'
      },
      {
        fecha: '01/01/2025',
        hora: '09:30',
        proveedor: 'Alimentos del Sur',
        producto: 'Aceite Vegetal',
        cantidad: '20 L',
        conforme: 'NC',
        registro_sanitario: 'Vigente',
        vencimiento: '15/06/2025',
        empaque: 'NC',
        uniforme: 'C',
        transporte: 'C',
        puntualidad: 'NC',
        responsable: 'María García',
        observaciones: 'Envase con abolladuras menores',
        accion_correctiva: 'Revisar empaque con proveedor'
      }
    ];

    console.log('📋 Generando: Abarrotes con datos de ejemplo...');
    const abarrotesConDatos = await generarFormularioRecepcionAbarrotes(datosAbarrotes, 'ENERO', '2025');
    const abarrotesConDatosPath = path.join(testDir, 'EJEMPLO_Abarrotes_con_datos.xlsx');
    await abarrotesConDatos.xlsx.writeFile(abarrotesConDatosPath);
    console.log(`   ✅ Guardado en: ${abarrotesConDatosPath}`);

    // Datos de ejemplo para Frutas y Verduras
    const datosFrutas = [
      {
        fecha: '01/01/2025',
        hora: '07:00',
        proveedor: 'Frutas Frescas SA',
        producto: 'Tomates',
        peso_unidad: '25 kg',
        conforme: 'C',
        estado_producto: 'F',
        integridad: 'C',
        uniforme: 'C',
        transporte: 'C',
        puntualidad: 'C',
        responsable_registro: 'Ana López',
        responsable_supervision: 'Carlos Ruiz',
        observaciones: 'Producto fresco y de calidad',
        accion_correctiva: 'N/A'
      }
    ];

    console.log('🥬 Generando: Frutas y Verduras con datos de ejemplo...');
    const frutasConDatos = await generarFormularioRecepcionFrutasVerduras(datosFrutas, 'ENERO', '2025');
    const frutasConDatosPath = path.join(testDir, 'EJEMPLO_Frutas_con_datos.xlsx');
    await frutasConDatos.xlsx.writeFile(frutasConDatosPath);
    console.log(`   ✅ Guardado en: ${frutasConDatosPath}`);

    console.log('\n🎉 ¡Plantillas con datos de ejemplo generadas!');

  } catch (error) {
    console.error('❌ Error al generar plantillas con datos:', error);
  }
}

// Ejecutar ambas funciones
async function main() {
  console.log('🚀 INICIANDO GENERACIÓN DE PLANTILLAS EXCEL HACCP\n');
  console.log('=' .repeat(60));
  
  await generarTodasLasPlantillas();
  await generarPlantillasConDatos();
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ PROCESO COMPLETADO ✨');
  console.log(`📂 Todos los archivos están en: ${path.resolve(testDir)}`);
}

main().catch(console.error);