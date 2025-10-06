import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// =====================================================
// UTILIDADES COMUNES PARA FORMATEO
// =====================================================

/**
 * Configurar estilos base para las hojas HACCP
 */
const configurarEstilosBase = (worksheet) => {
  // Configurar anchos de columnas
  worksheet.columns = [
    { width: 3 },   // A
    { width: 8 },   // B
    { width: 8 },   // C
    { width: 8 },   // D
    { width: 8 },   // E
    { width: 8 },   // F
    { width: 8 },   // G
    { width: 8 },   // H
    { width: 8 },   // I
    { width: 8 },   // J
    { width: 8 },   // K
    { width: 8 },   // L
    { width: 8 },   // M
    { width: 8 },   // N
    { width: 8 },   // O
    { width: 8 },   // P
  ];

  // Configurar alturas de filas
  for (let i = 1; i <= 50; i++) {
    worksheet.getRow(i).height = 20;
  }
};

/**
 * Aplicar estilo de encabezado principal
 */
const aplicarEstiloEncabezado = (cell, texto) => {
  cell.value = texto;
  cell.font = { name: 'Arial', size: 12, bold: true };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6FA' } };
  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
};

/**
 * Aplicar estilo de celda de datos
 */
const aplicarEstiloCelda = (cell, valor = '', centrado = false) => {
  cell.value = valor;
  cell.font = { name: 'Arial', size: 10 };
  cell.alignment = { 
    horizontal: centrado ? 'center' : 'left', 
    vertical: 'middle' 
  };
  cell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
};

/**
 * Aplicar estilo de celda editable (desbloqueada)
 */
const aplicarEstiloCeldaEditable = (cell, valor = '') => {
  aplicarEstiloCelda(cell, valor, true);
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }; // Amarillo claro
  cell.protection = { locked: false };
};

// =====================================================
// FORMULARIO: RECEPCIÓN DE ABARROTES
// =====================================================

/**
 * Generar formulario de Recepción de Abarrotes (vacío o con datos)
 */
export const generarFormularioRecepcionAbarrotes = async (datos = null, mes = null, anio = null) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Recepción Abarrotes');
  
  configurarEstilosBase(worksheet);

  // ENCABEZADO PRINCIPAL
  worksheet.mergeCells('B2:O2');
  aplicarEstiloEncabezado(worksheet.getCell('B2'), 'CONTROL DE RECEPCIÓN DE ABARROTES');

  // Información del mes/año
  worksheet.mergeCells('B4:D4');
  aplicarEstiloEncabezado(worksheet.getCell('B4'), 'MES:');
  aplicarEstiloCeldaEditable(worksheet.getCell('E4'), mes || '');
  
  worksheet.mergeCells('G4:I4');
  aplicarEstiloEncabezado(worksheet.getCell('G4'), 'AÑO:');
  aplicarEstiloCeldaEditable(worksheet.getCell('J4'), anio || '');

  // ENCABEZADOS DE TABLA
  const encabezados = [
    'FECHA', 'HORA', 'PROVEEDOR', 'PRODUCTO', 'CANTIDAD',
    'REG. SANITARIO', 'FECHA VENC.', 'EVAL. VENC.', 'EMPAQUE',
    'UNIFORME', 'TRANSPORTE', 'PUNTUALIDAD', 'RESPONSABLE',
    'SUPERVISOR', 'OBSERVACIONES', 'ACCIÓN CORRECTIVA'
  ];

  let col = 2; // Columna B
  encabezados.forEach(encabezado => {
    aplicarEstiloEncabezado(worksheet.getCell(6, col), encabezado);
    col++;
  });

  // FILAS DE DATOS
  let fila = 7;
  if (datos && Array.isArray(datos)) {
    datos.forEach(item => {
      aplicarEstiloCelda(worksheet.getCell(fila, 2), format(new Date(item.fecha), 'dd/MM/yyyy'));
      aplicarEstiloCelda(worksheet.getCell(fila, 3), item.hora);
      aplicarEstiloCelda(worksheet.getCell(fila, 4), item.nombre_proveedor);
      aplicarEstiloCelda(worksheet.getCell(fila, 5), item.nombre_producto);
      aplicarEstiloCelda(worksheet.getCell(fila, 6), item.cantidad_solicitada);
      aplicarEstiloCelda(worksheet.getCell(fila, 7), item.registro_sanitario_vigente ? 'SÍ' : 'NO', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 8), item.fecha_vencimiento_producto ? format(new Date(item.fecha_vencimiento_producto), 'dd/MM/yyyy') : '');
      aplicarEstiloCelda(worksheet.getCell(fila, 9), item.evaluacion_vencimiento, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 10), item.conformidad_empaque_primario, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 11), item.uniforme_completo === 'C' ? 'C' : 'NC', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 12), item.transporte_adecuado === 'C' ? 'C' : 'NC', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 13), item.puntualidad === 'C' ? 'C' : 'NC', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 14), item.responsable_registro_nombre);
      aplicarEstiloCelda(worksheet.getCell(fila, 15), item.responsable_supervision_nombre);
      aplicarEstiloCelda(worksheet.getCell(fila, 16), item.observaciones || '');
      aplicarEstiloCelda(worksheet.getCell(fila, 17), item.accion_correctiva || '');
      fila++;
    });
  } else {
    // Formulario vacío - 31 filas editables
    for (let i = 0; i < 31; i++) {
      for (let col = 2; col <= 17; col++) {
        aplicarEstiloCeldaEditable(worksheet.getCell(fila + i, col));
      }
    }
  }

  // NOTAS AL PIE
  const notasFila = fila + (datos ? 2 : 33);
  worksheet.mergeCells(`B${notasFila}:O${notasFila}`);
  aplicarEstiloCelda(worksheet.getCell(`B${notasFila}`), 'NOTAS: C = Conforme, NC = No Conforme. Registrar observaciones detalladas en caso de no conformidades.');

  // Proteger hoja (solo celdas amarillas editables)
  worksheet.protect('haccp2024', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertRows: false,
    insertColumns: false,
    deleteRows: false,
    deleteColumns: false
  });

  return workbook;
};

