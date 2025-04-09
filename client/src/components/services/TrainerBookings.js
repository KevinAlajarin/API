import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Collapse,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachFile as AttachIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Componente para el estado de reserva
const BookingStatusChip = ({ status }) => {
  let color = 'default';
  let label = 'Desconocido';
  
  switch (status) {
    case 'pending':
      color = 'warning';
      label = 'Pendiente';
      break;
    case 'accepted':
      color = 'primary';
      label = 'Aceptado';
      break;
    case 'completed':
      color = 'success';
      label = 'Completado';
      break;
    case 'cancelled':
      color = 'error';
      label = 'Cancelado';
      break;
    case 'rejected':
      color = 'error';
      label = 'Rechazado';
      break;
    default:
      break;
  }
  
  return <Chip size="small" color={color} label={label} />;
};

const TrainerBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados para actualizar estado
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState(null);
  
  // Estados para compartir archivos
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [fileDescription, setFileDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileSubmitting, setFileSubmitting] = useState(false);
  const [fileError, setFileError] = useState(null);

  // Cargar reservas del entrenador
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/bookings/my-bookings');
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las reservas. Por favor, intente de nuevo más tarde.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchBookings();
  }, []);

  // Manejar expansión
  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Manejar cambio de tabs
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Filtrar reservas según la pestaña activa
  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 0) return true; // Todas
    if (activeTab === 1) return booking.status === 'pending'; // Pendientes
    if (activeTab === 2) return booking.status === 'accepted'; // Aceptadas
    if (activeTab === 3) return booking.status === 'completed'; // Completadas
    if (activeTab === 4) return ['cancelled', 'rejected'].includes(booking.status); // Canceladas/Rechazadas
    return true;
  });

  // Manejar diálogo de estado
  const handleOpenStatusDialog = (booking, initialStatus) => {
    setSelectedBooking(booking);
    setNewStatus(initialStatus || booking.status);
    setStatusDialogOpen(true);
    setStatusError(null);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedBooking(null);
    setNewStatus('');
  };

  // Actualizar estado de reserva
  const handleUpdateStatus = async () => {
    if (!selectedBooking || !newStatus) return;
    
    try {
      setStatusSubmitting(true);
      
      await axios.put(`http://localhost:5000/api/bookings/${selectedBooking.id}/status`, {
        status: newStatus
      });
      
      // Actualizar la lista local
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id ? { ...b, status: newStatus } : b
      ));
      
      setStatusSubmitting(false);
      setStatusDialogOpen(false);
    } catch (err) {
      setStatusError('Error al actualizar el estado. Por favor, intente de nuevo.');
      setStatusSubmitting(false);
      console.error(err);
    }
  };

  // Manejar diálogo de archivos (simulado)
  const handleOpenFileDialog = (booking) => {
    setSelectedBooking(booking);
    setFileDescription('');
    setSelectedFile(null);
    setFileDialogOpen(true);
    setFileError(null);
  };

  const handleCloseFileDialog = () => {
    setFileDialogOpen(false);
    setSelectedBooking(null);
    setFileDescription('');
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    // Simulado - en un entorno real, esto manejaría la carga de archivos
    setSelectedFile(e.target.files[0]);
  };

  const handleShareFile = async () => {
    if (!selectedBooking || !fileDescription) {
      setFileError('Por favor, complete todos los campos');
      return;
    }
    
    try {
      setFileSubmitting(true);
      
      // Simulado - en un entorno real, esto subiría el archivo al servidor
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular carga
      
      setFileSubmitting(false);
      setFileDialogOpen(false);
      
      // Mostrar mensaje de éxito (simulado)
      alert('Archivo compartido exitosamente');
    } catch (err) {
      setFileError('Error al compartir el archivo. Por favor, intente de nuevo.');
      setFileSubmitting(false);
      console.error(err);
    }
  };

  // Renderizar contenido
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (bookings.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No tienes reservas. Cuando los clientes contraten tus servicios, aparecerán aquí.
      </Alert>
    );
  }

  return (
    <Box>
      <Paper square sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Todas" />
          <Tab label="Pendientes" />
          <Tab label="Aceptadas" />
          <Tab label="Completadas" />
          <Tab label="Canceladas/Rechazadas" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {filteredBookings.map((booking) => (
          <Grid item xs={12} key={booking.id}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="h6">{booking.service_title}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Cliente: {booking.client_first_name} {booking.client_last_name}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {new Date(booking.scheduled_date).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mt={1}>
                      <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{booking.duration_minutes} minutos</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" flexDirection="column" alignItems={{ xs: 'flex-start', sm: 'flex-end' }}>
                      <BookingStatusChip status={booking.status} />
                      <Typography variant="h6" sx={{ mt: 1 }}>${booking.service_price}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.category_name}
                      </Typography>
                      
                      {/* Botones según estado */}
                      {booking.status === 'pending' && (
                        <Box mt={1}>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            size="small" 
                            sx={{ mr: 1 }}
                            onClick={() => handleOpenStatusDialog(booking, 'accepted')}
                          >
                            Aceptar
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => handleOpenStatusDialog(booking, 'rejected')}
                          >
                            Rechazar
                          </Button>
                        </Box>
                      )}
                      
                      {booking.status === 'accepted' && (
                        <Box mt={1}>
                          <Button 
                            variant="contained" 
                            color="primary" 
                            size="small" 
                            sx={{ mr: 1 }}
                            onClick={() => handleOpenStatusDialog(booking, 'completed')}
                          >
                            Marcar Completada
                          </Button>
                          <Button 
                            variant="outlined" 
                            startIcon={<AttachIcon />}
                            size="small"
                            onClick={() => handleOpenFileDialog(booking)}
                            sx={{ mt: { xs: 1, sm: 0 } }}
                          >
                            Compartir Archivo
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                  <Button
                    onClick={() => handleExpandClick(booking.id)}
                    endIcon={expandedId === booking.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    size="small"
                  >
                    {expandedId === booking.id ? 'Ocultar detalles' : 'Ver detalles'}
                  </Button>
                </Box>

                <Collapse in={expandedId === booking.id} timeout="auto" unmountOnExit>
                  <Box mt={2}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>Detalles del servicio</Typography>
                    <Typography variant="body2" paragraph>{booking.service_description}</Typography>
                    
                    {booking.notes && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>Notas del cliente</Typography>
                        <Typography variant="body2" paragraph>{booking.notes}</Typography>
                      </>
                    )}
                    
                    {/* Archivos compartidos - simulado */}
                    {(booking.status === 'accepted' || booking.status === 'completed') && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>Archivos compartidos</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {Math.random() > 0.5 ? 
                            "Aún no has compartido archivos con este cliente." : 
                            "Has compartido 2 archivos con este cliente."}
                        </Typography>
                      </>
                    )}
                    
                    {/* Información del cliente */}
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Información del cliente</Typography>
                    <Typography variant="body2">
                      Email: cliente@ejemplo.com
                    </Typography>
                    <Typography variant="body2">
                      Teléfono: +54 9 11 1234-5678
                    </Typography>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo para actualizar estado */}
      <Dialog
        open={statusDialogOpen}
        onClose={handleCloseStatusDialog}
      >
        <DialogTitle>Actualizar estado de la reserva</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Estás cambiando el estado de la reserva de {selectedBooking?.client_first_name} {selectedBooking?.client_last_name} para el servicio "{selectedBooking?.service_title}".
          </DialogContentText>
          
          {statusError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {statusError}
            </Alert>
          )}
          
          <TextField
            select
            fullWidth
            label="Nuevo estado"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            SelectProps={{
              native: true,
            }}
          >
            <option value="pending">Pendiente</option>
            <option value="accepted">Aceptada</option>
            <option value="completed">Completada</option>
            <option value="rejected">Rechazada</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} disabled={statusSubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained"
            disabled={statusSubmitting}
          >
            {statusSubmitting ? 'Actualizando...' : 'Actualizar estado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para compartir archivos */}
      <Dialog
        open={fileDialogOpen}
        onClose={handleCloseFileDialog}
      >
        <DialogTitle>Compartir archivo con el cliente</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Comparte archivos como programas de entrenamiento, rutinas o planes nutricionales con {selectedBooking?.client_first_name} {selectedBooking?.client_last_name}.
          </DialogContentText>
          
          {fileError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {fileError}
            </Alert>
          )}
          
          <TextField
            margin="dense"
            id="description"
            label="Descripción del archivo"
            fullWidth
            variant="outlined"
            value={fileDescription}
            onChange={(e) => setFileDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <input
            accept="application/pdf,application/msword,application/vnd.ms-excel"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button variant="outlined" component="span" fullWidth>
              {selectedFile ? selectedFile.name : 'Seleccionar archivo'}
            </Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFileDialog} disabled={fileSubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleShareFile} 
            variant="contained"
            disabled={fileSubmitting || !fileDescription}
          >
            {fileSubmitting ? 'Compartiendo...' : 'Compartir archivo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrainerBookings; 