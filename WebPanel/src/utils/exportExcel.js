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
  
  // ============= CONFIGURACIÓN DE PÁGINA =============
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'landscape', // Horizontal para 16 columnas
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0, // Permitir múltiples páginas verticalmente
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    },
    printArea: 'A1:P21',
    showGridLines: false
  };
  
  // ============= CONFIGURACIÓN DE COLUMNAS =============
  // Anchos optimizados para A4 horizontal (16 columnas) - Mejorados para mejor visualización
  const anchos = [10, 8, 15, 15, 12, 8, 12, 12, 15, 10, 10, 10, 16, 18, 18, 18];
  anchos.forEach((ancho, i) => {
    worksheet.getColumn(i + 1).width = ancho;
  });

  // ============= TÍTULO PRINCIPAL =============
  worksheet.mergeCells('A1:P1');
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
  worksheet.mergeCells('A2:P2');
  const subtituloCell = worksheet.getCell('A2');
  subtituloCell.value = 'CONTROL DE CALIDAD DE RECEPCION DE MERCADERIA DE ABARROTES EN GENERAL';
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
  mesValueCell.font = { name: 'Arial', size: 10 };
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

  worksheet.mergeCells('I3:P3');
  const anioValueCell = worksheet.getCell('I3');
  anioValueCell.value = anio || '';
  anioValueCell.font = { name: 'Arial', size: 10 };
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
    'CANTIDAD\nSOLICITADA\nPESO O UNIDAD', 'C-NC',
    'VIGENCIA DE\nREGISTRO\nSANITARIO', 
    'FECHA DE\nVENCIMIENTO\nDEL PRODUCTO',
    'CONFORMIDAD E\nINTEGRIDAD DEL\nEMPAQUE PRIMARIO',
    'UNIFORME\nCOMPLETO', 
    'TRANSPORTE\nADECUADO', 
    'PUNTUALIDAD',
    'NOMBRE DEL\nRESPONSABLE\nDE REGISTRO',
    'OBSERVACIONES', 
    'ACCION\nCORRECTIVA',
    'NOMBRE DEL\nRESPONSABLE DE LA\nSUPERVISION'
  ];

  headers.forEach((header, index) => {
    const cell = worksheet.getCell(4, index + 1);
    cell.value = header;
    // Tamaño de fuente mejorado para mejor legibilidad
    const fontSize = index < 6 || index === 11 ? 9 : 10;
    cell.font = { name: 'Arial', size: fontSize, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  });

  // Altura mejorada para la fila de encabezados
  worksheet.getRow(4).height = 70;

  // ============= FILAS DE DATOS =============
  // 15 filas de datos (filas 5-19)
  for (let row = 5; row <= 19; row++) {
    // Altura mejorada para filas de datos
    worksheet.getRow(row).height = 30;
    
    for (let col = 1; col <= 16; col++) {
      const cell = worksheet.getCell(row, col);
      
      // Si hay datos, llenar la celda
      if (datos && datos[row - 5]) {
        const fila = datos[row - 5];
        switch (col) {
          case 1: 
            // Formatear fecha si existe
            if (fila.fecha) {
              try {
                // Si la fecha viene en formato dd/MM/yyyy, convertirla
                if (fila.fecha.includes('/')) {
                  const [day, month, year] = fila.fecha.split('/');
                  const fecha = new Date(year, month - 1, day);
                  cell.value = format(fecha, 'dd/MM/yyyy');
                } else {
                  // Si viene en formato ISO o similar
                  const fecha = new Date(fila.fecha);
                  cell.value = format(fecha, 'dd/MM/yyyy');
                }
              } catch (error) {
                // Si hay error, usar la fecha original
                cell.value = fila.fecha;
              }
            } else {
              cell.value = '';
            }
            break;
          case 2: cell.value = fila.hora || ''; break;
          case 3: cell.value = fila.nombre_proveedor || ''; break;
          case 4: cell.value = fila.nombre_producto || ''; break;
          case 5: 
            // Formatear cantidad solicitada con peso/unidad recibido
            const cantidad = fila.cantidad_solicitada || '';
            const peso = fila.peso_unidad_recibido || '';
            const unidad = fila.unidad_medida || '';
            if (cantidad) {
              cell.value = `${cantidad}`;
            } else if (peso && unidad) {
              cell.value = `${peso} ${unidad}`;
            } else {
              cell.value = peso || unidad || '';
            }
            break;
          case 6: 
            // Columna C-NC - campo no disponible en formulario web actual
            cell.value = '';
            break;
          case 7: cell.value = fila.registro_sanitario_vigente || ''; break;
          case 8: cell.value = fila.fecha_vencimiento_producto || ''; break;
          case 9: cell.value = fila.empaque_integro || ''; break;
          case 10: cell.value = fila.uniforme_completo || ''; break;
          case 11: cell.value = fila.transporte_adecuado || ''; break;
          case 12: cell.value = fila.puntualidad || ''; break;
          case 13: cell.value = fila.nombre_responsable_registro || ''; break;
          case 14: cell.value = fila.observaciones || ''; break;
          case 15: cell.value = fila.accion_correctiva || ''; break;
          case 16: cell.value = fila.nombre_responsable_supervision || ''; break;
        }
      }

      // Aplicar estilos mejorados
      cell.font = { name: 'Arial', size: 10 };
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

  // ============= FILA VACÍA PARA SEPARACIÓN =============
  worksheet.getRow(20).height = 15;
  for (let col = 1; col <= 16; col++) {
    const cell = worksheet.getCell(20, col);
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  }

  // ============= NOTAS AL PIE =============
  worksheet.mergeCells('A21:P21');
  const notaCell = worksheet.getCell('A21');
  notaCell.value = 'C = CONFORME: Todo está bien | NC = NO CONFORME: Hay un problema que necesita corrección';
  notaCell.font = { name: 'Arial', size: 9, bold: true };
  notaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  notaCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  return workbook;
};

// =====================================================
// FORMULARIO: RECEPCIÓN DE FRUTAS Y VERDURAS
// =====================================================

export const generarFormularioRecepcionFrutasVerduras = async (datos = null, mes = null, anio = null) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Control Frutas Verduras');
  
  // ============= CONFIGURACIÓN DE PÁGINA A4 HORIZONTAL =============
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: 'landscape',
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
    },
    printArea: 'A1:O21'
  };

  // ============= CONFIGURACIÓN DE COLUMNAS =============
  // Anchos optimizados para A4 horizontal (15 columnas) - Mejorados para mejor visualización
  const anchos = [10, 8, 15, 15, 12, 6, 12, 14, 10, 10, 10, 15, 16, 16, 16];
  anchos.forEach((ancho, i) => {
    worksheet.getColumn(i + 1).width = ancho;
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
  anioValueCell.font = { name: 'Arial', size: 10 };
  anioValueCell.alignment = { horizontal: 'left', vertical: 'middle' };
  anioValueCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // Completar la fila 3 con celdas vacías pero con bordes
  worksheet.mergeCells('M3:O3');
  const emptyCell = worksheet.getCell('M3');
  emptyCell.value = '';
  emptyCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= ENCABEZADOS DE COLUMNAS =============
  const headers = [
    'FECHA', 'HORA', 'NOMBRE DEL\nPROVEEDOR', 'NOMBRE DEL\nPRODUCTO',
    'CANTIDAD\nSOLICITADA\nPESO O UNIDAD', 'C-NC',
    'ESTADO DEL\nPRODUCTO', 
    'CONFORMIDAD E\nINTEGRIDAD DEL\nPRODUCTO',
    'UNIFORME\nCOMPLETO',
    'TRANSPORTE\nADECUADO', 
    'PUNTUALIDAD',
    'NOMBRE DEL\nRESPONSABLE DE\nREGISTRO',
    'OBSERVACIONES', 
    'ACCION\nCORRECTIVA',
    'NOMBRE DEL\nRESPONSABLE DE LA\nSUPERVISION'
  ];

  headers.forEach((header, index) => {
    const cell = worksheet.getCell(4, index + 1);
    cell.value = header;
    
    // Tamaño de fuente optimizado para mejor legibilidad
    const fontSize = (index < 6 || index === 10) ? 9 : 10;
    cell.font = { name: 'Arial', size: fontSize, bold: true };
    
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
  worksheet.getRow(4).height = 70;

  // ============= FILAS DE DATOS =============
  // 15 filas de datos (filas 5-19)
  for (let row = 5; row <= 19; row++) {
    // Altura estándar para filas de datos
    worksheet.getRow(row).height = 28;
    
    for (let col = 1; col <= 15; col++) {
      const cell = worksheet.getCell(row, col);
      
      // Si hay datos, llenar la celda
      if (datos && datos[row - 5]) {
        const fila = datos[row - 5];
        switch (col) {
          case 1: 
            // Formatear fecha si existe
            if (fila.fecha) {
              try {
                const fecha = new Date(fila.fecha);
                cell.value = format(fecha, 'dd/MM/yyyy');
              } catch {
                cell.value = fila.fecha;
              }
            } else {
              cell.value = '';
            }
            break;
          case 2: cell.value = fila.hora || ''; break;
          case 3: cell.value = fila.nombre_proveedor || ''; break;
          case 4: cell.value = fila.nombre_producto || ''; break;
          case 5: 
            // Cantidad solicitada con peso o unidad - Corregido para usar peso_unidad_recibido
            const cantidad = fila.cantidad_solicitada || '';
            const peso = fila.peso_unidad_recibido || '';
            const unidad = fila.unidad_medida || '';
            if (cantidad && peso && unidad) {
              cell.value = `${cantidad} ${unidad} - ${peso}`;
            } else if (cantidad && unidad) {
              cell.value = `${cantidad} ${unidad}`;
            } else if (peso) {
              cell.value = peso;
            } else {
              cell.value = '';
            }
            break;
          case 6: 
            // C-NC (Conforme/No Conforme) - Usar conformidad_integridad_producto como base
            const conformidad = fila.conformidad_integridad_producto || '';
            if (conformidad === 'Conforme') {
              cell.value = 'C';
            } else if (conformidad === 'No Conforme') {
              cell.value = 'NC';
            } else {
              cell.value = conformidad;
            }
            break;
          case 7: 
            // Estado del producto
            cell.value = fila.estado_producto || '';
            break;
          case 8: 
            // Conformidad e integridad del producto
            cell.value = fila.conformidad_integridad_producto || '';
            break;
          case 9: 
            // Uniforme completo
            cell.value = fila.uniforme_completo || '';
            break;
          case 10: 
            // Transporte adecuado
            cell.value = fila.transporte_adecuado || '';
            break;
          case 11: 
            // Puntualidad
            cell.value = fila.puntualidad || '';
            break;
          case 12: 
            // Nombre del responsable de registro - Corregido para usar responsable_registro_nombre
            cell.value = fila.responsable_registro_nombre || '';
            break;
          case 13: 
            // Observaciones
            cell.value = fila.observaciones || '';
            break;
          case 14: 
            // Acción correctiva
            cell.value = fila.accion_correctiva || '';
            break;
          case 15: 
            // Nombre del responsable de la supervisión - Corregido para usar responsable_supervision_nombre
            cell.value = fila.responsable_supervision_nombre || '';
            break;
        }
      }

      // Aplicar estilos con mejor visibilidad
      cell.font = { name: 'Arial', size: 10, bold: false, color: { argb: 'FF000000' } };
      
      // Centrar columnas específicas según el tipo de dato
      const columnasCentradas = [1, 2, 6, 9, 10, 11]; // Fecha, Hora, C-NC, Uniforme, Transporte, Puntualidad
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

  // ============= FILA VACÍA PARA SEPARACIÓN =============
  worksheet.getRow(20).height = 15;
  for (let col = 1; col <= 15; col++) {
    const cell = worksheet.getCell(20, col);
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };
  }

  // ============= NOTAS AL PIE =============
  worksheet.mergeCells('A21:O21');
  const notaCell = worksheet.getCell('A21');
  notaCell.value = 'C = CONFORME: Todo está bien | NC = NO CONFORME: Hay un problema que necesita corrección | F = FRESCO | R = REGULAR | M = MALO';
  notaCell.font = { name: 'Arial', size: 9, bold: true };
  notaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  notaCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  return workbook;
};

// =====================================================
// FORMULARIO: CONTROL DE COCCIÓN
// =====================================================

export const generarFormularioControlCoccion = async (datos = null, mes = null, anio = null) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Control Cocción');
  
  // ============= CONFIGURACIÓN DE COLUMNAS =============
  // Anchos exactos del script de Google Sheets para A4 vertical - Mejorados
  const columnWidths = [55, 70, 140, 85, 95, 95, 140, 125];
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
  worksheet.getRow(3).height = 50;

  // ============= FILAS DE DATOS (30 filas para A4 vertical) =============
  for (let row = 4; row <= 33; row++) {
    // Altura estándar para filas de datos
    worksheet.getRow(row).height = 22;
    
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
            case 6: cell.value = registro.tiempo_coccion_minutos || ''; break; // Corregido: tiempo_coccion_minutos en lugar de tiempo_coccion
            case 7: cell.value = registro.accion_correctiva || ''; break;
            case 8: cell.value = registro.responsable_nombre || ''; break; // Corregido: responsable_nombre en lugar de responsable
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
      left: 0.4,
      right: 0.4,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    },
    printArea: 'A1:I40'
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
  // Anchos optimizados para A4 horizontal - Mejorados
  const columnWidths = [60, 70, 125, 100, 100, 100, 85, 130, 110, 110];
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
  worksheet.getRow(3).height = 60;

  // ============= FILAS DE DATOS =============
  // 31 filas de datos (filas 4-34) para A4 horizontal
  for (let row = 4; row <= 34; row++) {
    // Altura estándar para filas de datos
    worksheet.getRow(row).height = 24;
    
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
          case 6: cell.value = fila.concentracion_producto || ''; break; // Corregido: concentracion_producto en lugar de concentracion_producto_quimico
          case 7: cell.value = fila.tiempo_desinfeccion_minutos || ''; break; // Corregido: tiempo_desinfeccion_minutos en lugar de tiempo_desinfeccion
          case 8: cell.value = fila.accion_correctiva || ''; break;
          case 9: cell.value = fila.supervisor_nombre || ''; break; // Corregido: supervisor_nombre en lugar de responsable
          case 10: cell.value = fila.supervisor_nombre || ''; break; // Corregido: supervisor_nombre en lugar de supervisor
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
    },
    printArea: 'A1:J36'
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
  // Anchos optimizados para A4 vertical (en unidades de Excel) - 7 columnas - Mejorados
  const columnWidths = [12, 10, 14, 28, 18, 25, 20];
  columnWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });

  // ============= FILA 1: TÍTULO ESPECÍFICO =============
  worksheet.mergeCells('A1:G1');
  const tituloCell = worksheet.getCell('A1');
  tituloCell.value = 'CONTROL DE LAVADO Y DESINFECCIÓN DE MANOS';
  tituloCell.font = { name: 'Arial', size: 14, bold: true };
  tituloCell.alignment = { horizontal: 'center', vertical: 'middle' };
  tituloCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } };
  tituloCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= FILA 2: ÁREA O ESTACIÓN =============
  worksheet.mergeCells('A2:G2');
  const areaCell = worksheet.getCell('A2');
  areaCell.value = 'ÁREA O ESTACIÓN: Cocina y Salón';
  areaCell.font = { name: 'Arial', size: 12, bold: true };
  areaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  areaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
  areaCell.border = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  };

  // ============= FILA 3: MES Y AÑO =============
  worksheet.mergeCells('A3:D3');
  const mesCell = worksheet.getCell('A3');
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const nombreMes = mes ? meses[mes - 1] : '';
  mesCell.value = `MES: ${nombreMes}`;
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
  worksheet.mergeCells('E3:G3');
  const anioCell = worksheet.getCell('E3');
  anioCell.value = `AÑO: ${anio || ''}`;
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
    'FECHA', 'HORA', 'TURNO', 'NOMBRES Y APELLIDO', 'FIRMA', 'ACCIÓN CORRECTIVA', 'SUPERVISOR'
  ];

  headers.forEach((header, index) => {
    const cell = worksheet.getCell(4, index + 1);
    cell.value = header;
    cell.font = { name: 'Arial', size: 9, bold: true };
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
  worksheet.getRow(4).height = 45;

  // ============= FILAS DE DATOS =============
  // 33 filas de datos (filas 5-37) para A4 vertical
  for (let row = 5; row <= 37; row++) {
    for (let col = 1; col <= 7; col++) {
      const cell = worksheet.getCell(row, col);
      
      // Si hay datos, llenar la celda
      if (datos && datos[row - 5]) {
        const fila = datos[row - 5];
        switch (col) {
          case 1: 
            cell.value = fila.fecha ? format(new Date(fila.fecha), 'dd/MM/yyyy') : '';
            break;
          case 2: cell.value = fila.hora || ''; break;
          case 3: cell.value = fila.turno || ''; break;
          case 4: cell.value = fila.empleado_nombre || ''; break;
          case 5: 
            // Campo firma debe estar vacío para permitir firma manual del personal
            cell.value = '';
            break;
          case 6: cell.value = fila.accion_correctiva || ''; break;
          case 7: cell.value = fila.supervisor_nombre || ''; break;
        }
      }

      // Aplicar estilos
      cell.font = { name: 'Arial', size: 8 };
      // Centrar columnas específicas (sin área o estación)
      const columnasCentradas = [1, 2, 3, 5];
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
    
    // Altura de las filas de datos - optimizada para A4
    worksheet.getRow(row).height = 22;
  }

  // ============= LEYENDA =============
  worksheet.mergeCells('A39:G39');
  const leyendaCell = worksheet.getCell('A39');
  leyendaCell.value = 'NOTA: Registrar el cumplimiento del procedimiento de lavado y desinfección de manos del personal';
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
    },
    printArea: 'A1:G39'
  };

  // ============= SIN PROTECCIÓN DE HOJA =============
  // Excel no estará protegido para permitir edición libre

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
  worksheet.getRow(5).height = 45;
  worksheet.getRow(6).height = 40;

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
        // Crear fecha sin problemas de zona horaria
        const fechaParts = item.fecha.split('-');
        const fechaItem = new Date(fechaParts[0], fechaParts[1] - 1, fechaParts[2]);
        
        const mesActual = mes || (new Date().getMonth() + 1);
        const anioActual = anio || new Date().getFullYear();
        
        return fechaItem.getDate() === dia && 
               (fechaItem.getMonth() + 1) === mesActual && 
               fechaItem.getFullYear() === anioActual;
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
    respMananaCell.value = diaData?.responsable_manana_nombre || '';
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
    respTardeCell.value = diaData?.responsable_tarde_nombre || '';
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

    // Altura de las filas de datos - optimizada para A4
    worksheet.getRow(row).height = 24;
  }

  // ============= LEYENDA =============
  worksheet.mergeCells('A39:I39');
  const leyendaCell = worksheet.getCell('A39');
  leyendaCell.value = 'C = CONFORME: Temperatura correcta | NC = NO CONFORME: Temperatura fuera de rango';
  leyendaCell.font = { name: 'Arial', size: 8, bold: true };
  leyendaCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // ============= CONFIGURACIÓN DE COLUMNAS =============
  // Anchos para A4 horizontal: [55, 75, 60, 140, 75, 60, 140, 130, 110]
  const columnWidths = [55, 75, 60, 140, 75, 60, 140, 130, 110];
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
    },
    printArea: 'A1:I39'
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
  const datosCamara1 = datos ? datos.filter(item => item.camara_id === 1) : null;
  const datosCamara2 = datos ? datos.filter(item => item.camara_id === 2) : null;
  const datosCamara3 = datos ? datos.filter(item => item.camara_id === 3) : null;

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
 * Descargar archivo Excel con manejo mejorado de errores
 */