// =====================================================
// FORMULARIO: RECEPCIÓN DE FRUTAS Y VERDURAS
// =====================================================

export const generarFormularioRecepcionFrutasVerduras = async (datos = null, mes = null, anio = null) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Recepción Frutas/Verduras');
  
  configurarEstilosBase(worksheet);

  // ENCABEZADO PRINCIPAL
  worksheet.mergeCells('B2:O2');
  aplicarEstiloEncabezado(worksheet.getCell('B2'), 'CONTROL DE RECEPCIÓN DE FRUTAS Y VERDURAS');

  // Información del mes/año
  worksheet.mergeCells('B4:D4');
  aplicarEstiloEncabezado(worksheet.getCell('B4'), 'MES:');
  aplicarEstiloCeldaEditable(worksheet.getCell('E4'), mes || '');
  
  worksheet.mergeCells('G4:I4');
  aplicarEstiloEncabezado(worksheet.getCell('G4'), 'AÑO:');
  aplicarEstiloCeldaEditable(worksheet.getCell('J4'), anio || '');

  // ENCABEZADOS DE TABLA
  const encabezados = [
    'FECHA', 'HORA', 'PROVEEDOR', 'PRODUCTO', 'PESO/UNIDAD',
    'UNIDAD', 'ESTADO', 'INTEGRIDAD', 'UNIFORME',
    'TRANSPORTE', 'PUNTUALIDAD', 'RESPONSABLE',
    'SUPERVISOR', 'OBSERVACIONES', 'ACCIÓN CORRECTIVA'
  ];

  let col = 2;
  encabezados.forEach(encabezado => {
    aplicarEstiloEncabezado(worksheet.getCell(6, col), encabezado);
    col++;
  });

  // FILAS DE DATOS
  let fila = 7;
  if (datos && Array.isArray(datos)) {
    datos.forEach(item => {
      aplicarEstiloCelda(worksheet.getCell(fila, 2), format(new Date(item.fecha), 'dd/MM/yyyy'));
      aplicarEstiloCelda(worksheet.getCell(fila, 3), item.hora);
      aplicarEstiloCelda(worksheet.getCell(fila, 4), item.nombre_proveedor);
      aplicarEstiloCelda(worksheet.getCell(fila, 5), item.nombre_producto);
      aplicarEstiloCelda(worksheet.getCell(fila, 6), item.peso_unidad_recibido);
      aplicarEstiloCelda(worksheet.getCell(fila, 7), item.unidad_medida);
      aplicarEstiloCelda(worksheet.getCell(fila, 8), item.estado_producto, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 9), item.conformidad_integridad_producto, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 10), item.uniforme_completo === 'C' ? 'C' : 'NC', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 11), item.transporte_adecuado === 'C' ? 'C' : 'NC', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 12), item.puntualidad === 'C' ? 'C' : 'NC', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 13), item.responsable_registro_nombre);
      aplicarEstiloCelda(worksheet.getCell(fila, 14), item.responsable_supervision_nombre);
      aplicarEstiloCelda(worksheet.getCell(fila, 15), item.observaciones || '');
      aplicarEstiloCelda(worksheet.getCell(fila, 16), item.accion_correctiva || '');
      fila++;
    });
  } else {
    // Formulario vacío
    for (let i = 0; i < 31; i++) {
      for (let col = 2; col <= 16; col++) {
        aplicarEstiloCeldaEditable(worksheet.getCell(fila + i, col));
      }
    }
  }

  // NOTAS AL PIE
  const notasFila = fila + (datos ? 2 : 33);
  worksheet.mergeCells(`B${notasFila}:O${notasFila}`);
  aplicarEstiloCelda(worksheet.getCell(`B${notasFila}`), 'NOTAS: C = Conforme, NC = No Conforme. Estado: F = Fresco, R = Regular, M = Malo');

  // Proteger hoja
  worksheet.protect('haccp2024', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertRows: false,
    insertColumns: false,
    deleteRows: false,
    deleteColumns: false
  });

  return workbook;
};

