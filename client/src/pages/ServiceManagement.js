import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import ClientBookings from '../components/services/ClientBookings';
import TrainerServices from '../components/services/TrainerServices';
import TrainerBookings from '../components/services/TrainerBookings';
import TrainerReviews from '../components/services/TrainerReviews';

const ServiceManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Componente según tipo de usuario
  const renderContent = () => {
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

    // Verificar tipo de usuario
    const isTrainer = user?.role === 'trainer';

    if (isTrainer) {
      // Vista para entrenadores
      return (
        <>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab label="Mis Servicios" />
            <Tab label="Reservas" />
            <Tab label="Reseñas" />
          </Tabs>

          {activeTab === 0 ? (
            <TrainerServices />
          ) : activeTab === 1 ? (
            <TrainerBookings />
          ) : (
            <TrainerReviews />
          )}
        </>
      );
    } else {
      // Vista para clientes
      return <ClientBookings />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {user?.role === 'trainer' ? 'Gestión de Servicios' : 'Mis Reservas'}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        {user?.role === 'trainer'
          ? 'Administra tus servicios y visualiza las reservas de tus clientes'
          : 'Visualiza y gestiona tus reservas con los entrenadores'}
      </Typography>

      {renderContent()}
    </Container>
  );
};

export default ServiceManagement; 