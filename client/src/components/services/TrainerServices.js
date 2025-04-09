import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormHelperText,
  InputAdornment,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const TrainerServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el formulario
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState('create'); // 'create' o 'edit'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    durationId: '',
    zones: [],
    isVirtual: false
  });
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  // Estados para eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Estados para opciones de formulario
  const [categories, setCategories] = useState([]);
  const [durations, setDurations] = useState([]);
  const [zones, setZones] = useState([]);

  // Cargar servicios del entrenador
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener servicios del entrenador
        const servicesRes = await axios.get('http://localhost:5000/api/services', {
          params: { trainerId: user.id }
        });
        setServices(servicesRes.data);
        
        // Obtener categorías
        const categoriesRes = await axios.get('http://localhost:5000/api/services/categories');
        setCategories(categoriesRes.data);
        
        // Obtener zonas
        const zonesRes = await axios.get('http://localhost:5000/api/services/zones');
        setZones(zonesRes.data);
        
        // Obtener duraciones
        const durationsRes = await axios.get('http://localhost:5000/api/services/durations');
        setDurations(durationsRes.data);
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los servicios. Por favor, intente de nuevo más tarde.');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchData();
  }, [user.id]);

  // Manejo del diálogo de formulario
  const handleOpenCreateDialog = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      categoryId: '',
      durationId: '',
      zones: [],
      isVirtual: false
    });
    setCurrentServiceId(null);
    setFormErrors({});
    setDialogAction('create');
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (service) => {
    setFormData({
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      categoryId: service.category_id,
      durationId: service.duration_id,
      zones: service.zones.split(', ').map(zone => {
        const zoneObj = zones.find(z => z.name === zone);
        return zoneObj ? zoneObj.id : null;
      }).filter(id => id !== null),
      isVirtual: service.is_virtual
    });
    setCurrentServiceId(service.id);
    setFormErrors({});
    setDialogAction('edit');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Manejo de cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error cuando el usuario escribe
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleZonesChange = (event) => {
    const {
      target: { value },
    } = event;
    
    // Limitar a máximo 3 zonas
    if (typeof value === 'string') {
      return;
    }
    
    if (value.length > 3) {
      setFormErrors({
        ...formErrors,
        zones: 'No se pueden seleccionar más de 3 zonas'
      });
      return;
    }
    
    setFormData({
      ...formData,
      zones: value
    });
    
    if (formErrors.zones) {
      setFormErrors({
        ...formErrors,
        zones: ''
      });
    }
  };

  const handleVirtualChange = (e) => {
    setFormData({
      ...formData,
      isVirtual: e.target.checked
    });
  };

  // Validación de formulario
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'El título es requerido';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'La descripción es requerida';
    }
    
    if (!formData.price) {
      errors.price = 'El precio es requerido';
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = 'El precio debe ser un número positivo';
    }
    
    if (!formData.categoryId) {
      errors.categoryId = 'La categoría es requerida';
    }
    
    if (!formData.durationId) {
      errors.durationId = 'La duración es requerida';
    }
    
    if (!formData.zones || formData.zones.length === 0) {
      errors.zones = 'Debe seleccionar al menos una zona';
    } else if (formData.zones.length > 3) {
      errors.zones = 'No se pueden seleccionar más de 3 zonas';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Guardar servicio
  const handleSubmitService = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setFormSubmitting(true);
    
    try {
      // Preparar datos para enviar
      const serviceData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        durationId: parseInt(formData.durationId),
        zones: formData.zones.map(id => parseInt(id)),
        isVirtual: formData.isVirtual
      };
      
      let response;
      
      if (dialogAction === 'create') {
        response = await axios.post('http://localhost:5000/api/services', serviceData);
        // Agregar el nuevo servicio a la lista
        setServices([...services, response.data.service]);
      } else {
        response = await axios.put(`http://localhost:5000/api/services/${currentServiceId}`, serviceData);
        // Actualizar el servicio en la lista
        setServices(services.map(service => 
          service.id === currentServiceId ? response.data.service : service
        ));
      }
      
      setFormSubmitting(false);
      setOpenDialog(false);
    } catch (err) {
      setFormSubmitting(false);
      console.error(err);
      setFormErrors({
        ...formErrors,
        submit: err.response?.data?.message || 'Error al guardar el servicio'
      });
    }
  };

  // Manejo del diálogo de eliminación
  const handleOpenDeleteDialog = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      setDeleteLoading(true);
      await axios.delete(`http://localhost:5000/api/services/${serviceToDelete.id}`);
      
      // Eliminar servicio de la lista
      setServices(services.filter(service => service.id !== serviceToDelete.id));
      
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Error al eliminar el servicio. Por favor, intente de nuevo más tarde.');
      setDeleteLoading(false);
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

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Crear nuevo servicio
        </Button>
      </Box>

      {services.length === 0 ? (
        <Alert severity="info">
          No tienes servicios creados. Haz clic en "Crear nuevo servicio" para empezar.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={`https://source.unsplash.com/random/300x200/?fitness,${service.category_name}`}
                  alt={service.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography gutterBottom variant="h6" component="div">
                      {service.title}
                    </Typography>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenEditDialog(service)}
                        aria-label="editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(service)}
                        aria-label="eliminar"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {service.description.length > 100 
                      ? `${service.description.substring(0, 100)}...` 
                      : service.description}
                  </Typography>
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" color="primary">
                      ${service.price}
                    </Typography>
                    <Chip 
                      label={service.category_name} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>
                  
                  <Box mt={1}>
                    <Chip 
                      label={`${service.duration_minutes} min`} 
                      size="small" 
                      sx={{ mr: 1, mb: 1 }} 
                    />
                    <Chip 
                      label={service.is_virtual ? 'Virtual' : 'Presencial'} 
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>Zonas:</strong> {service.zones}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Formulario de creación/edición */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {dialogAction === 'create' ? 'Crear nuevo servicio' : 'Editar servicio'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitService}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Título"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Descripción"
                  fullWidth
                  required
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  name="price"
                  label="Precio"
                  fullWidth
                  required
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  value={formData.price}
                  onChange={handleInputChange}
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth required error={!!formErrors.categoryId}>
                  <InputLabel id="category-label">Categoría</InputLabel>
                  <Select
                    labelId="category-label"
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    label="Categoría"
                    onChange={handleInputChange}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.categoryId && (
                    <FormHelperText>{formErrors.categoryId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth required error={!!formErrors.durationId}>
                  <InputLabel id="duration-label">Duración</InputLabel>
                  <Select
                    labelId="duration-label"
                    id="durationId"
                    name="durationId"
                    value={formData.durationId}
                    label="Duración"
                    onChange={handleInputChange}
                  >
                    {durations.map((duration) => (
                      <MenuItem key={duration.id} value={duration.id}>
                        {duration.minutes} minutos
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.durationId && (
                    <FormHelperText>{formErrors.durationId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12} sm={8}>
                <FormControl fullWidth required error={!!formErrors.zones}>
                  <InputLabel id="zones-label">Zonas (máximo 3)</InputLabel>
                  <Select
                    labelId="zones-label"
                    id="zones"
                    name="zones"
                    multiple
                    value={formData.zones}
                    onChange={handleZonesChange}
                    input={<OutlinedInput label="Zonas (máximo 3)" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const zone = zones.find(z => z.id === value);
                          return (
                            <Chip key={value} label={zone ? zone.name : value} size="small" />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {zones.map((zone) => (
                      <MenuItem key={zone.id} value={zone.id}>
                        <Checkbox checked={formData.zones.indexOf(zone.id) > -1} />
                        <ListItemText primary={zone.name} />
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.zones && (
                    <FormHelperText>{formErrors.zones}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isVirtual}
                      onChange={handleVirtualChange}
                      name="isVirtual"
                    />
                  }
                  label={formData.isVirtual ? "Virtual" : "Presencial"}
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
            
            {formErrors.submit && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {formErrors.submit}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={formSubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitService} 
            variant="contained"
            disabled={formSubmitting}
          >
            {formSubmitting ? 'Guardando...' : dialogAction === 'create' ? 'Crear' : 'Guardar cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el servicio "{serviceToDelete?.title}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrainerServices; 