// =====================================================
// FORMULARIO: CONTROL DE COCCIÓN
// =====================================================

export const generarFormularioControlCoccion = async (datos = null, mes = null, anio = null) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Control Cocción');
  
  configurarEstilosBase(worksheet);

  // ENCABEZADO PRINCIPAL
  worksheet.mergeCells('B2:M2');
  aplicarEstiloEncabezado(worksheet.getCell('B2'), 'CONTROL DE COCCIÓN');

  // Información del mes/año
  worksheet.mergeCells('B4:D4');
  aplicarEstiloEncabezado(worksheet.getCell('B4'), 'MES:');
  aplicarEstiloCeldaEditable(worksheet.getCell('E4'), mes || '');
  
  worksheet.mergeCells('G4:I4');
  aplicarEstiloEncabezado(worksheet.getCell('G4'), 'AÑO:');
  aplicarEstiloCeldaEditable(worksheet.getCell('J4'), anio || '');

  // ENCABEZADOS DE TABLA
  const encabezados = [
    'FECHA', 'HORA', 'PRODUCTO', 'PROCESO', 'TEMPERATURA (°C)',
    'TIEMPO (min)', 'CONFORMIDAD', 'ACCIÓN CORRECTIVA', 'RESPONSABLE'
  ];

  let col = 2;
  encabezados.forEach(encabezado => {
    aplicarEstiloEncabezado(worksheet.getCell(6, col), encabezado);
    col++;
  });

  // FILAS DE DATOS
  let fila = 7;
  if (datos && Array.isArray(datos)) {
    datos.forEach(item => {
      aplicarEstiloCelda(worksheet.getCell(fila, 2), format(new Date(item.fecha), 'dd/MM/yyyy'));
      aplicarEstiloCelda(worksheet.getCell(fila, 3), item.hora);
      aplicarEstiloCelda(worksheet.getCell(fila, 4), item.producto_cocinar);
      aplicarEstiloCelda(worksheet.getCell(fila, 5), item.proceso_coccion === 'H' ? 'Horno' : item.proceso_coccion === 'P' ? 'Plancha' : 'Cocina');
      aplicarEstiloCelda(worksheet.getCell(fila, 6), item.temperatura_coccion, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 7), item.tiempo_coccion_minutos, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 8), item.conformidad, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 9), item.accion_correctiva || '');
      aplicarEstiloCelda(worksheet.getCell(fila, 10), item.responsable_nombre);
      fila++;
    });
  } else {
    // Formulario vacío
    for (let i = 0; i < 31; i++) {
      for (let col = 2; col <= 10; col++) {
        aplicarEstiloCeldaEditable(worksheet.getCell(fila + i, col));
      }
    }
  }

  // NOTAS AL PIE
  const notasFila = fila + (datos ? 2 : 33);
  worksheet.mergeCells(`B${notasFila}:M${notasFila}`);
  aplicarEstiloCelda(worksheet.getCell(`B${notasFila}`), 'NOTAS: Temperatura mínima 80°C. C = Conforme (≥80°C), NC = No Conforme (<80°C)');

  // Proteger hoja
  worksheet.protect('haccp2024', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertRows: false,
    insertColumns: false,
    deleteRows: false,
    deleteColumns: false
  });

  return workbook;
};

