import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Button, 
  TextField, 
  Grid, 
  Typography, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Divider, 
  Alert,
  Paper,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { es } from 'date-fns/locale';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const BookingForm = ({
  serviceId,
  serviceName,
  servicePrice,
  trainerId,
  trainerName,
  isVirtual,
  isPresential,
  duration,
  onSuccess,
  onCancel
}) => {
  const { token } = useAuth();
  const [scheduledDate, setScheduledDate] = useState(null);
  const [modality, setModality] = useState(isVirtual && isPresential ? '' : (isVirtual ? 'virtual' : 'presential'));
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!scheduledDate) {
      setError('Por favor, selecciona una fecha y hora para la sesión');
      return;
    }
    
    if (!modality) {
      setError('Por favor, selecciona la modalidad de la sesión');
      return;
    }
    
    if (modality === 'presential' && !location.trim()) {
      setError('Por favor, indica la ubicación para la sesión presencial');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const bookingData = {
        serviceId,
        trainerId,
        scheduledDate: scheduledDate.toISOString(),
        modality,
        location: modality === 'presential' ? location.trim() : null,
        notes: notes.trim()
      };
      
      await axios.post('http://localhost:5000/api/bookings', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true);
      setLoading(false);
      
      // Llamar a la función de éxito después de 2 segundos para dar tiempo a ver el mensaje
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
    } catch (err) {
      console.error('Error al realizar la reserva:', err);
      setError(err.response?.data?.message || 'Error al procesar tu reserva. Por favor, intenta de nuevo.');
      setLoading(false);
    }
  };

  // Calcular fecha mínima (hoy)
  const minDate = new Date();
  // Fechas máximas (60 días adelante)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);

  if (success) {
    return (
      <Alert severity="success" sx={{ my: 2 }}>
        ¡Tu reserva para "{serviceName}" ha sido registrada exitosamente! El entrenador revisará tu solicitud y podrás ver el estado en la sección "Mis Reservas".
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="subtitle1" gutterBottom>
        Estás reservando: <strong>{serviceName}</strong> con {trainerName}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <DateTimePicker
              label="Fecha y hora de la sesión"
              value={scheduledDate}
              onChange={setScheduledDate}
              disablePast
              minDate={minDate}
              maxDate={maxDate}
              views={['year', 'month', 'day', 'hours']}
              format="dd/MM/yyyy HH:mm"
              ampm={false}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  fullWidth: true,
                  required: true,
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          </LocalizationProvider>
          <Typography variant="caption" color="text.secondary">
            La duración de la sesión es de {duration} minutos
          </Typography>
        </Grid>
        
        {isVirtual && isPresential && (
          <Grid item xs={12}>
            <FormControl component="fieldset" required>
              <FormLabel id="modality-label">Modalidad de la sesión</FormLabel>
              <RadioGroup
                row
                aria-labelledby="modality-label"
                name="modality"
                value={modality}
                onChange={(e) => setModality(e.target.value)}
              >
                <FormControlLabel 
                  value="virtual" 
                  control={<Radio />} 
                  label="Virtual" 
                />
                <FormControlLabel 
                  value="presential" 
                  control={<Radio />} 
                  label="Presencial" 
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        )}
        
        {(modality === 'presential' || (!isVirtual && isPresential)) && (
          <Grid item xs={12}>
            <TextField
              label="Ubicación de la sesión"
              fullWidth
              variant="outlined"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="Dirección o lugar de encuentro específico"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <TextField
            label="Notas adicionales (opcional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Indica cualquier información relevante para el entrenador"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Resumen de la reserva
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">Precio del servicio:</Typography>
              <Typography variant="body2">${servicePrice}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="subtitle2">Total:</Typography>
              <Typography variant="subtitle2" color="primary">${servicePrice}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              * El pago se realizará después de que el entrenador acepte la reserva.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Procesando...' : 'Confirmar Reserva'}
        </Button>
      </Box>
    </Box>
  );
};

BookingForm.propTypes = {
  serviceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  serviceName: PropTypes.string.isRequired,
  servicePrice: PropTypes.number.isRequired,
  trainerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trainerName: PropTypes.string.isRequired,
  isVirtual: PropTypes.bool,
  isPresential: PropTypes.bool,
  duration: PropTypes.number,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func
};

BookingForm.defaultProps = {
  isVirtual: false,
  isPresential: true,
  duration: 60,
  onSuccess: () => {},
  onCancel: () => {}
};

export default BookingForm; 