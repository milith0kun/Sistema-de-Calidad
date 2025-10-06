import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/index.js';

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
 * Formato exacto según script de Google Sheets
 */
export const generarFormularioRecepcionAbarrotes = async (datos = null, mes = null, anio = null) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Control Abarrotes');
  
  // ============= CONFIGURACIÓN DE COLUMNAS =============
  // Anchos exactos según el script para A4 horizontal
  const anchos = [70, 60, 100, 100, 85, 45, 75, 75, 75, 70, 70, 70, 110, 120, 110];
  anchos.forEach((ancho, i) => {
    worksheet.getColumn(i + 1).width = ancho / 7; // Convertir a unidades Excel
  });

  // ============= TÍTULO PRINCIPAL =============
  worksheet.mergeCells('A1:O1');
  const tituloCell = worksheet.getCell('A1');
  tituloCell.value = 'REGISTRO HACCP';
  tituloCell.font = { name: 'Arial', size: 14, bold: true };
  tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
  tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  tituloCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= SUBTÍTULO =============
  worksheet.mergeCells('A2:O2');
  const subtituloCell = worksheet.getCell('A2');
  subtituloCell.value = 'CONTROL DE CALIDAD DE RECEPCIÓN DE MERCADERÍA DE ABARROTES EN GENERAL';
  subtituloCell.font = { name: 'Arial', size: 14, bold: true };
  subtituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
  subtituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  subtituloCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= MES Y AÑO =============
  // MES
  worksheet.mergeCells('A3:B3');
  const mesLabelCell = worksheet.getCell('A3');
  mesLabelCell.value = 'MES:';
  mesLabelCell.font = { name: 'Arial', size: 10, bold: true };
  mesLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  mesLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  mesLabelCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  worksheet.mergeCells('C3:F3');
  const mesValueCell = worksheet.getCell('C3');
  mesValueCell.value = mes || '';
  mesValueCell.font = { name: 'Arial', size: 9 };
  mesValueCell.alignment = { horizontal: 'left', vertical: 'middle' };
  mesValueCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // AÑO
  worksheet.mergeCells('G3:H3');
  const anioLabelCell = worksheet.getCell('G3');
  anioLabelCell.value = 'AÑO:';
  anioLabelCell.font = { name: 'Arial', size: 10, bold: true };
  anioLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  anioLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  anioLabelCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  worksheet.mergeCells('I3:L3');
  const anioValueCell = worksheet.getCell('I3');
  anioValueCell.value = anio || '';
  anioValueCell.font = { name: 'Arial', size: 9 };
  anioValueCell.alignment = { horizontal: 'left', vertical: 'middle' };
  anioValueCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= ENCABEZADOS DE COLUMNAS =============
  const headers = [
    'FECHA', 'HORA', 'NOMBRE DEL\nPROVEEDOR', 'NOMBRE DEL\nPRODUCTO',
    'CANTIDAD\nSOLICITADA\nPESO O UNIDAD', 'C/NC',
    'VIGENCIA\nREGISTRO\nSANITARIO', 
    'FECHA\nVENCIMIENTO\nPRODUCTO',
    'CONFORMIDAD\nEMPAQUE',
    'UNIFORME\nCOMPLETO', 
    'TRANSPORTE\nADECUADO', 
    'PUNTUALIDAD',
    'RESPONSABLE\nREGISTRO',
    'OBSERVACIONES', 
    'ACCIÓN\nCORRECTIVA'
  ];

  headers.forEach((header, index) => {
    const cell = worksheet.getCell(4, index + 1);
    cell.value = header;
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Altura especial para la fila de encabezados
  worksheet.getRow(4).height = 55;

  // ============= FILAS DE DATOS =============
  // 15 filas de datos (filas 5-19)
  for (let row = 5; row <= 19; row++) {
    for (let col = 1; col <= 15; col++) {
      const cell = worksheet.getCell(row, col);
      
      // Si hay datos, llenar la celda
      if (datos && datos[row - 5]) {
        const fila = datos[row - 5];
        switch (col) {
          case 1: cell.value = fila.fecha || ''; break;
          case 2: cell.value = fila.hora || ''; break;
          case 3: cell.value = fila.proveedor || ''; break;
          case 4: cell.value = fila.producto || ''; break;
          case 5: cell.value = fila.cantidad || ''; break;
          case 6: cell.value = fila.conforme || ''; break;
          case 7: cell.value = fila.registro_sanitario || ''; break;
          case 8: cell.value = fila.vencimiento || ''; break;
          case 9: cell.value = fila.empaque || ''; break;
          case 10: cell.value = fila.uniforme || ''; break;
          case 11: cell.value = fila.transporte || ''; break;
          case 12: cell.value = fila.puntualidad || ''; break;
          case 13: cell.value = fila.responsable || ''; break;
          case 14: cell.value = fila.observaciones || ''; break;
          case 15: cell.value = fila.accion_correctiva || ''; break;
        }
      }

      // Aplicar estilos
      cell.font = { name: 'Arial', size: 9 };
      // Centrar columnas específicas según el script
      const columnasCentradas = [1, 2, 6, 10, 11, 12];
      cell.alignment = { 
        horizontal: columnasCentradas.includes(col) ? 'center' : 'left', 
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    }
  }

  // ============= NOTAS AL PIE =============
  worksheet.mergeCells('A21:O21');
  const notaCell = worksheet.getCell('A21');
  notaCell.value = 'C = CONFORME: Todo está bien | NC = NO CONFORME: Hay un problema que necesita corrección';
  notaCell.font = { name: 'Arial', size: 8, bold: true };
  notaCell.alignment = { horizontal: 'center', vertical: 'middle' };

  return workbook;
};

// =====================================================
// FORMULARIO: RECEPCIÓN DE FRUTAS Y VERDURAS
// =====================================================

export const generarFormularioRecepcionFrutasVerduras = async (datos = null, mes = null, anio = null) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Control Frutas Verduras');
  
  // ============= CONFIGURACIÓN DE COLUMNAS =============
  // Anchos exactos según el script para A4 horizontal
  const anchos = [70, 60, 100, 100, 85, 45, 75, 75, 75, 70, 70, 70, 110, 120, 110];
  anchos.forEach((ancho, i) => {
    worksheet.getColumn(i + 1).width = ancho / 7; // Convertir a unidades Excel
  });

  // ============= TÍTULO PRINCIPAL =============
  worksheet.mergeCells('A1:O1');
  const tituloCell = worksheet.getCell('A1');
  tituloCell.value = 'REGISTRO HACCP';
  tituloCell.font = { name: 'Arial', size: 14, bold: true };
  tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
  tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  tituloCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= SUBTÍTULO =============
  worksheet.mergeCells('A2:O2');
  const subtituloCell = worksheet.getCell('A2');
  subtituloCell.value = 'CONTROL DE CALIDAD DE RECEPCIÓN DE MERCADERÍA DE FRUTAS Y VERDURAS';
  subtituloCell.font = { name: 'Arial', size: 14, bold: true };
  subtituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
  subtituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  subtituloCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= MES Y AÑO =============
  // MES
  worksheet.mergeCells('A3:B3');
  const mesLabelCell = worksheet.getCell('A3');
  mesLabelCell.value = 'MES:';
  mesLabelCell.font = { name: 'Arial', size: 10, bold: true };
  mesLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  mesLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  mesLabelCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  worksheet.mergeCells('C3:F3');
  const mesValueCell = worksheet.getCell('C3');
  mesValueCell.value = mes || '';
  mesValueCell.font = { name: 'Arial', size: 9 };
  mesValueCell.alignment = { horizontal: 'left', vertical: 'middle' };
  mesValueCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // AÑO
  worksheet.mergeCells('G3:H3');
  const anioLabelCell = worksheet.getCell('G3');
  anioLabelCell.value = 'AÑO:';
  anioLabelCell.font = { name: 'Arial', size: 10, bold: true };
  anioLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  anioLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  anioLabelCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  worksheet.mergeCells('I3:L3');
  const anioValueCell = worksheet.getCell('I3');
  anioValueCell.value = anio || '';
  anioValueCell.font = { name: 'Arial', size: 9 };
  anioValueCell.alignment = { horizontal: 'left', vertical: 'middle' };
  anioValueCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= ENCABEZADOS DE COLUMNAS =============
  const headers = [
    'FECHA', 'HORA', 'NOMBRE DEL\nPROVEEDOR', 'NOMBRE DEL\nPRODUCTO',
    'PESO O UNIDAD\nRECIBIDO', 'C/NC',
    'ESTADO DEL\nPRODUCTO\n(F/R/M)', 
    'CONFORMIDAD\nINTEGRIDAD\nPRODUCTO',
    'UNIFORME\nCOMPLETO',
    'TRANSPORTE\nADECUADO', 
    'PUNTUALIDAD',
    'RESPONSABLE\nREGISTRO',
    'RESPONSABLE\nSUPERVISIÓN',
    'OBSERVACIONES', 
    'ACCIÓN\nCORRECTIVA'
  ];

  headers.forEach((header, index) => {
    const cell = worksheet.getCell(4, index + 1);
    cell.value = header;
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Altura especial para la fila de encabezados
  worksheet.getRow(4).height = 55;

  // ============= FILAS DE DATOS =============
  // 15 filas de datos (filas 5-19)
  for (let row = 5; row <= 19; row++) {
    for (let col = 1; col <= 15; col++) {
      const cell = worksheet.getCell(row, col);
      
      // Si hay datos, llenar la celda
      if (datos && datos[row - 5]) {
        const fila = datos[row - 5];
        switch (col) {
          case 1: cell.value = fila.fecha || ''; break;
          case 2: cell.value = fila.hora || ''; break;
          case 3: cell.value = fila.proveedor || ''; break;
          case 4: cell.value = fila.producto || ''; break;
          case 5: cell.value = fila.peso_unidad || ''; break;
          case 6: cell.value = fila.conforme || ''; break;
          case 7: cell.value = fila.estado_producto || ''; break;
          case 8: cell.value = fila.integridad || ''; break;
          case 9: cell.value = fila.uniforme || ''; break;
          case 10: cell.value = fila.transporte || ''; break;
          case 11: cell.value = fila.puntualidad || ''; break;
          case 12: cell.value = fila.responsable_registro || ''; break;
          case 13: cell.value = fila.responsable_supervision || ''; break;
          case 14: cell.value = fila.observaciones || ''; break;
          case 15: cell.value = fila.accion_correctiva || ''; break;
        }
      }

      // Aplicar estilos
      cell.font = { name: 'Arial', size: 9 };
      // Centrar columnas específicas según el script
      const columnasCentradas = [1, 2, 6, 7, 8, 9, 10, 11];
      cell.alignment = { 
        horizontal: columnasCentradas.includes(col) ? 'center' : 'left', 
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    }
  }

  // ============= NOTAS AL PIE =============
  worksheet.mergeCells('A21:O21');
  const notaCell = worksheet.getCell('A21');
  notaCell.value = 'C = CONFORME: Todo está bien | NC = NO CONFORME: Hay un problema que necesita corrección | F = FRESCO | R = REGULAR | M = MALO';
  notaCell.font = { name: 'Arial', size: 8, bold: true };
  notaCell.alignment = { horizontal: 'center', vertical: 'middle' };

  return workbook;
};

// =====================================================
// FORMULARIO: CONTROL DE COCCIÓN
// =====================================================

export const generarFormularioControlCoccion = async (datos = null, mes = null, anio = null) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Control Cocción');
  
  // ============= CONFIGURACIÓN DE COLUMNAS =============
  // Anchos exactos del script de Google Sheets para A4 vertical
  const columnWidths = [50, 65, 130, 75, 85, 85, 130, 115];
  columnWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width / 7; // Conversión a unidades Excel
  });

  // ============= FILA 1: TÍTULO PRINCIPAL =============
  worksheet.mergeCells('A1:G1');
  const tituloCell = worksheet.getCell('A1');
  tituloCell.value = 'Control de Cocción';
  tituloCell.font = { name: 'Arial', size: 14, bold: true };
  tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
  tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  tituloCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= CELDA H1: VERSIÓN =============
  const versionCell = worksheet.getCell('H1');
  versionCell.value = 'Versión: 01';
  versionCell.font = { name: 'Arial', size: 9 };
  versionCell.alignment = { horizontal: 'right', vertical: 'middle' };
  versionCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= FILA 2: MES Y AÑO =============
  // MES
  worksheet.mergeCells('A2:C2');
  const mesLabelCell = worksheet.getCell('A2');
  mesLabelCell.value = 'MES:';
  mesLabelCell.font = { name: 'Arial', size: 10, bold: true };
  mesLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  mesLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  mesLabelCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  const mesValueCell = worksheet.getCell('D2');
  mesValueCell.value = mes || '';
  mesValueCell.font = { name: 'Arial', size: 9 };
  mesValueCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  mesValueCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // AÑO
  worksheet.mergeCells('E2:F2');
  const anioLabelCell = worksheet.getCell('E2');
  anioLabelCell.value = 'AÑO:';
  anioLabelCell.font = { name: 'Arial', size: 10, bold: true };
  anioLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  anioLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  anioLabelCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  worksheet.mergeCells('G2:H2');
  const anioValueCell = worksheet.getCell('G2');
  anioValueCell.value = anio || '';
  anioValueCell.font = { name: 'Arial', size: 9 };
  anioValueCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  anioValueCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= FILA 3: ENCABEZADOS DE COLUMNAS =============
  const headers = [
    'Día', 'Hora', 'Producto a\ncocinar', 'Proceso de\ncocción',
    'Temperatura de\ncocción (°C)', 'Tiempo de cocción\n(minutos)',
    'Acción correctiva', 'Responsable'
  ];

  headers.forEach((header, index) => {
    const cell = worksheet.getCell(3, index + 1);
    cell.value = header;
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Ajustar altura de la fila de encabezados
  worksheet.getRow(3).height = 40;

  // ============= FILAS DE DATOS (30 filas para A4 vertical) =============
  for (let row = 4; row <= 33; row++) {
    for (let col = 1; col <= 8; col++) {
      const cell = worksheet.getCell(row, col);
      
      // Aplicar datos si existen
      if (datos && datos.length > 0) {
        const dataIndex = row - 4;
        if (dataIndex < datos.length) {
          const registro = datos[dataIndex];
          switch (col) {
            case 1: cell.value = registro.dia || ''; break;
            case 2: cell.value = registro.hora || ''; break;
            case 3: cell.value = registro.producto_cocinar || ''; break;
            case 4: cell.value = registro.proceso_coccion || ''; break;
            case 5: cell.value = registro.temperatura_coccion || ''; break;
            case 6: cell.value = registro.tiempo_coccion || ''; break;
            case 7: cell.value = registro.accion_correctiva || ''; break;
            case 8: cell.value = registro.responsable || ''; break;
          }
        }
      }

      // Aplicar estilos
      cell.font = { name: 'Arial', size: 9 };
      cell.alignment = { 
        horizontal: [1,2,4,5,6].includes(col) ? 'center' : 'left', 
        vertical: 'middle', 
        wrapText: true 
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    }
  }

  // ============= NOTA PROCESO (FILA 35) =============
  worksheet.mergeCells('A35:H35');
  const procesoCell = worksheet.getCell('A35');
  procesoCell.value = 'PROCESO:    H=Horno    P=Plancha    C=Cocina';
  procesoCell.font = { name: 'Arial', size: 9, bold: true };
  procesoCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // ============= CRITERIO DE COCCIÓN (FILAS 37-38) =============
  worksheet.mergeCells('A37:H38');
  const criterioCell = worksheet.getCell('A37');
  criterioCell.value = 'Criterio de cocción: Temperatura debe ser mayor a 80°C por 15 segundos en la parte central del producto cocido, con énfasis en carne de cerdo y aves.';
  criterioCell.font = { name: 'Arial', size: 8 };
  criterioCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };

  // ============= ACCIÓN CORRECTIVA (FILAS 40-41) =============
  worksheet.mergeCells('A40:H41');
  const accionCell = worksheet.getCell('A40');
  accionCell.value = 'Acción correctiva: Si el producto no llega a la temperatura adecuada, el cocinero incrementa el tiempo de cocción hasta que cumpla lo requerido.';
  accionCell.font = { name: 'Arial', size: 8 };
  accionCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };

  // ============= CONFIGURACIÓN DE IMPRESIÓN =============
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'portrait', // Vertical
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    }
  };

  // ============= PROTECCIÓN DE HOJA =============
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

export const generarFormularioLavadoFrutas = async (datos = null, mes = null, anio = null, productoQuimico = null, concentracion = null) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Lavado Frutas-Verduras');
  
  // ============= CONFIGURACIÓN DE COLUMNAS =============
  // Anchos optimizados para A4 horizontal
  const columnWidths = [55, 65, 115, 90, 90, 90, 75, 120, 100, 100];
  columnWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width / 7; // Conversión aproximada a unidades de Excel
  });

  // ============= FILA 1: TÍTULO PRINCIPAL =============
  worksheet.mergeCells('A1:I1');
  const tituloCell = worksheet.getCell('A1');
  tituloCell.value = 'CONTROL DE LAVADO Y DESINFECCIÓN DE FRUTAS Y VERDURAS';
  tituloCell.font = { name: 'Arial', size: 14, bold: true };
  tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
  tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  tituloCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= CELDA J1: VERSIÓN =============
  const versionCell = worksheet.getCell('J1');
  versionCell.value = 'Versión: 01';
  versionCell.font = { name: 'Arial', size: 9 };
  versionCell.alignment = { horizontal: 'right', vertical: 'middle' };
  versionCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= FILA 2: MES, PRODUCTO QUÍMICO, AÑO =============
  // MES
  const mesLabelCell = worksheet.getCell('A2');
  mesLabelCell.value = 'Mes:';
  mesLabelCell.font = { name: 'Arial', size: 10, bold: true };
  mesLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  mesLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  mesLabelCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  worksheet.mergeCells('B2:C2');
  const mesValueCell = worksheet.getCell('B2');
  mesValueCell.value = mes || '';
  mesValueCell.font = { name: 'Arial', size: 9 };
  mesValueCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  mesValueCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // PRODUCTO QUÍMICO
  worksheet.mergeCells('D2:E2');
  const productoLabelCell = worksheet.getCell('D2');
  productoLabelCell.value = 'Producto químico:';
  productoLabelCell.font = { name: 'Arial', size: 10, bold: true };
  productoLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  productoLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  productoLabelCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  worksheet.mergeCells('F2:G2');
  const productoValueCell = worksheet.getCell('F2');
  productoValueCell.value = productoQuimico || '';
  productoValueCell.font = { name: 'Arial', size: 9 };
  productoValueCell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
  productoValueCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // AÑO
  const anioCell = worksheet.getCell('H2');
  anioCell.value = `Año: ${anio || ''}`;
  anioCell.font = { name: 'Arial', size: 10, bold: true };
  anioCell.alignment = { horizontal: 'center', vertical: 'middle' };
  anioCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
  anioCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  worksheet.mergeCells('I2:J2');
  const concentracionCell = worksheet.getCell('I2');
  concentracionCell.value = `Concentración: ${concentracion || ''}`;
  concentracionCell.font = { name: 'Arial', size: 10, bold: true };
  concentracionCell.alignment = { horizontal: 'center', vertical: 'middle' };
  concentracionCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
  concentracionCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= ENCABEZADOS DE COLUMNAS =============
  const headers = [
    'Día', 'Hora', 'Nombre\nFruta/Verdura',
    'Lavado con\nAgua potable\n(C/NC)',
    'Desinfección\nproducto químico\n(C/NC)',
    'Concentración\nproducto químico\n(C/NC)',
    'Tiempo de\ndesinfección\n(minutos)',
    'Acción\nCorrectiva',
    'Responsable',
    'Supervisor'
  ];

  headers.forEach((header, index) => {
    const cell = worksheet.getCell(3, index + 1);
    cell.value = header;
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Altura especial para la fila de encabezados
  worksheet.getRow(3).height = 50;

  // ============= FILAS DE DATOS =============
  // 31 filas de datos (filas 4-34) para A4 horizontal
  for (let row = 4; row <= 34; row++) {
    for (let col = 1; col <= 10; col++) {
      const cell = worksheet.getCell(row, col);
      
      // Si hay datos, llenar la celda
      if (datos && datos[row - 4]) {
        const fila = datos[row - 4];
        switch (col) {
          case 1: cell.value = fila.dia || ''; break;
          case 2: cell.value = fila.hora || ''; break;
          case 3: cell.value = fila.nombre_fruta_verdura || ''; break;
          case 4: cell.value = fila.lavado_agua_potable || ''; break;
          case 5: cell.value = fila.desinfeccion_producto_quimico || ''; break;
          case 6: cell.value = fila.concentracion_producto_quimico || ''; break;
          case 7: cell.value = fila.tiempo_desinfeccion || ''; break;
          case 8: cell.value = fila.accion_correctiva || ''; break;
          case 9: cell.value = fila.responsable || ''; break;
          case 10: cell.value = fila.supervisor || ''; break;
        }
      }

      // Aplicar estilos
      cell.font = { name: 'Arial', size: 9 };
      // Centrar columnas específicas
      const columnasCentradas = [1, 2, 4, 5, 6, 7];
      cell.alignment = { 
        horizontal: columnasCentradas.includes(col) ? 'center' : 'left', 
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    }
  }

  // ============= LEYENDA =============
  worksheet.mergeCells('A36:J36');
  const leyendaCell = worksheet.getCell('A36');
  leyendaCell.value = 'C = CONFORME | NC = NO CONFORME';
  leyendaCell.font = { name: 'Arial', size: 8, bold: true };
  leyendaCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // ============= CONFIGURACIÓN DE IMPRESIÓN =============
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'landscape', // Horizontal
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    }
  };

  // ============= PROTECCIÓN DE HOJA =============
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
  
  // ============= CONFIGURACIÓN DE COLUMNAS =============
  // Anchos optimizados para A4 vertical (en unidades de Excel)
  const columnWidths = [8, 8, 12, 20, 15, 10, 18, 15];
  columnWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });

  // ============= FILA 1: REGISTRO HACCP =============
  worksheet.mergeCells('A1:H1');
  const registroCell = worksheet.getCell('A1');
  registroCell.value = 'REGISTRO HACCP';
  registroCell.font = { name: 'Arial', size: 14, bold: true };
  registroCell.alignment = { horizontal: 'center', vertical: 'middle' };
  registroCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  registroCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= FILA 2: TÍTULO ESPECÍFICO =============
  worksheet.mergeCells('A2:H2');
  const tituloCell = worksheet.getCell('A2');
  tituloCell.value = 'Control de Lavado y Desinfección de Manos';
  tituloCell.font = { name: 'Arial', size: 12, bold: true };
  tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
  tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } };
  tituloCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= FILA 3: ÁREA O ESTACIÓN =============
  worksheet.mergeCells('A3:H3');
  const areaCell = worksheet.getCell('A3');
  areaCell.value = 'Área o Estación: Cocina y Salón';
  areaCell.font = { name: 'Arial', size: 10, bold: true };
  areaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  areaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F0F0' } };
  areaCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= FILA 4: MES =============
  worksheet.mergeCells('A4:D4');
  const mesCell = worksheet.getCell('A4');
  mesCell.value = `Mes: ${mes || ''}`;
  mesCell.font = { name: 'Arial', size: 10, bold: true };
  mesCell.alignment = { horizontal: 'center', vertical: 'middle' };
  mesCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
  mesCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // AÑO
  worksheet.mergeCells('E4:H4');
  const anioCell = worksheet.getCell('E4');
  anioCell.value = `Año: ${anio || ''}`;
  anioCell.font = { name: 'Arial', size: 10, bold: true };
  anioCell.alignment = { horizontal: 'center', vertical: 'middle' };
  anioCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
  anioCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= ENCABEZADOS DE COLUMNAS =============
  const headers = [
    'FECHA', 'HORA', 'TURNO', 'NOMBRES Y APELLIDO', 'FIRMA', 'C/NC', 'ACCIÓN CORRECTIVA', 'SUPERVISOR'
  ];

  headers.forEach((header, index) => {
    const cell = worksheet.getCell(5, index + 1);
    cell.value = header;
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Altura de la fila de encabezados
  worksheet.getRow(5).height = 35;

  // ============= FILAS DE DATOS =============
  // 31 filas de datos (filas 6-36) para A4 vertical
  for (let row = 6; row <= 36; row++) {
    for (let col = 1; col <= 8; col++) {
      const cell = worksheet.getCell(row, col);
      
      // Si hay datos, llenar la celda
      if (datos && datos[row - 6]) {
        const fila = datos[row - 6];
        switch (col) {
          case 1: 
            cell.value = fila.fecha ? format(new Date(fila.fecha), 'dd/MM/yyyy') : '';
            break;
          case 2: cell.value = fila.hora || ''; break;
          case 3: cell.value = fila.turno || ''; break;
          case 4: cell.value = fila.empleado_nombre || ''; break;
          case 5: cell.value = fila.firma || ''; break;
          case 6: 
            cell.value = fila.procedimiento_correcto === 'Sí' ? 'C' : (fila.procedimiento_correcto === 'No' ? 'NC' : '');
            break;
          case 7: cell.value = fila.accion_correctiva || ''; break;
          case 8: cell.value = fila.supervisor_nombre || ''; break;
        }
      }

      // Aplicar estilos
      cell.font = { name: 'Arial', size: 9 };
      // Centrar columnas específicas
      const columnasCentradas = [1, 2, 3, 5, 6];
      cell.alignment = { 
        horizontal: columnasCentradas.includes(col) ? 'center' : 'left', 
        vertical: 'middle',
        wrapText: true
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    }
  }

  // ============= LEYENDA =============
  worksheet.mergeCells('A38:H38');
  const leyendaCell = worksheet.getCell('A38');
  leyendaCell.value = 'C = CONFORME: Procedimiento correcto | NC = NO CONFORME: Procedimiento incompleto, requiere repetir';
  leyendaCell.font = { name: 'Arial', size: 8, bold: true };
  leyendaCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // ============= CONFIGURACIÓN DE IMPRESIÓN =============
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'portrait', // Vertical
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    }
  };

  // ============= PROTECCIÓN DE HOJA =============
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

// Función auxiliar para crear una hoja de temperatura
const crearHojaTemperatura = (workbook, nombreHoja, titulo, rango, frecuencia, datos = null, mes = null, anio = null) => {
  const worksheet = workbook.addWorksheet(nombreHoja);
  configurarEstilosBase(worksheet);

  // ============= FILA 1: REGISTRO HACCP =============
  worksheet.mergeCells('A1:I1');
  const registroCell = worksheet.getCell('A1');
  registroCell.value = 'REGISTRO HACCP';
  registroCell.font = { name: 'Arial', size: 14, bold: true };
  registroCell.alignment = { horizontal: 'center', vertical: 'middle' };
  registroCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  registroCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= FILA 2: TÍTULO ESPECÍFICO =============
  worksheet.mergeCells('A2:I2');
  const tituloCell = worksheet.getCell('A2');
  tituloCell.value = titulo;
  tituloCell.font = { name: 'Arial', size: 12, bold: true };
  tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
  tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  tituloCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= FILA 3: MES Y AÑO =============
  // MES
  worksheet.mergeCells('A3:B3');
  const mesLabelCell = worksheet.getCell('A3');
  mesLabelCell.value = 'MES:';
  mesLabelCell.font = { name: 'Arial', size: 10, bold: true };
  mesLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  mesLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  mesLabelCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  worksheet.mergeCells('C3:D3');
  const mesValueCell = worksheet.getCell('C3');
  mesValueCell.value = mes || '';
  mesValueCell.font = { name: 'Arial', size: 9 };
  mesValueCell.alignment = { horizontal: 'left', vertical: 'middle' };
  mesValueCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // AÑO
  worksheet.mergeCells('E3:F3');
  const anioLabelCell = worksheet.getCell('E3');
  anioLabelCell.value = 'AÑO:';
  anioLabelCell.font = { name: 'Arial', size: 10, bold: true };
  anioLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  anioLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  anioLabelCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  worksheet.mergeCells('G3:I3');
  const anioValueCell = worksheet.getCell('G3');
  anioValueCell.value = anio || '';
  anioValueCell.font = { name: 'Arial', size: 9 };
  anioValueCell.alignment = { horizontal: 'left', vertical: 'middle' };
  anioValueCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= FILA 4: FRECUENCIA Y RANGO =============
  worksheet.mergeCells('A4:I4');
  const frecuenciaCell = worksheet.getCell('A4');
  frecuenciaCell.value = `Frecuencia: ${frecuencia} | Rango: ${rango}`;
  frecuenciaCell.font = { name: 'Arial', size: 9, bold: true };
  frecuenciaCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // ============= FILA 5: ENCABEZADOS PRINCIPALES =============
  const diaCell = worksheet.getCell('A5');
  diaCell.value = 'DÍA';
  diaCell.font = { name: 'Arial', size: 10, bold: true };
  diaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  diaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  diaCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  worksheet.mergeCells('B5:D5');
  const mananaCell = worksheet.getCell('B5');
  mananaCell.value = 'TURNO MAÑANA (08:00)';
  mananaCell.font = { name: 'Arial', size: 10, bold: true };
  mananaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  mananaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  mananaCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  worksheet.mergeCells('E5:G5');
  const tardeCell = worksheet.getCell('E5');
  tardeCell.value = 'TURNO TARDE (16:00)';
  tardeCell.font = { name: 'Arial', size: 10, bold: true };
  tardeCell.alignment = { horizontal: 'center', vertical: 'middle' };
  tardeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  tardeCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  const accionesCell = worksheet.getCell('H5');
  accionesCell.value = 'ACCIONES\nCORRECTIVAS';
  accionesCell.font = { name: 'Arial', size: 10, bold: true };
  accionesCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  accionesCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  accionesCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  const supervisorCell = worksheet.getCell('I5');
  supervisorCell.value = 'SUPERVISOR';
  supervisorCell.font = { name: 'Arial', size: 10, bold: true };
  supervisorCell.alignment = { horizontal: 'center', vertical: 'middle' };
  supervisorCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
  supervisorCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= FILA 6: SUB-ENCABEZADOS =============
  const subHeaders = ['', 'Temp (°C)', 'C/NC', 'Responsable', 'Temp (°C)', 'C/NC', 'Responsable', '', ''];
  subHeaders.forEach((header, index) => {
    const cell = worksheet.getCell(6, index + 1);
    cell.value = header;
    cell.font = { name: 'Arial', size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Altura de las filas de encabezados
  worksheet.getRow(5).height = 35;
  worksheet.getRow(6).height = 30;

  // ============= FILAS DE DATOS (31 DÍAS) =============
  for (let dia = 1; dia <= 31; dia++) {
    const row = 6 + dia;
    
    // DÍA
    const diaDataCell = worksheet.getCell(row, 1);
    diaDataCell.value = dia;
    diaDataCell.font = { name: 'Arial', size: 9 };
    diaDataCell.alignment = { horizontal: 'center', vertical: 'middle' };
    diaDataCell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    // Llenar datos si existen
    let diaData = null;
    if (datos && Array.isArray(datos)) {
      diaData = datos.find(item => {
        const fecha = new Date(item.fecha);
        return fecha.getDate() === dia;
      });
    }

    // TURNO MAÑANA - Temp (°C)
    const tempMananaCell = worksheet.getCell(row, 2);
    tempMananaCell.value = diaData?.temperatura_manana || '';
    tempMananaCell.font = { name: 'Arial', size: 9 };
    tempMananaCell.alignment = { horizontal: 'center', vertical: 'middle' };
    tempMananaCell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    // TURNO MAÑANA - C/NC
    const confMananaCell = worksheet.getCell(row, 3);
    confMananaCell.value = diaData?.conformidad_manana || '';
    confMananaCell.font = { name: 'Arial', size: 9 };
    confMananaCell.alignment = { horizontal: 'center', vertical: 'middle' };
    confMananaCell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    // TURNO MAÑANA - Responsable
    const respMananaCell = worksheet.getCell(row, 4);
    respMananaCell.value = diaData?.responsable_manana || '';
    respMananaCell.font = { name: 'Arial', size: 9 };
    respMananaCell.alignment = { horizontal: 'left', vertical: 'middle' };
    respMananaCell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    // TURNO TARDE - Temp (°C)
    const tempTardeCell = worksheet.getCell(row, 5);
    tempTardeCell.value = diaData?.temperatura_tarde || '';
    tempTardeCell.font = { name: 'Arial', size: 9 };
    tempTardeCell.alignment = { horizontal: 'center', vertical: 'middle' };
    tempTardeCell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    // TURNO TARDE - C/NC
    const confTardeCell = worksheet.getCell(row, 6);
    confTardeCell.value = diaData?.conformidad_tarde || '';
    confTardeCell.font = { name: 'Arial', size: 9 };
    confTardeCell.alignment = { horizontal: 'center', vertical: 'middle' };
    confTardeCell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    // TURNO TARDE - Responsable
    const respTardeCell = worksheet.getCell(row, 7);
    respTardeCell.value = diaData?.responsable_tarde || '';
    respTardeCell.font = { name: 'Arial', size: 9 };
    respTardeCell.alignment = { horizontal: 'left', vertical: 'middle' };
    respTardeCell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    // ACCIONES CORRECTIVAS
    const accionesDataCell = worksheet.getCell(row, 8);
    accionesDataCell.value = diaData?.acciones_correctivas || '';
    accionesDataCell.font = { name: 'Arial', size: 9 };
    accionesDataCell.alignment = { horizontal: 'left', vertical: 'middle' };
    accionesDataCell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    // SUPERVISOR
    const supervisorDataCell = worksheet.getCell(row, 9);
    supervisorDataCell.value = diaData?.supervisor_nombre || '';
    supervisorDataCell.font = { name: 'Arial', size: 9 };
    supervisorDataCell.alignment = { horizontal: 'left', vertical: 'middle' };
    supervisorDataCell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  }

  // ============= LEYENDA =============
  worksheet.mergeCells('A39:I39');
  const leyendaCell = worksheet.getCell('A39');
  leyendaCell.value = 'C = CONFORME: Temperatura correcta | NC = NO CONFORME: Temperatura fuera de rango';
  leyendaCell.font = { name: 'Arial', size: 8, bold: true };
  leyendaCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // ============= CONFIGURACIÓN DE COLUMNAS =============
  // Anchos para A4 horizontal: [50, 70, 55, 130, 70, 55, 130, 120, 100]
  const columnWidths = [50, 70, 55, 130, 70, 55, 130, 120, 100];
  columnWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width / 7; // Conversión aproximada a unidades de Excel
  });

  // ============= CONFIGURACIÓN DE IMPRESIÓN =============
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'landscape', // Horizontal
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    }
  };

  // ============= PROTECCIÓN DE HOJA =============
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

  return worksheet;
};