// =====================================================
// FORMULARIO: LAVADO Y DESINFECCIÓN DE FRUTAS
// =====================================================

export const generarFormularioLavadoFrutas = async (datos = null, mes = null, anio = null) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Lavado Frutas');
  
  configurarEstilosBase(worksheet);

  // ENCABEZADO PRINCIPAL
  worksheet.mergeCells('B2:N2');
  aplicarEstiloEncabezado(worksheet.getCell('B2'), 'CONTROL DE LAVADO Y DESINFECCIÓN DE FRUTAS Y VERDURAS');

  // Información del mes/año
  worksheet.mergeCells('B4:D4');
  aplicarEstiloEncabezado(worksheet.getCell('B4'), 'MES:');
  aplicarEstiloCeldaEditable(worksheet.getCell('E4'), mes || '');
  
  worksheet.mergeCells('G4:I4');
  aplicarEstiloEncabezado(worksheet.getCell('G4'), 'AÑO:');
  aplicarEstiloCeldaEditable(worksheet.getCell('J4'), anio || '');

  // ENCABEZADOS DE TABLA
  const encabezados = [
    'FECHA', 'HORA', 'FRUTA/VERDURA', 'PRODUCTO QUÍMICO', 'CONCENTRACIÓN',
    'LAVADO AGUA', 'DESINFECCIÓN', 'CONC. CORRECTA', 'TIEMPO (min)',
    'ACCIONES CORRECTIVAS', 'SUPERVISOR'
  ];

  let col = 2;
  encabezados.forEach(encabezado => {
    aplicarEstiloEncabezado(worksheet.getCell(6, col), encabezado);
    col++;
  });

  // FILAS DE DATOS
  let fila = 7;
  if (datos && Array.isArray(datos)) {
    datos.forEach(item => {
      aplicarEstiloCelda(worksheet.getCell(fila, 2), format(new Date(item.fecha), 'dd/MM/yyyy'));
      aplicarEstiloCelda(worksheet.getCell(fila, 3), item.hora);
      aplicarEstiloCelda(worksheet.getCell(fila, 4), item.nombre_fruta_verdura);
      aplicarEstiloCelda(worksheet.getCell(fila, 5), item.producto_quimico);
      aplicarEstiloCelda(worksheet.getCell(fila, 6), item.concentracion_producto);
      aplicarEstiloCelda(worksheet.getCell(fila, 7), item.lavado_agua_potable === 'C' ? 'C' : 'NC', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 8), item.desinfeccion_producto_quimico === 'C' ? 'C' : 'NC', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 9), item.concentracion_correcta === 'C' ? 'C' : 'NC', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 10), item.tiempo_desinfeccion_minutos, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 11), item.acciones_correctivas || '');
      aplicarEstiloCelda(worksheet.getCell(fila, 12), item.supervisor_nombre);
      fila++;
    });
  } else {
    // Formulario vacío
    for (let i = 0; i < 31; i++) {
      for (let col = 2; col <= 12; col++) {
        aplicarEstiloCeldaEditable(worksheet.getCell(fila + i, col));
      }
    }
  }

  // NOTAS AL PIE
  const notasFila = fila + (datos ? 2 : 33);
  worksheet.mergeCells(`B${notasFila}:N${notasFila}`);
  aplicarEstiloCelda(worksheet.getCell(`B${notasFila}`), 'NOTAS: C = Conforme, NC = No Conforme. Concentración recomendada: 200 ppm de cloro');

  // Proteger hoja
  worksheet.protect('haccp2024', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertRows: false,
    insertColumns: false,
    deleteRows: false,
    deleteColumns: false
  });

  return workbook;
};

