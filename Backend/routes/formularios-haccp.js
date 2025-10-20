const express = require('express');
const ExcelJS = require('exceljs');
const { format, getDaysInMonth } = require('date-fns');
const { es } = require('date-fns/locale');
const { db } = require('../utils/database');
// Importar utilidades de tiempo para zona horaria de Lima, Perú
const { 
  getCurrentPeruDate, 
  formatDateForDB, 
  formatTimeForDB, 
  formatDateForDisplay,
  PERU_TIMEZONE 
} = require('../utils/timeUtils');

const router = express.Router();

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

/**
 * Formatea una fecha para mostrar en Excel usando zona horaria de Lima, Perú
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada en formato dd/MM/yyyy
 */
const formatearFechaParaExcel = (fecha) => {
  if (!fecha) return '';
  try {
    // Convertir la fecha a zona horaria de Lima, Perú
    const fechaLima = new Date(fecha);
    return fechaLima.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: PERU_TIMEZONE
    });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '';
  }
};

// =====================================================
// GENERADORES DE FORMULARIOS
// =====================================================

/**
 * Generar formulario de Recepción de Abarrotes
 */
const generarFormularioRecepcionAbarrotes = async (datos = null, mes = null, anio = null) => {
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
      aplicarEstiloCelda(worksheet.getCell(fila, 2), formatearFechaParaExcel(item.fecha));
      aplicarEstiloCelda(worksheet.getCell(fila, 3), item.hora);
      aplicarEstiloCelda(worksheet.getCell(fila, 4), item.nombre_proveedor);
      aplicarEstiloCelda(worksheet.getCell(fila, 5), item.nombre_producto);
      aplicarEstiloCelda(worksheet.getCell(fila, 6), item.cantidad_solicitada);
      aplicarEstiloCelda(worksheet.getCell(fila, 7), item.registro_sanitario_vigente === 'Conforme' ? 'SÍ' : 'NO', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 8), formatearFechaParaExcel(item.fecha_vencimiento_producto));
      aplicarEstiloCelda(worksheet.getCell(fila, 9), item.evaluacion_vencimiento, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 10), item.conformidad_empaque_primario, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 11), item.uniforme_completo === 'Sí' ? 'C' : 'NC', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 12), item.transporte_adecuado === 'Refrigerado' ? 'C' : 'NC', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 13), item.puntualidad === 'Puntual' ? 'C' : 'NC', true);
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

/**
 * Generar formulario de Recepción de Frutas y Verduras
 */
const generarFormularioRecepcionFrutasVerduras = async (datos = null, mes = null, anio = null) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Recepción Frutas y Verduras');
  
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
      aplicarEstiloCelda(worksheet.getCell(fila, 2), formatearFechaParaExcel(item.fecha));
      aplicarEstiloCelda(worksheet.getCell(fila, 3), item.hora);
      aplicarEstiloCelda(worksheet.getCell(fila, 4), item.nombre_proveedor);
      aplicarEstiloCelda(worksheet.getCell(fila, 5), item.nombre_producto);
      aplicarEstiloCelda(worksheet.getCell(fila, 6), item.peso_unidad_recibido);
      aplicarEstiloCelda(worksheet.getCell(fila, 7), item.unidad_medida);
      aplicarEstiloCelda(worksheet.getCell(fila, 8), item.estado_producto, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 9), item.conformidad_integridad_producto, true);
      aplicarEstiloCelda(worksheet.getCell(fila, 10), item.uniforme_completo === 'Sí' ? 'C' : 'NC', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 11), item.transporte_adecuado === 'Refrigerado' ? 'C' : 'NC', true);
      aplicarEstiloCelda(worksheet.getCell(fila, 12), item.puntualidad === 'Puntual' ? 'C' : 'NC', true);
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
// ENDPOINTS DE FORMULARIOS VACÍOS
// =====================================================

