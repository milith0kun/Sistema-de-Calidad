/**
 * GENERADOR DE FORMULARIOS HACCP
 * Script para Google Sheets - Control de Calidad
 * Genera 9 hojas con formularios listos para imprimir en A4
 */

function generarFormulariosHACCP() {
  // Crear nuevo spreadsheet
  const ss = SpreadsheetApp.create('Formularios HACCP ' + new Date().toISOString().split('T')[0]);

  Logger.log('📊 Generando formularios HACCP...');

  // Crear todas las hojas primero
  crearControlAbarrotes(ss);
  Logger.log('✓ Control de Abarrotes');

  crearControlFrutasVerduras(ss);
  Logger.log('✓ Control de Frutas y Verduras');

  crearControlCoccion(ss);
  Logger.log('✓ Control de Cocción');

  crearLavadoFrutasVerduras(ss);
  Logger.log('✓ Lavado Frutas/Verduras');

  crearLavadoManos(ss);
  Logger.log('✓ Lavado de Manos');

  crearControlTemperatura(ss);
  Logger.log('✓ Control de Temperatura (3 cámaras)');

  // Eliminar hoja por defecto DESPUÉS de crear todas las demás
  const sheets = ss.getSheets();
  const hojaDefault = sheets.find(sheet => sheet.getName() === 'Hoja 1');
  if (hojaDefault) {
    ss.deleteSheet(hojaDefault);
  }

  Logger.log('✅ Archivo generado: ' + ss.getUrl());
  Logger.log('📊 Total de hojas: ' + ss.getSheets().length);
  Logger.log('🎉 Formularios HACCP generados exitosamente!');

  return ss.getUrl();
}

// ============= FUNCIONES DE ESTILO =============