// =====================================================
// FORMULARIO: LAVADO DE MANOS
// =====================================================

export const generarFormularioLavadoManos = async (datos = null, mes = null, anio = null) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Lavado Manos');
  
  configurarEstilosBase(worksheet);

  // ENCABEZADO PRINCIPAL
  worksheet.mergeCells('B2:L2');
  aplicarEstiloEncabezado(worksheet.getCell('B2'), 'CONTROL DE LAVADO DE MANOS');

  // Información del mes/año
  worksheet.mergeCells('B4:D4');
  aplicarEstiloEncabezado(worksheet.getCell('B4'), 'MES:');
  aplicarEstiloCeldaEditable(worksheet.getCell('E4'), mes || '');
  
  worksheet.mergeCells('G4:I4');
  aplicarEstiloEncabezado(worksheet.getCell('G4'), 'AÑO:');
  aplicarEstiloCeldaEditable(worksheet.getCell('J4'), anio || '');

  // ENCABEZADOS DE TABLA
  const encabezados = [
    'FECHA', 'HORA', 'EMPLEADO', 'ÁREA', 'TURNO',
    'FIRMA', 'PROCEDIMIENTO', 'ACCIÓN CORRECTIVA', 'SUPERVISOR'
  ];

  let col = 2;
  encabezados.forEach(encabezado => {
    aplicarEstiloEncabezado(worksheet.getCell(6, col), encabezado);
    col++;
  });

  // FILAS DE DATOS
  let fila = 7;
  if (datos && Array.isArray(datos)) {
    datos.forEach(item => {
      aplicarEstiloCelda(worksheet.getCell(fila, 2), format(new Date(item.fecha), 'dd/MM/yyyy'));
      aplicarEstiloCelda(worksheet.getCell(fila, 3), item.hora);
      aplicarEstiloCelda(worksheet.getCell(fila, 4), item.empleado_nombre);
      aplicarEstiloCelda(worksheet.getCell(fila, 5), item.area_estacion);
      aplicarEstiloCelda(worksheet.getCell(fila, 6), item.turno);
      aplicarEstiloCelda(worksheet.getCell(fila, 7), item.firma);
      aplicarEstiloCelda(worksheet.getCell(fila, 8), item.procedimiento_correcto === 'Sí' ? 'SÍ' : 'NO', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 9), item.accion_correctiva || '');
      aplicarEstiloCelda(worksheet.getCell(fila, 10), item.supervisor_nombre || '');
      fila++;
    });
  } else {
    // Formulario vacío
    for (let i = 0; i < 31; i++) {
      for (let col = 2; col <= 10; col++) {
        aplicarEstiloCeldaEditable(worksheet.getCell(fila + i, col));
      }
    }
  }

  // NOTAS AL PIE
  const notasFila = fila + (datos ? 2 : 33);
  worksheet.mergeCells(`B${notasFila}:L${notasFila}`);
  aplicarEstiloCelda(worksheet.getCell(`B${notasFila}`), 'NOTAS: Lavado obligatorio antes de manipular alimentos. Procedimiento: agua + jabón + 20 segundos mínimo');

  // Proteger hoja
  worksheet.protect('haccp2024', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertRows: false,
    insertColumns: false,
    deleteRows: false,
    deleteColumns: false
  });

  return workbook;
};

// =====================================================
// FORMULARIO: TEMPERATURA DE CÁMARAS
// =====================================================

