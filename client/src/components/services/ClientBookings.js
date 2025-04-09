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
  Rating,
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
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
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

const ClientBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Estados para cancelar reserva
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  
  // Estados para reseñas
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Cargar reservas del cliente
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/bookings/my-bookings');
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar tus reservas. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchBookings();
  }, []);

  // Manejar expansión de detalles
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

  // Manejar diálogo de cancelación
  const handleOpenCancelDialog = (booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
    setCancelDialogOpen(true);
    setCancelError(null);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setSelectedBooking(null);
    setCancelReason('');
  };

  // Cancelar reserva
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      setCancelSubmitting(true);
      
      await axios.put(`http://localhost:5000/api/bookings/${selectedBooking.id}/status`, {
        status: 'cancelled',
        cancelReason: cancelReason
      });
      
      // Actualizar la lista local
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id ? { ...b, status: 'cancelled', cancelReason } : b
      ));
      
      setCancelSubmitting(false);
      setCancelDialogOpen(false);
    } catch (err) {
      setCancelError('Error al cancelar la reserva. Por favor, intenta de nuevo.');
      setCancelSubmitting(false);
      console.error(err);
    }
  };

  // Manejar diálogo de reseñas
  const handleOpenReviewDialog = (booking) => {
    setSelectedBooking(booking);
    setReviewComment('');
    setReviewRating(0);
    setReviewDialogOpen(true);
    setReviewError(null);
  };

  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setSelectedBooking(null);
    setReviewComment('');
    setReviewRating(0);
  };

  // Enviar reseña
  const handleSubmitReview = async () => {
    if (!selectedBooking || !reviewRating) {
      setReviewError('Por favor, ingresa al menos una calificación.');
      return;
    }
    
    try {
      setReviewSubmitting(true);
      
      await axios.post('http://localhost:5000/api/reviews', {
        bookingId: selectedBooking.id,
        rating: reviewRating,
        comment: reviewComment
      });
      
      // Actualizar la lista local para mostrar que ya tiene reseña
      setBookings(bookings.map(b => 
        b.id === selectedBooking.id ? { ...b, hasReview: true } : b
      ));
      
      setReviewSubmitting(false);
      setReviewDialogOpen(false);
    } catch (err) {
      setReviewError('Error al enviar la reseña. Por favor, intenta de nuevo.');
      setReviewSubmitting(false);
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
        No tienes reservas. Explora servicios para reservar entrenamiento.
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
                    <Box display="flex" alignItems="center" mt={1}>
                      <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="subtitle1" color="text.secondary">
                        Entrenador: {booking.trainer_first_name} {booking.trainer_last_name}
                      </Typography>
                    </Box>
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
                      {(booking.status === 'pending' || booking.status === 'accepted') && (
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          sx={{ mt: 1 }}
                          onClick={() => handleOpenCancelDialog(booking)}
                        >
                          Cancelar reserva
                        </Button>
                      )}
                      
                      {booking.status === 'completed' && !booking.hasReview && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small"
                          sx={{ mt: 1 }}
                          onClick={() => handleOpenReviewDialog(booking)}
                        >
                          Dejar reseña
                        </Button>
                      )}
                      
                      {booking.status === 'completed' && booking.hasReview && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Ya has dejado una reseña
                        </Typography>
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
                        <Typography variant="subtitle2" gutterBottom>Tus notas</Typography>
                        <Typography variant="body2" paragraph>{booking.notes}</Typography>
                      </>
                    )}
                    
                    {booking.cancelReason && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>Motivo de cancelación</Typography>
                        <Typography variant="body2" color="error.main" paragraph>
                          {booking.cancelReason}
                        </Typography>
                      </>
                    )}
                    
                    {/* Archivos compartidos - simulado */}
                    {(booking.status === 'accepted' || booking.status === 'completed') && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>Archivos compartidos</Typography>
                        {booking.files && booking.files.length > 0 ? (
                          booking.files.map((file, index) => (
                            <Box key={index} mb={1}>
                              <Typography variant="body2">
                                {file.name} - {file.description}
                              </Typography>
                              <Button size="small" variant="outlined" sx={{ mt: 0.5 }}>
                                Descargar
                              </Button>
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            El entrenador aún no ha compartido archivos.
                          </Typography>
                        )}
                      </>
                    )}
                    
                    {/* Información del entrenador */}
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Información del entrenador</Typography>
                    <Typography variant="body2">
                      Email: {booking.trainer_email || 'entrenador@ejemplo.com'}
                    </Typography>
                    <Typography variant="body2">
                      Teléfono: {booking.trainer_phone || '+54 9 11 1234-5678'}
                    </Typography>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo para cancelar reserva */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
      >
        <DialogTitle>Cancelar reserva</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            ¿Estás seguro que deseas cancelar tu reserva para "{selectedBooking?.service_title}" con {selectedBooking?.trainer_first_name} {selectedBooking?.trainer_last_name}?
          </DialogContentText>
          
          {cancelError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {cancelError}
            </Alert>
          )}
          
          <TextField
            margin="dense"
            id="reason"
            label="Motivo de cancelación (opcional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} disabled={cancelSubmitting}>
            Volver
          </Button>
          <Button 
            onClick={handleCancelBooking} 
            variant="contained"
            color="error"
            disabled={cancelSubmitting}
          >
            {cancelSubmitting ? 'Cancelando...' : 'Confirmar cancelación'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para dejar reseña */}
      <Dialog
        open={reviewDialogOpen}
        onClose={handleCloseReviewDialog}
      >
        <DialogTitle>Calificar servicio</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Comparte tu experiencia con "{selectedBooking?.service_title}" de {selectedBooking?.trainer_first_name} {selectedBooking?.trainer_last_name}.
          </DialogContentText>
          
          {reviewError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {reviewError}
            </Alert>
          )}
          
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Typography component="legend">Tu calificación</Typography>
            <Rating
              name="rating"
              value={reviewRating}
              onChange={(event, newValue) => {
                setReviewRating(newValue);
              }}
              size="large"
              precision={0.5}
            />
          </Box>
          
          <TextField
            margin="dense"
            id="comment"
            label="Tu comentario (opcional)"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog} disabled={reviewSubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitReview} 
            variant="contained"
            disabled={reviewSubmitting || reviewRating === 0}
            color="primary"
          >
            {reviewSubmitting ? 'Enviando...' : 'Enviar reseña'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientBookings; 