function aplicarEstiloEncabezado(range, esTitulo = false) {
  range.setFontFamily('Arial')
       .setFontSize(esTitulo ? 14 : 10)
       .setFontWeight('bold')
       .setHorizontalAlignment('center')
       .setVerticalAlignment('middle')
       .setBackground('
#D9D9D9')
       .setBorder(true, true, true, true, true, true, 'black', SpreadsheetApp.BorderStyle.SOLID)
       .setWrap(true);
}

function aplicarEstiloCampo(range, centrado = false) {
  range.setFontFamily('Arial')
       .setFontSize(9)
       .setFontWeight('normal')
       .setHorizontalAlignment(centrado ? 'center' : 'left')
       .setVerticalAlignment('middle')
       .setBorder(true, true, true, true, true, true, 'black', SpreadsheetApp.BorderStyle.SOLID)
       .setWrap(true);
}

function configurarImpresionHorizontal(sheet) {
  // La orientación se configurará manualmente en: Archivo → Configuración de impresión
  // Opción: LANDSCAPE (Horizontal)
}

function configurarImpresionVertical(sheet) {
  // La orientación se configurará manualmente en: Archivo → Configuración de impresión
  // Opción: PORTRAIT (Vertical)
}

// ============= FORMULARIO 1: CONTROL RECEPCIÓN ABARROTES =============

function crearControlAbarrotes(ss) {
  const sheet = ss.insertSheet('Control Abarrotes');

  // Título
  sheet.getRange('A1:O1').merge();
  sheet.getRange('A1').setValue('REGISTRO HACCP');
  aplicarEstiloEncabezado(sheet.getRange('A1'), true);

  sheet.getRange('A2:O2').merge();
  sheet.getRange('A2').setValue('CONTROL DE CALIDAD DE RECEPCIÓN DE MERCADERÍA DE ABARROTES EN GENERAL');
  aplicarEstiloEncabezado(sheet.getRange('A2'), true);

  // Mes y Año
  sheet.getRange('A3:B3').merge().setValue('MES:');
  aplicarEstiloEncabezado(sheet.getRange('A3'));
  sheet.getRange('C3:F3').merge();
  aplicarEstiloCampo(sheet.getRange('C3'));

  sheet.getRange('G3:H3').merge().setValue('AÑO:');
  aplicarEstiloEncabezado(sheet.getRange('G3'));
  sheet.getRange('I3:L3').merge();
  aplicarEstiloCampo(sheet.getRange('I3'));

  // Encabezados de columnas
  const headers = [
    ['FECHA', 'HORA', 'NOMBRE DEL\nPROVEEDOR', 'NOMBRE DEL\nPRODUCTO',
     'CANTIDAD\nSOLICITADA\nPESO O UNIDAD', 'C/NC',
     'VIGENCIA\nREGISTRO\nSANITARIO', 
     'FECHA\nVENCIMIENTO\nPRODUCTO',
     'CONFORMIDAD\nEMPAQUE',
     'UNIFORME\nCOMPLETO', 
     'TRANSPORTE\nADECUADO', 
     'PUNTUALIDAD',
     'RESPONSABLE\nREGISTRO',
     'OBSERVACIONES', 
     'ACCIÓN\nCORRECTIVA']
  ];

  sheet.getRange(4, 1, 1, 15).setValues([headers[0]]);
  aplicarEstiloEncabezado(sheet.getRange(4, 1, 1, 15));

  // Filas de datos (15 filas para entrar bien en A4)
  for (let row = 5; row <= 19; row++) {
    for (let col = 1; col <= 15; col++) {
      aplicarEstiloCampo(sheet.getRange(row, col), [1,2,6,10,11,12].includes(col));
    }
  }

  // Notas al pie
  sheet.getRange('A21:O21').merge();
  sheet.getRange('A21').setValue('C = CONFORME: Todo está bien | NC = NO CONFORME: Hay un problema que necesita corrección');
  sheet.getRange('A21').setFontWeight('bold').setFontSize(8).setHorizontalAlignment('center');

  // Ajustar anchos de columna para A4 horizontal
  const anchos = [70, 60, 100, 100, 85, 45, 75, 75, 75, 70, 70, 70, 110, 120, 110];
  anchos.forEach((ancho, i) => sheet.setColumnWidth(i + 1, ancho));

  sheet.setRowHeight(4, 55);

  configurarImpresionHorizontal(sheet);
  protegerEncabezados(sheet, 4);
}

// ============= FORMULARIO 2: CONTROL FRUTAS Y VERDURAS =============

function crearControlFrutasVerduras(ss) {
  const sheet = ss.insertSheet('Control Frutas-Verduras');

  // Título
  sheet.getRange('A1:N1').merge().setValue('REGISTRO HACCP');
  aplicarEstiloEncabezado(sheet.getRange('A1'), true);

  sheet.getRange('A2:N2').merge().setValue('CONTROL DE CALIDAD DE RECEPCIÓN DE MERCADERÍA DE FRUTAS Y VERDURAS');
  aplicarEstiloEncabezado(sheet.getRange('A2'), true);

  // Mes y Año
  sheet.getRange('A3:B3').merge().setValue('MES:');
  aplicarEstiloEncabezado(sheet.getRange('A3'));
  sheet.getRange('C3:F3').merge();
  aplicarEstiloCampo(sheet.getRange('C3'));

  sheet.getRange('G3:H3').merge().setValue('AÑO:');
  aplicarEstiloEncabezado(sheet.getRange('G3'));
  sheet.getRange('I3:L3').merge();
  aplicarEstiloCampo(sheet.getRange('I3'));

  // Encabezados
  const headers = [
    ['FECHA', 'HORA', 'NOMBRE DEL\nPROVEEDOR', 'NOMBRE DEL\nPRODUCTO',
     'CANTIDAD\nSOLICITADA\nPESO O UNIDAD', 'C/NC',
     'ESTADO DEL\nPRODUCTO',
     'CONFORMIDAD\nPRODUCTO',
     'UNIFORME\nCOMPLETO', 
     'TRANSPORTE\nADECUADO', 
     'PUNTUALIDAD',
     'RESPONSABLE\nREGISTRO',
     'OBSERVACIONES', 
     'ACCIÓN\nCORRECTIVA']
  ];

  sheet.getRange(4, 1, 1, 14).setValues([headers[0]]);
  aplicarEstiloEncabezado(sheet.getRange(4, 1, 1, 14));

  // Filas de datos (15 filas)
  for (let row = 5; row <= 19; row++) {
    for (let col = 1; col <= 14; col++) {
      aplicarEstiloCampo(sheet.getRange(row, col), [1,2,6,9,10,11].includes(col));
    }
  }

  // Notas
  sheet.getRange('A21:N21').merge().setValue('C = CONFORME: Todo está bien | NC = NO CONFORME: Hay un problema que necesita corrección');
  sheet.getRange('A21').setFontWeight('bold').setFontSize(8).setHorizontalAlignment('center');

  // Anchos para A4 horizontal
  const anchos = [70, 60, 100, 100, 85, 45, 80, 80, 70, 70, 70, 110, 130, 110];
  anchos.forEach((ancho, i) => sheet.setColumnWidth(i + 1, ancho));

  sheet.setRowHeight(4, 55);

  configurarImpresionHorizontal(sheet);
  protegerEncabezados(sheet, 4);
}

// ============= FORMULARIO 3: CONTROL DE COCCIÓN (VERTICAL) =============

function crearControlCoccion(ss) {
  const sheet = ss.insertSheet('Control Cocción');

  // Título
  sheet.getRange('A1:G1').merge().setValue('Control de Cocción');
  aplicarEstiloEncabezado(sheet.getRange('A1'), true);

  sheet.getRange('H1').setValue('Versión: 01');
  sheet.getRange('H1').setFontFamily('Arial').setFontSize(9)
                      .setHorizontalAlignment('right').setVerticalAlignment('middle')
                      .setBorder(true, true, true, true, true, true);

  // Mes y Año
  sheet.getRange('A2:C2').merge().setValue('MES:');
  aplicarEstiloEncabezado(sheet.getRange('A2'));
  sheet.getRange('D2').setValue('');
  aplicarEstiloCampo(sheet.getRange('D2'));

  sheet.getRange('E2:F2').merge().setValue('AÑO:');
  aplicarEstiloEncabezado(sheet.getRange('E2'));
  sheet.getRange('G2:H2').merge();
  aplicarEstiloCampo(sheet.getRange('G2'));

  // Encabezados
  const headers = [
    ['Día', 'Hora', 'Producto a\ncocinar', 'Proceso de\ncocción',
     'Temperatura\ncocción (°C)', 'Tiempo\ncocción (min)',
     'Acción correctiva', 'Responsable']
  ];

  sheet.getRange(3, 1, 1, 8).setValues([headers[0]]);
  aplicarEstiloEncabezado(sheet.getRange(3, 1, 1, 8));

  // Filas de datos (30 filas para A4 vertical)
  for (let row = 4; row <= 33; row++) {
    for (let col = 1; col <= 8; col++) {
      aplicarEstiloCampo(sheet.getRange(row, col), [1,2,4,5,6].includes(col));
    }
  }

  // Nota PROCESO
  sheet.getRange('A35:H35').merge().setValue('PROCESO:    H=Horno    P=Plancha    C=Cocina');
  sheet.getRange('A35').setFontWeight('bold').setFontSize(9)
                       .setHorizontalAlignment('center');

  // Criterio de cocción
  sheet.getRange('A37:H38').merge().setValue(
    'Criterio de cocción: Temperatura debe ser mayor a 80°C por 15 segundos en la parte central del producto cocido, con énfasis en carne de cerdo y aves.'
  );
  sheet.getRange('A37').setFontSize(8).setWrap(true).setVerticalAlignment('top');

  // Acción correctiva
  sheet.getRange('A40:H41').merge().setValue(
    'Acción correctiva: Si el producto no llega a la temperatura adecuada, el cocinero incrementa el tiempo de cocción hasta que cumpla lo requerido.'
  );
  sheet.getRange('A40').setFontSize(8).setWrap(true).setVerticalAlignment('top');

  // Anchos para A4 vertical
  const anchos = [50, 65, 130, 75, 85, 85, 130, 115];
  anchos.forEach((ancho, i) => sheet.setColumnWidth(i + 1, ancho));

  sheet.setRowHeight(3, 40);

  configurarImpresionVertical(sheet);
  protegerEncabezados(sheet, 3);
}

// ============= FORMULARIO 4: LAVADO FRUTAS/VERDURAS =============

function crearLavadoFrutasVerduras(ss) {
  const sheet = ss.insertSheet('Lavado Frutas-Verduras');

  // Título
  sheet.getRange('A1:I1').merge().setValue('CONTROL DE LAVADO Y DESINFECCIÓN DE FRUTAS Y VERDURAS');
  aplicarEstiloEncabezado(sheet.getRange('A1'), true);

  sheet.getRange('J1').setValue('Versión: 01');
  sheet.getRange('J1').setFontSize(9).setHorizontalAlignment('right')
                      .setVerticalAlignment('middle').setBorder(true, true, true, true, true, true);

  // Mes, Producto químico, Año
  sheet.getRange('A2').setValue('Mes:');
  aplicarEstiloEncabezado(sheet.getRange('A2'));
  sheet.getRange('B2:C2').merge();
  aplicarEstiloCampo(sheet.getRange('B2'));

  sheet.getRange('D2:E2').merge().setValue('Producto químico:');
  aplicarEstiloEncabezado(sheet.getRange('D2'));
  sheet.getRange('F2:G2').merge();
  aplicarEstiloCampo(sheet.getRange('F2'));

  sheet.getRange('H2').setValue('Año:');
  aplicarEstiloEncabezado(sheet.getRange('H2'));
  sheet.getRange('I2:J2').merge();
  aplicarEstiloCampo(sheet.getRange('I2'));

  // Concentración
  sheet.getRange('A3:C3').merge().setValue('Concentración producto químico:');
  aplicarEstiloEncabezado(sheet.getRange('A3'));
  sheet.getRange('D3:J3').merge();
  aplicarEstiloCampo(sheet.getRange('D3'));

  // Encabezados de columnas
  const headers = [
    ['Día', 'Hora', 'Nombre\nFruta/Verdura',
     'Lavado con\nAgua potable\n(C/NC)',
     'Desinfección\nproducto químico\n(C/NC)',
     'Concentración\nproducto químico\n(C/NC)',
     'Tiempo\ndesinfección',
     'Acción\nCorrectiva',
     'Responsable',
     'Supervisor']
  ];

  sheet.getRange(4, 1, 1, 10).setValues([headers[0]]);
  aplicarEstiloEncabezado(sheet.getRange(4, 1, 1, 10));

  // Filas de datos (18 filas para A4)
  for (let row = 5; row <= 22; row++) {
    for (let col = 1; col <= 10; col++) {
      aplicarEstiloCampo(sheet.getRange(row, col), [1,2,4,5,6,7].includes(col));
    }
  }

  // Leyenda
  sheet.getRange('A24:J24').merge().setValue('C = CONFORME | NC = NO CONFORME');
  sheet.getRange('A24').setFontWeight('bold').setFontSize(8).setHorizontalAlignment('center');

  // Anchos para A4 horizontal
  const anchos = [55, 65, 115, 90, 90, 90, 75, 120, 100, 100];
  anchos.forEach((ancho, i) => sheet.setColumnWidth(i + 1, ancho));

  sheet.setRowHeight(4, 50);

  configurarImpresionHorizontal(sheet);
  protegerEncabezados(sheet, 4);
}

// ============= FORMULARIO 5: LAVADO DE MANOS (VERTICAL) =============

function crearLavadoManos(ss) {
  const sheet = ss.insertSheet('Lavado de Manos');

  // Título
  sheet.getRange('A1:H1').merge().setValue('REGISTRO HACCP');
  aplicarEstiloEncabezado(sheet.getRange('A1'), true);

  sheet.getRange('A2:H2').merge().setValue('CONTROL DE LAVADO Y DESINFECCIÓN DE MANOS');
  aplicarEstiloEncabezado(sheet.getRange('A2'), true);

  // Área
  sheet.getRange('A3:H3').merge().setValue('ÁREA O ESTACIÓN: Cocina y Salón');
  aplicarEstiloEncabezado(sheet.getRange('A3'));

  // Mes y Año
  sheet.getRange('A4:B4').merge().setValue('MES:');
  aplicarEstiloEncabezado(sheet.getRange('A4'));
  sheet.getRange('C4:E4').merge();
  aplicarEstiloCampo(sheet.getRange('C4'));

  sheet.getRange('F4').setValue('AÑO:');
  aplicarEstiloEncabezado(sheet.getRange('F4'));
  sheet.getRange('G4:H4').merge();
  aplicarEstiloCampo(sheet.getRange('G4'));

  // Encabezados
  const headers = [
    ['FECHA', 'HORA', 'TURNO', 'NOMBRES Y APELLIDO', 'FIRMA', 'C/NC', 'ACCIÓN CORRECTIVA', 'SUPERVISOR']
  ];
  sheet.getRange(5, 1, 1, 8).setValues(headers);
  aplicarEstiloEncabezado(sheet.getRange(5, 1, 1, 8));

  // Filas de datos (35 filas para A4 vertical)
  for (let row = 6; row <= 40; row++) {
    for (let col = 1; col <= 8; col++) {
      aplicarEstiloCampo(sheet.getRange(row, col), [1,2,3,6].includes(col));
    }
  }

  // Leyenda
  sheet.getRange('A42:H42').merge().setValue('C = CONFORME: Procedimiento correcto | NC = NO CONFORME: Procedimiento incompleto, requiere repetir');
  sheet.getRange('A42').setFontWeight('bold').setFontSize(8).setHorizontalAlignment('center');

  // Anchos para A4 vertical
  const anchos = [75, 60, 75, 160, 110, 50, 120, 100];
  anchos.forEach((ancho, i) => sheet.setColumnWidth(i + 1, ancho));

  sheet.setRowHeight(5, 35);

  configurarImpresionVertical(sheet);
  protegerEncabezados(sheet, 5);
}

// ============= FORMULARIO 6: CONTROL TEMPERATURA =============

function crearControlTemperatura(ss) {
  // REFRIGERACIÓN - CÁMARA 1
  const sheet1 = ss.insertSheet('Temp Refrigeración 1');

  sheet1.getRange('A1:I1').merge().setValue('REGISTRO HACCP');
  aplicarEstiloEncabezado(sheet1.getRange('A1'), true);

  sheet1.getRange('A2:I2').merge().setValue('CONTROL DE TEMPERATURA DE REFRIGERACIÓN - CÁMARA 1');
  aplicarEstiloEncabezado(sheet1.getRange('A2'), true);

  sheet1.getRange('A3:B3').merge().setValue('MES:');
  aplicarEstiloEncabezado(sheet1.getRange('A3'));
  sheet1.getRange('C3:D3').merge();
  aplicarEstiloCampo(sheet1.getRange('C3'));

  sheet1.getRange('E3:F3').merge().setValue('AÑO:');
  aplicarEstiloEncabezado(sheet1.getRange('E3'));
  sheet1.getRange('G3:I3').merge();
  aplicarEstiloCampo(sheet1.getRange('G3'));

  sheet1.getRange('A4:I4').merge().setValue('Frecuencia: Todos los días, dos veces al día | Rango: 1°C a 4°C');
  sheet1.getRange('A4').setFontWeight('bold').setFontSize(9)
                       .setHorizontalAlignment('center').setVerticalAlignment('middle');

  // Encabezados
  sheet1.getRange('A5').setValue('DÍA');
  sheet1.getRange('B5:D5').merge().setValue('TURNO MAÑANA (08:00)');
  sheet1.getRange('E5:G5').merge().setValue('TURNO TARDE (16:00)');
  sheet1.getRange('H5').setValue('ACCIONES\nCORRECTIVAS');
  sheet1.getRange('I5').setValue('SUPERVISOR');

  ['A5', 'B5', 'E5', 'H5', 'I5'].forEach(cell => aplicarEstiloEncabezado(sheet1.getRange(cell)));

  const subHeaders = [['', 'Temp (°C)', 'C/NC', 'Responsable', 'Temp (°C)', 'C/NC', 'Responsable', '', '']];
  sheet1.getRange(6, 1, 1, 9).setValues(subHeaders);
  aplicarEstiloEncabezado(sheet1.getRange(6, 1, 1, 9));

  // 31 días
  for (let dia = 1; dia <= 31; dia++) {
    const row = 6 + dia;
    sheet1.getRange(row, 1).setValue(dia);
    for (let col = 1; col <= 9; col++) {
      aplicarEstiloCampo(sheet1.getRange(row, col), [1,2,3,5,6].includes(col));
    }
  }

  // Leyenda
  sheet1.getRange('A39:I39').merge().setValue('C = CONFORME: Temperatura correcta | NC = NO CONFORME: Temperatura fuera de rango');
  sheet1.getRange('A39').setFontWeight('bold').setFontSize(8).setHorizontalAlignment('center');

  // Anchos para A4 horizontal
  const anchos = [50, 70, 55, 130, 70, 55, 130, 120, 100];
  anchos.forEach((ancho, i) => sheet1.setColumnWidth(i + 1, ancho));

  sheet1.setRowHeight(5, 35);
  sheet1.setRowHeight(6, 30);

  configurarImpresionHorizontal(sheet1);
  protegerEncabezados(sheet1, 6);

  // REFRIGERACIÓN - CÁMARA 2
  const sheet2 = sheet1.copyTo(ss);
  sheet2.setName('Temp Refrigeración 2');
  sheet2.getRange('A2').setValue('CONTROL DE TEMPERATURA DE REFRIGERACIÓN - CÁMARA 2');

  // CONGELACIÓN - CÁMARA 1
  const sheet3 = sheet1.copyTo(ss);
  sheet3.setName('Temp Congelación 1');
  sheet3.getRange('A2').setValue('CONTROL DE TEMPERATURA DE CONGELACIÓN - CÁMARA 1');
  sheet3.getRange('A4').setValue('Frecuencia: Todos los días, dos veces al día | Rango: < -18°C');
}

// ============= FUNCIÓN DE PROTECCIÓN =============

function protegerEncabezados(sheet, ultimaFilaEncabezado) {
  const protection = sheet.protect().setDescription('Protección de encabezados');

  // Desproteger solo las celdas de datos
  const dataRange = sheet.getRange(ultimaFilaEncabezado + 1, 1, sheet.getMaxRows() - ultimaFilaEncabezado, sheet.getMaxColumns());
  protection.setUnprotectedRanges([dataRange]);

  // Remover todos los editores excepto el dueño
  const me = Session.getEffectiveUser();
  protection.removeEditors(protection.getEditors());
  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }
}

// ============= FUNCIÓN DE MENÚ =============

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📋 HACCP')
    .addItem('🔄 Generar Nuevos Formularios', 'generarFormulariosHACCP')
    .addToUi();
}