export const generarFormularioTemperaturaCamaras = async (datos = null, mes = null, anio = null) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Temperatura Cámaras');
  
  configurarEstilosBase(worksheet);

  // ENCABEZADO PRINCIPAL
  worksheet.mergeCells('B2:M2');
  aplicarEstiloEncabezado(worksheet.getCell('B2'), 'CONTROL DE TEMPERATURA DE CÁMARAS FRIGORÍFICAS');

  // Información del mes/año
  worksheet.mergeCells('B4:D4');
  aplicarEstiloEncabezado(worksheet.getCell('B4'), 'MES:');
  aplicarEstiloCeldaEditable(worksheet.getCell('E4'), mes || '');
  
  worksheet.mergeCells('G4:I4');
  aplicarEstiloEncabezado(worksheet.getCell('G4'), 'AÑO:');
  aplicarEstiloCeldaEditable(worksheet.getCell('J4'), anio || '');

  // ENCABEZADOS DE TABLA
  const encabezados = [
    'FECHA', 'CÁMARA', 'TEMP MAÑANA', 'TEMP TARDE', 'CONF. MAÑANA',
    'CONF. TARDE', 'ACCIONES CORRECTIVAS', 'SUPERVISOR'
  ];

  let col = 2;
  encabezados.forEach(encabezado => {
    aplicarEstiloEncabezado(worksheet.getCell(6, col), encabezado);
    col++;
  });

  // FILAS DE DATOS
  let fila = 7;
  if (datos && Array.isArray(datos)) {
    datos.forEach(item => {
      aplicarEstiloCelda(worksheet.getCell(fila, 2), format(new Date(item.fecha), 'dd/MM/yyyy'));
      aplicarEstiloCelda(worksheet.getCell(fila, 3), item.camara_nombre);
      aplicarEstiloCelda(worksheet.getCell(fila, 4), item.temperatura_manana, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 5), item.temperatura_tarde, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 6), item.conformidad_manana, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 7), item.conformidad_tarde, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 8), item.acciones_correctivas || '');
      aplicarEstiloCelda(worksheet.getCell(fila, 9), item.supervisor_nombre || '');
      fila++;
    });
  } else {
    // Formulario vacío
    for (let i = 0; i < 31; i++) {
      for (let col = 2; col <= 9; col++) {
        aplicarEstiloCeldaEditable(worksheet.getCell(fila + i, col));
      }
    }
  }

  // NOTAS AL PIE
  const notasFila = fila + (datos ? 2 : 33);
  worksheet.mergeCells(`B${notasFila}:M${notasFila}`);
  aplicarEstiloCelda(worksheet.getCell(`B${notasFila}`), 'NOTAS: Rango aceptable: 0°C a 4°C. C = Conforme, NC = No Conforme. Registrar temperaturas a las 8:00 AM y 4:00 PM');

  // Proteger hoja
  worksheet.protect('haccp2024', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertRows: false,
    insertColumns: false,
    deleteRows: false,
    deleteColumns: false
  });

  return workbook;
};

// =====================================================
// FUNCIONES DE DESCARGA
// =====================================================

/**
 * Descargar archivo Excel
 */
const descargarExcel = async (workbook, nombreArchivo) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  link.click();
  window.URL.revokeObjectURL(url);
};

// =====================================================
// FUNCIONES PÚBLICAS DE EXPORTACIÓN
// =====================================================

/**
 * Exportar formulario vacío de Recepción de Abarrotes
 */
export const exportarFormularioVacioAbarrotes = async (mes, anio) => {
  const workbook = await generarFormularioRecepcionAbarrotes(null, mes, anio);
  await descargarExcel(workbook, `formulario_abarrotes_${anio}_${mes.toString().padStart(2, '0')}.xlsx`);
};

/**
 * Exportar formulario con datos de Recepción de Abarrotes
 */
export const exportarRecepcionAbarrotes = async (datos, mes, anio) => {
  const workbook = await generarFormularioRecepcionAbarrotes(datos, mes, anio);
  await descargarExcel(workbook, `reporte_abarrotes_${anio}_${mes.toString().padStart(2, '0')}.xlsx`);
};

/**
 * Exportar formulario vacío de Recepción de Frutas y Verduras
 */