const descargarExcel = async (workbook, nombreArchivo) => {
  try {
    // Generar buffer del archivo Excel
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Verificar que el buffer no esté vacío
    if (!buffer || buffer.byteLength === 0) {
      throw new Error('El archivo Excel generado está vacío');
    }
    
    // Crear blob con el tipo MIME correcto
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Verificar que el blob se creó correctamente
    if (blob.size === 0) {
      throw new Error('Error al crear el archivo para descarga');
    }
    
    // Usar la API moderna de descarga si está disponible
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      // Para Internet Explorer
      window.navigator.msSaveOrOpenBlob(blob, nombreArchivo);
    } else {
      // Para navegadores modernos - crear URL temporal y elemento de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Configurar el enlace de descarga con atributos de seguridad
      link.style.display = 'none';
      link.href = url;
      link.download = nombreArchivo;
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('target', '_self');
      
      // Agregar al DOM, hacer clic y limpiar inmediatamente
      document.body.appendChild(link);
      link.click();
      
      // Limpiar inmediatamente para evitar problemas de seguridad
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    
    console.log(`Archivo Excel descargado exitosamente: ${nombreArchivo}`);
    
  } catch (error) {
    console.error('Error al descargar archivo Excel:', error);
    throw new Error(`Error al descargar archivo Excel: ${error.message}`);
  }
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

export const exportarRecepcionMercaderia = async (datos, mes, anio) => {
  // Usar siempre el formato unificado de frutas y verduras
  return await exportarRecepcionFrutasVerduras(datos, mes, anio);
};
export const exportarAsistencias = async (datos, mes, anio) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Asistencias');
    
    // Configurar columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Empleado', key: 'empleado', width: 25 },
      { header: 'Hora Entrada', key: 'horaEntrada', width: 12 },
      { header: 'Hora Salida', key: 'horaSalida', width: 12 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Observaciones', key: 'observaciones', width: 30 }
    ];
    
    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };
    
    // Agregar datos
    datos.forEach(registro => {
      worksheet.addRow({
        fecha: format(new Date(registro.fecha), 'dd/MM/yyyy'),
        empleado: registro.empleado_nombre || registro.nombre,
        horaEntrada: registro.hora_entrada,
        horaSalida: registro.hora_salida,
        estado: registro.estado,
        observaciones: registro.observaciones || ''
      });
    });
    
    // Aplicar bordes a todas las celdas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });
    
    // Descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Asistencias_${mes || 'Mes'}_${anio || 'Año'}.xlsx`;
    link.click();
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar asistencias:', error);
    throw error;
  }
};
export const exportarResumenNC = async (datos, mes, anio) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resumen No Conformidades');
    
    // Configurar columnas
    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Tipo Control', key: 'tipoControl', width: 20 },
      { header: 'Descripción', key: 'descripcion', width: 35 },
      { header: 'Severidad', key: 'severidad', width: 12 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Responsable', key: 'responsable', width: 20 },
      { header: 'Acción Correctiva', key: 'accionCorrectiva', width: 35 }
    ];
    
    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFF6B6B' }
    };
    
    // Agregar datos
    datos.forEach(nc => {
      worksheet.addRow({
        fecha: format(new Date(nc.fecha), 'dd/MM/yyyy'),
        tipoControl: nc.tipo_control || nc.tipoControl,
        descripcion: nc.descripcion,
        severidad: nc.severidad,
        estado: nc.estado,
        responsable: nc.responsable_nombre || nc.responsable,
        accionCorrectiva: nc.accion_correctiva || nc.accionCorrectiva || ''
      });
    });
    
    // Aplicar bordes a todas las celdas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Colorear según severidad
        if (rowNumber > 1) {
          const severidad = row.getCell(4).value;
          if (severidad === 'ALTA' || severidad === 'CRÍTICA') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFEAA7' }
            };
          } else if (severidad === 'MEDIA') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFEAA7' }
            };
          }
        }
      });
    });
    
    // Descargar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Resumen_No_Conformidades_${mes || 'Mes'}_${anio || 'Año'}.xlsx`;
    link.click();
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar resumen de no conformidades:', error);
    throw error;
  }
};