export const generarFormularioTemperaturaCamaras = async (datos = null, mes = null, anio = null) => {
  const workbook = new ExcelJS.Workbook();

  // Filtrar datos por cámara si existen
  const datosCamara1 = datos ? datos.filter(item => item.camara_nombre === 'Cámara 1' || item.camara_id === 1) : null;
  const datosCamara2 = datos ? datos.filter(item => item.camara_nombre === 'Cámara 2' || item.camara_id === 2) : null;
  const datosCamara3 = datos ? datos.filter(item => item.camara_nombre === 'Cámara 3' || item.camara_id === 3) : null;

  // CÁMARA 1 - REFRIGERACIÓN
  crearHojaTemperatura(
    workbook,
    'Temp Refrigeración 1',
    'CONTROL DE TEMPERATURA DE REFRIGERACIÓN - CÁMARA 1',
    '1°C a 4°C',
    'Todos los días, dos veces al día',
    datosCamara1,
    mes,
    anio
  );

  // CÁMARA 2 - REFRIGERACIÓN
  crearHojaTemperatura(
    workbook,
    'Temp Refrigeración 2',
    'CONTROL DE TEMPERATURA DE REFRIGERACIÓN - CÁMARA 2',
    '1°C a 4°C',
    'Todos los días, dos veces al día',
    datosCamara2,
    mes,
    anio
  );

  // CÁMARA 3 - CONGELACIÓN
  crearHojaTemperatura(
    workbook,
    'Temp Congelación 1',
    'CONTROL DE TEMPERATURA DE CONGELACIÓN - CÁMARA 1',
    '< -18°C',
    'Todos los días, dos veces al día',
    datosCamara3,
    mes,
    anio
  );

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
export const exportarFormularioVacioAbarrotes = async (mes = null, anio = null) => {
  try {
    const workbook = await generarFormularioRecepcionAbarrotes(null, mes, anio);
    const buffer = await workbook.xlsx.writeBuffer();
    
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HACCP_Control_Abarrotes_${mes || 'Mes'}_${anio || 'Año'}.xlsx`;
    link.click();
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar formulario de abarrotes:', error);
    throw error;
  }
};

/**
 * Exportar formulario con datos de Recepción de Abarrotes
 */
export const exportarRecepcionAbarrotes = async (datos, mes = null, anio = null) => {
  try {
    const workbook = await generarFormularioRecepcionAbarrotes(datos, mes, anio);
    const buffer = await workbook.xlsx.writeBuffer();
    
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HACCP_Control_Abarrotes_Datos_${mes || 'Mes'}_${anio || 'Año'}.xlsx`;
    link.click();
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar datos de abarrotes:', error);
    throw error;
  }
};

/**
 * Exportar formulario vacío de Recepción de Frutas y Verduras
 */
export const exportarFormularioVacioFrutasVerduras = async (mes = null, anio = null) => {
  try {
    const workbook = await generarFormularioRecepcionFrutasVerduras(null, mes, anio);
    const buffer = await workbook.xlsx.writeBuffer();
    
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HACCP_Control_Frutas_Verduras_${mes || 'Mes'}_${anio || 'Año'}.xlsx`;
    link.click();
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar formulario de frutas y verduras:', error);
    throw error;
  }
};

/**
 * Exportar formulario con datos de Recepción de Frutas y Verduras
 */
export const exportarRecepcionFrutasVerduras = async (datos, mes = null, anio = null) => {
  try {
    const workbook = await generarFormularioRecepcionFrutasVerduras(datos, mes, anio);
    const buffer = await workbook.xlsx.writeBuffer();
    
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HACCP_Control_Frutas_Verduras_Datos_${mes || 'Mes'}_${anio || 'Año'}.xlsx`;
    link.click();
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar datos de frutas y verduras:', error);
    throw error;
  }
};

/**
 * Exportar formulario vacío de Control de Cocción
 */
export const exportarFormularioVacioCoccion = async (mes = null, anio = null) => {
  try {
    const workbook = await generarFormularioControlCoccion(null, mes, anio);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HACCP_Control_Coccion_${mes || 'Mes'}_${anio || 'Año'}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar formulario vacío de cocción:', error);
    throw error;
  }
};

/**
 * Exportar formulario con datos de Control de Cocción
 */
export const exportarControlCoccion = async (datos, mes = null, anio = null) => {
  try {
    const workbook = await generarFormularioControlCoccion(datos, mes, anio);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HACCP_Control_Coccion_Datos_${mes || 'Mes'}_${anio || 'Año'}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar control de cocción:', error);
    throw error;
  }
};

/**
 * Exportar formulario vacío de Lavado de Frutas
 */
export const exportarFormularioVacioLavadoFrutas = async (mes = null, anio = null, productoQuimico = null, concentracion = null) => {
  try {
    const workbook = await generarFormularioLavadoFrutas(null, mes, anio, productoQuimico, concentracion);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HACCP_Lavado_Frutas_Verduras_${mes || 'Mes'}_${anio || 'Año'}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar formulario vacío de lavado de frutas:', error);
    throw error;
  }
};

/**
 * Exportar formulario con datos de Lavado de Frutas
 */
export const exportarLavadoFrutas = async (datos, mes = null, anio = null, productoQuimico = null, concentracion = null) => {
  try {
    const workbook = await generarFormularioLavadoFrutas(datos, mes, anio, productoQuimico, concentracion);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HACCP_Lavado_Frutas_Verduras_Datos_${mes || 'Mes'}_${anio || 'Año'}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar lavado de frutas:', error);
    throw error;
  }
};

/**
 * Exportar formulario vacío de Lavado de Manos
 */
export const exportarFormularioVacioLavadoManos = async (mes, anio) => {
  try {
    const workbook = await generarFormularioLavadoManos(null, mes, anio);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HACCP_Lavado_Manos_${mes || 'MM'}_${anio || 'AAAA'}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar formulario vacío de lavado de manos:', error);
    throw error;
  }
};

/**
 * Exportar formulario con datos de Lavado de Manos
 */
export const exportarLavadoManos = async (datos, mes, anio) => {
  try {
    const workbook = await generarFormularioLavadoManos(datos, mes, anio);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HACCP_Lavado_Manos_Datos_${mes || 'MM'}_${anio || 'AAAA'}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar datos de lavado de manos:', error);
    throw error;
  }
};

/**
 * Exportar formulario vacío de Temperatura de Cámaras
 */
export const exportarFormularioVacioTemperaturaCamaras = async (mes, anio) => {
  try {
    const workbook = await generarFormularioTemperaturaCamaras(null, mes, anio);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HACCP_Control_Temperatura_Camaras_${anio}_${mes.toString().padStart(2, '0')}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar formulario vacío de temperatura de cámaras:', error);
    throw error;
  }
};

/**
 * Exportar formulario con datos de Temperatura de Cámaras
 */
export const exportarTemperaturaCamaras = async (datos, mes, anio) => {
  try {
    const workbook = await generarFormularioTemperaturaCamaras(datos, mes, anio);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HACCP_Control_Temperatura_Camaras_Datos_${anio}_${mes.toString().padStart(2, '0')}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar datos de temperatura de cámaras:', error);
    throw error;
  }
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