export const exportarFormularioVacioFrutasVerduras = async (mes, anio) => {
  const workbook = await generarFormularioRecepcionFrutasVerduras(null, mes, anio);
  await descargarExcel(workbook, `formulario_frutas_verduras_${anio}_${mes.toString().padStart(2, '0')}.xlsx`);
};

/**
 * Exportar formulario con datos de Recepción de Frutas y Verduras
 */
export const exportarRecepcionFrutasVerduras = async (datos, mes, anio) => {
  const workbook = await generarFormularioRecepcionFrutasVerduras(datos, mes, anio);
  await descargarExcel(workbook, `reporte_frutas_verduras_${anio}_${mes.toString().padStart(2, '0')}.xlsx`);
};

/**
 * Exportar formulario vacío de Control de Cocción
 */
export const exportarFormularioVacioCoccion = async (mes, anio) => {
  const workbook = await generarFormularioControlCoccion(null, mes, anio);
  await descargarExcel(workbook, `formulario_coccion_${anio}_${mes.toString().padStart(2, '0')}.xlsx`);
};

/**
 * Exportar formulario con datos de Control de Cocción
 */
export const exportarControlCoccion = async (datos, mes, anio) => {
  const workbook = await generarFormularioControlCoccion(datos, mes, anio);
  await descargarExcel(workbook, `reporte_coccion_${anio}_${mes.toString().padStart(2, '0')}.xlsx`);
};

/**
 * Exportar formulario vacío de Lavado de Frutas
 */
export const exportarFormularioVacioLavadoFrutas = async (mes, anio) => {
  const workbook = await generarFormularioLavadoFrutas(null, mes, anio);
  await descargarExcel(workbook, `formulario_lavado_frutas_${anio}_${mes.toString().padStart(2, '0')}.xlsx`);
};

/**
 * Exportar formulario con datos de Lavado de Frutas
 */
export const exportarLavadoFrutas = async (datos, mes, anio) => {
  const workbook = await generarFormularioLavadoFrutas(datos, mes, anio);
  await descargarExcel(workbook, `reporte_lavado_frutas_${anio}_${mes.toString().padStart(2, '0')}.xlsx`);
};

/**
 * Exportar formulario vacío de Lavado de Manos
 */
export const exportarFormularioVacioLavadoManos = async (mes, anio) => {
  const workbook = await generarFormularioLavadoManos(null, mes, anio);
  await descargarExcel(workbook, `formulario_lavado_manos_${anio}_${mes.toString().padStart(2, '0')}.xlsx`);
};

/**
 * Exportar formulario con datos de Lavado de Manos
 */
export const exportarLavadoManos = async (datos, mes, anio) => {
  const workbook = await generarFormularioLavadoManos(datos, mes, anio);
  await descargarExcel(workbook, `reporte_lavado_manos_${anio}_${mes.toString().padStart(2, '0')}.xlsx`);
};

/**
 * Exportar formulario vacío de Temperatura de Cámaras
 */
export const exportarFormularioVacioTemperaturaCamaras = async (mes, anio) => {
  const workbook = await generarFormularioTemperaturaCamaras(null, mes, anio);
  await descargarExcel(workbook, `formulario_temperatura_camaras_${anio}_${mes.toString().padStart(2, '0')}.xlsx`);
};

/**
 * Exportar formulario con datos de Temperatura de Cámaras
 */
export const exportarTemperaturaCamaras = async (datos, mes, anio) => {
  const workbook = await generarFormularioTemperaturaCamaras(datos, mes, anio);
  await descargarExcel(workbook, `reporte_temperatura_camaras_${anio}_${mes.toString().padStart(2, '0')}.xlsx`);
};

// =====================================================
// FUNCIONES LEGACY (mantener compatibilidad)
// =====================================================

export const exportarRecepcionMercaderia = exportarRecepcionFrutasVerduras;
export const exportarAsistencias = async (datos, mes, anio) => {
  console.warn('exportarAsistencias: Función no implementada para formato HACCP');
};
export const exportarResumenNC = async (datos, mes, anio) => {
  console.warn('exportarResumenNC: Función no implementada para formato HACCP');
};
