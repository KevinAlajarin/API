import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ServiceManagement = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'trainer') {
      navigate('/unauthorized');
      return;
    }

    fetchServices();
  }, [user, navigate]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/services/trainer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar tus servicios. Por favor, intenta de nuevo más tarde.');
      setLoading(false);
      console.error(err);
    }
  };

  const handleMenuOpen = (event, service) => {
    setAnchorEl(event.currentTarget);
    setSelectedService(service);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateService = () => {
    navigate('/services/create');
  };

  const handleEditService = (serviceId) => {
    handleMenuClose();
    navigate(`/services/edit/${serviceId}`);
  };

  const handleViewService = (serviceId) => {
    handleMenuClose();
    navigate(`/services/${serviceId}`);
  };

  const handleDuplicateService = async (serviceId) => {
    handleMenuClose();
    try {
      setUpdateLoading(true);
      const response = await axios.post(`http://localhost:5000/api/services/duplicate/${serviceId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 201) {
        fetchServices();
      }
    } catch (err) {
      setError('Error al duplicar el servicio. Por favor, intenta de nuevo más tarde.');
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const confirmDelete = (service) => {
    handleMenuClose();
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      setUpdateLoading(true);
      await axios.delete(`http://localhost:5000/api/services/${serviceToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(services.filter(service => service.id !== serviceToDelete.id));
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (err) {
      setError('Error al eliminar el servicio. Por favor, intenta de nuevo más tarde.');
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePublishToggle = async (service) => {
    handleMenuClose();
    try {
      setUpdateLoading(true);
      const updatedPublishStatus = !service.is_published;
      await axios.patch(`http://localhost:5000/api/services/${service.id}/publish`, 
        { is_published: updatedPublishStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setServices(services.map(s => 
        s.id === service.id ? { ...s, is_published: updatedPublishStatus } : s
      ));
    } catch (err) {
      setError(`Error al ${service.is_published ? 'despublicar' : 'publicar'} el servicio. Por favor, intenta de nuevo más tarde.`);
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Gestión de Servicios
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateService}
        >
          Crear Nuevo Servicio
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {updateLoading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {services.length > 0 ? (
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  opacity: service.is_published ? 1 : 0.7,
                  transition: 'all 0.3s ease'
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={service.image_url || '/static/images/service-placeholder.jpg'}
                    alt={service.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      padding: '4px 8px',
                      borderTopLeftRadius: 4,
                    }}
                  >
                    ${service.price}
                  </Box>
                  {!service.is_published && (
                    <Chip
                      label="No Publicado"
                      color="default"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                      }}
                    />
                  )}
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom noWrap>
                    {service.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mb: 2,
                      height: '40px',
                    }}
                  >
                    {service.description}
                  </Typography>
                  
                  <Box display="flex" mb={1}>
                    <Chip 
                      label={service.category_name || 'Sin categoría'} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={`${service.duration_minutes} min`} 
                      size="small" 
                      color="secondary" 
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
                    {service.is_virtual && (
                      <Chip label="Virtual" size="small" />
                    )}
                    {service.is_presential && (
                      <Chip label="Presencial" size="small" />
                    )}
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Reservas: {service.booking_count || 0}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Reseñas: {service.review_count || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button 
                    size="small" 
                    color="primary" 
                    onClick={() => handleViewService(service.id)}
                  >
                    Ver Detalles
                  </Button>
                  
                  <IconButton 
                    aria-label="opciones"
                    onClick={(e) => handleMenuOpen(e, service)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box 
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
          textAlign="center"
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tienes servicios creados aún
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Crea tu primer servicio para que los clientes puedan reservarlo
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateService}
          >
            Crear Servicio
          </Button>
        </Box>
      )}

      {/* Menú de acciones para cada servicio */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedService && handleEditService(selectedService.id)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => selectedService && handlePublishToggle(selectedService)}>
          {selectedService && selectedService.is_published ? (
            <>
              <VisibilityOffIcon fontSize="small" sx={{ mr: 1 }} />
              Despublicar
            </>
          ) : (
            <>
              <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
              Publicar
            </>
          )}
        </MenuItem>
        <MenuItem onClick={() => selectedService && handleDuplicateService(selectedService.id)}>
          <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicar
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => selectedService && confirmDelete(selectedService)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el servicio "{serviceToDelete?.title}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServiceManagement; 