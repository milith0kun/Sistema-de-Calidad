import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert
} from '@mui/material';
import {
  Clear as ClearIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';

/**
 * Componente de Firma Digital Simple
 * Permite a los usuarios crear una firma digital usando canvas
 */
const DigitalSignature = ({ 
  onSignatureChange, 
  value = null, 
  disabled = false,
  label = "Firma Digital",
  required = false,
  width = 400,
  height = 200
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [signatureData, setSignatureData] = useState(value);

  useEffect(() => {
    if (value && value !== signatureData) {
      setSignatureData(value);
      setHasSignature(true);
      loadSignatureToCanvas(value);
    }
  }, [value]);

  const loadSignatureToCanvas = (dataUrl) => {
    if (!dataUrl || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    
    img.src = dataUrl;
  };

  const startDrawing = (e) => {
    if (disabled) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || disabled) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    setHasSignature(true);
    
    // Convertir canvas a data URL
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureData(dataUrl);
    
    if (onSignatureChange) {
      onSignatureChange(dataUrl);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    setHasSignature(false);
    setSignatureData(null);
    
    if (onSignatureChange) {
      onSignatureChange(null);
    }
  };

  const openSignatureDialog = () => {
    setDialogOpen(true);
  };

  const closeSignatureDialog = () => {
    setDialogOpen(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureData(dataUrl);
    
    if (onSignatureChange) {
      onSignatureChange(dataUrl);
    }
    
    setDialogOpen(false);
  };

  // Configurar canvas cuando se abre el diálogo
  useEffect(() => {
    if (dialogOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Configurar canvas
      canvas.width = width;
      canvas.height = height;
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Cargar firma existente si la hay
      if (signatureData) {
        loadSignatureToCanvas(signatureData);
      }
    }
  }, [dialogOpen, width, height, signatureData]);

  return (
    <Box>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      
      {/* Vista previa de la firma */}
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          border: hasSignature ? '2px solid #4caf50' : '2px dashed #ccc',
          backgroundColor: hasSignature ? '#f8f9fa' : '#fafafa',
          cursor: disabled ? 'default' : 'pointer',
          minHeight: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={!disabled ? openSignatureDialog : undefined}
      >
        {hasSignature && signatureData ? (
          <Box sx={{ textAlign: 'center' }}>
            <img 
              src={signatureData} 
              alt="Firma digital" 
              style={{ 
                maxWidth: '200px', 
                maxHeight: '60px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }} 
            />
            <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
              <CheckIcon sx={{ fontSize: 16, mr: 0.5 }} />
              Firmado digitalmente
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <EditIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="body2">
              {disabled ? 'Sin firma' : 'Haga clic para firmar'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Botones de acción */}
      {!disabled && (
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={openSignatureDialog}
          >
            {hasSignature ? 'Editar Firma' : 'Firmar'}
          </Button>
          
          {hasSignature && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<ClearIcon />}
              onClick={clearSignature}
            >
              Limpiar
            </Button>
          )}
        </Box>
      )}

      {/* Diálogo de firma */}
      <Dialog 
        open={dialogOpen} 
        onClose={closeSignatureDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Firma Digital
          <IconButton
            onClick={closeSignatureDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Dibuje su firma en el área blanca usando el mouse o touch. 
            La firma será guardada como imagen digital.
          </Alert>
          
          <Box sx={{ textAlign: 'center' }}>
            <canvas
              ref={canvasRef}
              style={{
                border: '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'crosshair',
                backgroundColor: '#ffffff'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              // Touch events para dispositivos móviles
              onTouchStart={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousedown', {
                  clientX: touch.clientX,
                  clientY: touch.clientY
                });
                canvasRef.current.dispatchEvent(mouseEvent);
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const mouseEvent = new MouseEvent('mousemove', {
                  clientX: touch.clientX,
                  clientY: touch.clientY
                });
                canvasRef.current.dispatchEvent(mouseEvent);
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                const mouseEvent = new MouseEvent('mouseup', {});
                canvasRef.current.dispatchEvent(mouseEvent);
              }}
            />
          </Box>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<ClearIcon />}
              onClick={clearSignature}
              sx={{ mr: 1 }}
            >
              Limpiar
            </Button>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={closeSignatureDialog}>
            Cancelar
          </Button>
          <Button 
            onClick={saveSignature}
            variant="contained"
            disabled={!hasSignature}
            startIcon={<CheckIcon />}
          >
            Guardar Firma
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DigitalSignature;