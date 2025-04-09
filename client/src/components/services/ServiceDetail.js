import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Avatar,
  Rating,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Stack,
  Tab,
  Tabs
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Category as CategoryIcon,
  CalendarMonth as CalendarIcon,
  Videocam as VideocamIcon,
  Person as PersonIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import BookingForm from '../bookings/BookingForm';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/services/${id}`);
        setService(response.data);
        
        // Fetch reviews for this service
        const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/service/${id}`);
        setReviews(reviewsResponse.data);
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los detalles del servicio. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchServiceDetails();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }
    
    if (user.role === 'trainer') {
      setError('Como entrenador, no puedes reservar servicios. Inicia sesión con una cuenta de cliente.');
      return;
    }
    
    setBookingDialogOpen(true);
  };

  const handleBookingSuccess = () => {
    setBookingDialogOpen(false);
    // Podríamos mostrar un mensaje de éxito o redirigir al usuario
  };

  const redirectToLogin = () => {
    setLoginDialogOpen(false);
    navigate('/login', { state: { from: `/services/${id}` } });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Container>
    );
  }

  if (!service) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">
          El servicio no se encuentra disponible o ha sido eliminado.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/services')}
          sx={{ mt: 2 }}
        >
          Volver a Servicios
        </Button>
      </Container>
    );
  }

  // Calcular estadísticas de reseñas
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Columna principal con detalles del servicio */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {/* Imagen del servicio */}
            <Box 
              sx={{ 
                height: 300, 
                width: '100%', 
                backgroundImage: `url(${service.image_url || '/static/images/service-placeholder.jpg'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}
            >
              {service.category_name && (
                <Chip
                  label={service.category_name}
                  color="primary"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    fontWeight: 'bold'
                  }}
                />
              )}
            </Box>

            {/* Contenido principal */}
            <Box p={3}>
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                {service.title}
              </Typography>

              <Box display="flex" alignItems="center" mb={2}>
                <Rating value={averageRating} precision={0.5} readOnly />
                <Typography variant="body2" ml={1} color="text.secondary">
                  {averageRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'})
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                sx={{ mb: 2 }}
                variant="fullWidth"
              >
                <Tab label="Detalles" />
                <Tab label="Reseñas" />
              </Tabs>

              <Box role="tabpanel" hidden={tabValue !== 0}>
                {tabValue === 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Descripción
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {service.description}
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                          <Typography variant="body1">
                            {service.duration_minutes} minutos por sesión
                          </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" mb={2}>
                          <CategoryIcon color="action" sx={{ mr: 1 }} />
                          <Typography variant="body1">
                            {service.category_name || 'Sin categoría'}
                          </Typography>
                        </Box>

                        {service.zones && service.zones.length > 0 && (
                          <Box display="flex" alignItems="flex-start" mb={2}>
                            <LocationOnIcon color="action" sx={{ mr: 1, mt: 0.5 }} />
                            <Box>
                              <Typography variant="body1" mb={0.5}>
                                Zonas disponibles:
                              </Typography>
                              <Box display="flex" flexWrap="wrap" gap={0.5}>
                                {service.zones.map((zone, index) => (
                                  <Chip key={index} label={zone} size="small" />
                                ))}
                              </Box>
                            </Box>
                          </Box>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Box display="flex" alignItems="center">
                            <Box mr={2} display="flex" alignItems="center">
                              {service.is_virtual && (
                                <>
                                  <VideocamIcon color="action" sx={{ mr: 0.5 }} />
                                  <Typography variant="body1">Virtual</Typography>
                                </>
                              )}
                            </Box>
                            <Box display="flex" alignItems="center">
                              {service.is_presential && (
                                <>
                                  <PersonIcon color="action" sx={{ mr: 0.5 }} />
                                  <Typography variant="body1">Presencial</Typography>
                                </>
                              )}
                            </Box>
                          </Box>
                        </Box>

                        {service.equipment && (
                          <Box mb={2}>
                            <Typography variant="body1" fontWeight="medium">
                              Equipamiento necesario:
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                              {service.equipment}
                            </Typography>
                          </Box>
                        )}

                        {service.requirements && (
                          <Box mb={2}>
                            <Typography variant="body1" fontWeight="medium">
                              Requisitos:
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                              {service.requirements}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </>
                )}
              </Box>

              <Box role="tabpanel" hidden={tabValue !== 1}>
                {tabValue === 1 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Reseñas ({totalReviews})
                    </Typography>
                    
                    {totalReviews > 0 ? (
                      <List>
                        {reviews.map((review) => (
                          <Box key={review.id} mb={2}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                <Box display="flex" alignItems="center">
                                  <Avatar 
                                    src={review.user_photo || undefined}
                                    alt={review.user_name}
                                    sx={{ mr: 2 }}
                                  >
                                    {review.user_name?.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                      {review.user_name || 'Usuario'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {review.created_at && format(new Date(review.created_at), 'PP', { locale: es })}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Rating value={review.rating} precision={0.5} readOnly size="small" />
                              </Box>
                              
                              <Typography variant="body1" paragraph>
                                {review.comment}
                              </Typography>
                              
                              {review.trainer_reply && (
                                <Box sx={{ mt: 2, ml: 2, pl: 2, borderLeft: '2px solid #e0e0e0' }}>
                                  <Typography variant="subtitle2" fontWeight="medium">
                                    Respuesta del entrenador:
                                  </Typography>
                                  <Typography variant="body2">
                                    {review.trainer_reply}
                                  </Typography>
                                </Box>
                              )}
                            </Paper>
                          </Box>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body1" color="text.secondary" textAlign="center" py={3}>
                        Este servicio aún no tiene reseñas.
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Columna lateral con reserva y entrenador */}
        <Grid item xs={12} md={4}>
          {/* Tarjeta de precio y reserva */}
          <Card elevation={3} sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h4" color="primary" fontWeight="bold" mb={2}>
                ${service.price}
              </Typography>
              
              <Button 
                variant="contained" 
                color="primary"
                fullWidth
                size="large"
                onClick={handleBookNow}
                sx={{ mb: 2 }}
              >
                Reservar Ahora
              </Button>
              
              <Typography variant="body2" color="text.secondary" textAlign="center">
                No se te cobrará hasta confirmar la reserva
              </Typography>
            </CardContent>
          </Card>

          {/* Tarjeta de información del entrenador */}
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Entrenador
              </Typography>
              
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar 
                  src={service.trainer_photo || undefined}
                  alt={service.trainer_name}
                  sx={{ width: 64, height: 64, mr: 2 }}
                >
                  {service.trainer_name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {service.trainer_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {service.trainer_specialization || 'Entrenador personal'}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" paragraph>
                {service.trainer_bio || 'Información del entrenador no disponible.'}
              </Typography>
              
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => navigate(`/trainers/${service.trainer_id}`)}
              >
                Ver Perfil del Entrenador
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Diálogo de reserva */}
      <Dialog 
        open={bookingDialogOpen} 
        onClose={() => setBookingDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Reservar Servicio
        </DialogTitle>
        <DialogContent>
          <BookingForm 
            serviceId={service.id} 
            serviceName={service.title}
            servicePrice={service.price}
            trainerId={service.trainer_id}
            trainerName={service.trainer_name}
            isVirtual={service.is_virtual}
            isPresential={service.is_presential}
            duration={service.duration_minutes}
            onSuccess={handleBookingSuccess}
            onCancel={() => setBookingDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo para iniciar sesión */}
      <Dialog
        open={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
      >
        <DialogTitle>
          Iniciar sesión requerido
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Para reservar este servicio, debes iniciar sesión con una cuenta de cliente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={redirectToLogin} 
            variant="contained" 
            color="primary"
          >
            Iniciar Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ServiceDetail; 