// Formulario vacío de Recepción de Abarrotes
router.get('/formulario-vacio/abarrotes/:mes/:anio', async (req, res) => {
  try {
    const { mes, anio } = req.params;
    const workbook = await generarFormularioRecepcionAbarrotes(null, mes, anio);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="formulario_abarrotes_${anio}_${mes.padStart(2, '0')}.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generando formulario de abarrotes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Formulario vacío de Recepción de Frutas y Verduras
router.get('/formulario-vacio/frutas-verduras/:mes/:anio', async (req, res) => {
  try {
    const { mes, anio } = req.params;
    const workbook = await generarFormularioRecepcionFrutasVerduras(null, mes, anio);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="formulario_frutas_verduras_${anio}_${mes.padStart(2, '0')}.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generando formulario de frutas y verduras:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// =====================================================
// ENDPOINTS DE REPORTES CON DATOS
// =====================================================

// Reporte de Recepción de Abarrotes con datos
router.get('/reporte/abarrotes/:mes/:anio', async (req, res) => {
  try {
    const { mes, anio } = req.params;
    
    console.log(`Generando reporte de abarrotes para ${mes}/${anio}`);
    
    // Consultar datos de abarrotes
    const query = `
      SELECT 
        crm.*,
        p.nombre_completo as nombre_proveedor,
        prod.nombre as nombre_producto,
        u1.nombre as responsable_registro_nombre,
        u2.nombre as responsable_supervision_nombre
      FROM control_recepcion_abarrotes crm
      LEFT JOIN proveedores p ON crm.proveedor_id = p.id
      LEFT JOIN productos prod ON crm.producto_id = prod.id
      LEFT JOIN usuarios u1 ON crm.responsable_registro_id = u1.id
      LEFT JOIN usuarios u2 ON crm.responsable_supervision_id = u2.id
      WHERE crm.mes = ?
        AND crm.anio = ?
      ORDER BY crm.fecha, crm.hora
    `;
    
    console.log('Ejecutando consulta SQL...');
    const datos = await db.all(query, [parseInt(mes), parseInt(anio)]);
    console.log(`Datos encontrados: ${datos ? datos.length : 0} registros`);
    
    console.log('Generando workbook...');
    const workbook = await generarFormularioRecepcionAbarrotes(datos || [], mes, anio);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_abarrotes_${anio}_${mes.padStart(2, '0')}.xlsx"`);
    
    console.log('Enviando archivo...');
    await workbook.xlsx.write(res);
    res.end();
    console.log('Reporte enviado exitosamente');
  } catch (error) {
    console.error('Error generando reporte de abarrotes:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Reporte de Recepción de Frutas y Verduras con datos
router.get('/reporte/frutas-verduras/:mes/:anio', async (req, res) => {
  try {
    const { mes, anio } = req.params;
    
    console.log(`Generando reporte de frutas y verduras para ${mes}/${anio}`);
    
    // Consultar datos de frutas y verduras
    const query = `
      SELECT 
        crm.*,
        p.nombre_completo as nombre_proveedor,
        prod.nombre as nombre_producto,
        u1.nombre as responsable_registro_nombre,
        u2.nombre as responsable_supervision_nombre
      FROM control_recepcion_frutas_verduras crm
      LEFT JOIN proveedores p ON crm.proveedor_id = p.id
      LEFT JOIN productos prod ON crm.producto_id = prod.id
      LEFT JOIN usuarios u1 ON crm.responsable_registro_id = u1.id
      LEFT JOIN usuarios u2 ON crm.responsable_supervision_id = u2.id
      WHERE crm.mes = ?
        AND crm.anio = ?
      ORDER BY crm.fecha, crm.hora
    `;
    
    console.log('Ejecutando consulta SQL...');
    const datos = await db.all(query, [parseInt(mes), parseInt(anio)]);
    console.log(`Datos encontrados: ${datos ? datos.length : 0} registros`);
    
    console.log('Generando workbook...');
    const workbook = await generarFormularioRecepcionFrutasVerduras(datos || [], mes, anio);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="reporte_frutas_verduras_${anio}_${mes.padStart(2, '0')}.xlsx"`);
    
    console.log('Enviando archivo...');
    await workbook.xlsx.write(res);
    res.end();
    console.log('Reporte de frutas y verduras enviado exitosamente');
  } catch (error) {
    console.error('Error generando reporte de frutas y verduras:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Endpoint de prueba simple
router.get('/test', (req, res) => {
  const peruDate = getCurrentPeruDate();
  res.json({ 
    success: true, 
    message: 'Endpoint de formularios-haccp funcionando correctamente',
    timestamp: peruDate.toISOString(),
    fecha_lima: formatDateForDisplay(peruDate),
    hora_lima: formatTimeForDB(peruDate),
    zona_horaria: PERU_TIMEZONE
  });
});

// Endpoint para verificar la estructura de la base de datos
router.get('/test-db', async (req, res) => {
  try {
    // Obtener todas las tablas
    const allTables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
    
    // Verificar tablas específicas requeridas
    const requiredTables = ['control_recepcion_abarrotes', 'control_recepcion_frutas_verduras', 'proveedores', 'productos', 'usuarios'];
    const tableInfo = {};
    
    for (const tableName of requiredTables) {
      try {
        const count = await db.get(`SELECT COUNT(*) as count FROM ${tableName}`);
        const structure = await db.all(`PRAGMA table_info(${tableName})`);
        tableInfo[tableName] = {
          exists: true,
          count: count.count,
          columns: structure.map(col => ({
            name: col.name,
            type: col.type,
            notnull: col.notnull,
            pk: col.pk
          }))
        };
      } catch (error) {
        tableInfo[tableName] = {
          exists: false,
          error: error.message
        };
      }
    }
    
    const peruDate = getCurrentPeruDate();
    res.json({
      success: true,
      allTables,
      requiredTables: tableInfo,
      timestamp: peruDate.toISOString(),
      fecha_lima: formatDateForDisplay(peruDate),
      zona_horaria: PERU_TIMEZONE
    });
  } catch (error) {
    console.error('Error verificando base de datos:', error);
    res.status(500).json({ error: 'Error verificando base de datos', details: error.message });
  }
});

module.exports = router;