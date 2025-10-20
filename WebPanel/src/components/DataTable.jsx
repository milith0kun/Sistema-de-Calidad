import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Typography,
  Button,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useState } from 'react';

/**
 * Componente de tabla profesional reutilizable para reportes HACCP
 */
const DataTable = ({
  title,
  subtitle,
  columns,
  data,
  onExport,
  onRefresh,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No hay registros para mostrar',
  loading = false,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtrar datos según término de búsqueda
  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Paginar datos filtrados
  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Renderizar celda según tipo de dato
  const renderCell = (value, column) => {
    if (column.type === 'chip') {
      const chipColor = column.getColor ? column.getColor(value) : 'default';
      return (
        <Chip
          label={value}
          size="small"
          color={chipColor}
          sx={{ fontWeight: 500, fontSize: '0.8125rem' }}
        />
      );
    }

    if (column.type === 'boolean') {
      return value ? '✓ Sí' : '✗ No';
    }

    if (column.render) {
      return column.render(value);
    }

    return value || '-';
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            {onRefresh && (
              <Tooltip title="Actualizar datos">
                <IconButton
                  onClick={onRefresh}
                  color="primary"
                  size="large"
                  sx={{
                    bgcolor: 'primary.light',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.main',
                    },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
            {onExport && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={onExport}
                disabled={data.length === 0 || loading}
                size="large"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                }}
              >
                Exportar Excel
              </Button>
            )}
          </Stack>
        </Box>

        {/* Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            borderRadius: 3,
          }}
        >
          <TextField
            fullWidth
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Paper>
      </Box>

      {/* Results Counter */}
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Mostrando <strong>{filteredData.length}</strong> de <strong>{data.length}</strong> registros
          {searchTerm && ` con el término "${searchTerm}"`}
        </Typography>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={2}
        className="custom-scrollbar"
        sx={{
          borderRadius: '12px',
          overflow: 'auto',
          maxHeight: '70vh',
          border: '1px solid rgba(0,0,0,0.05)',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f3f4',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '4px',
            border: '1px solid #f1f3f4',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{
                    fontWeight: 700,
                    bgcolor: 'grey.50',
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    py: 2,
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" color="text.secondary">
                    Cargando datos...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    {emptyMessage}
                  </Typography>
                  {searchTerm && (
                    <Button
                      size="small"
                      onClick={() => setSearchTerm('')}
                      sx={{ mt: 1 }}
                    >
                      Limpiar búsqueda
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    '&:last-child td': {
                      borderBottom: 0,
                    },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{
                        fontSize: '0.875rem',
                        py: 2,
                      }}
                    >
                      {renderCell(row[column.id], column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {!loading && filteredData.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count}`
            }
            sx={{
              '.MuiTablePagination-toolbar': {
                minHeight: 56,
              },
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default DataTable;
