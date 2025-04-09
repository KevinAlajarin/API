import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/services/${id}`);
        setService(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los detalles del servicio. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchServiceDetails();
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Lógica para reservar el servicio
    alert('Reserva en desarrollo');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      </Container>
    );
  }

  if (!service) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">El servicio no existe o ha sido eliminado.</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/')}
        >
          Volver al inicio
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Button 
          variant="outlined" 
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Volver
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {service.title}
        </Typography>
        
        <Typography variant="h6" color="primary" gutterBottom>
          ${service.price}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {service.description}
        </Typography>
        
        <Box mt={4}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleBookNow}
          >
            Reservar ahora
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ServiceDetails; 