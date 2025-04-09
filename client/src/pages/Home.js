import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea, 
  Button, 
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  FormGroup,
  FormControlLabel,
  Switch,
  Rating,
  Divider,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    categoryId: '',
    zoneId: '',
    durationId: '',
    minPrice: 0,
    maxPrice: 10000,
    isVirtual: null,
    orderBy: ''
  });

  // Options for filters
  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [durations, setDurations] = useState([]);

  // Load services and filter options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch services with filters
        const queryParams = new URLSearchParams();
        if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
        if (filters.zoneId) queryParams.append('zoneId', filters.zoneId);
        if (filters.durationId) queryParams.append('durationId', filters.durationId);
        if (filters.isVirtual !== null) queryParams.append('isVirtual', filters.isVirtual);
        if (filters.orderBy) queryParams.append('orderBy', filters.orderBy);
        
        const servicesRes = await axios.get(`http://localhost:5000/api/services?${queryParams}`);
        setServices(servicesRes.data);
        
        // Fetch categories, zones, and durations if not already loaded
        if (categories.length === 0) {
          const categoriesRes = await axios.get('http://localhost:5000/api/services/categories');
          setCategories(categoriesRes.data);
        }
        
        if (zones.length === 0) {
          const zonesRes = await axios.get('http://localhost:5000/api/services/zones');
          setZones(zonesRes.data);
        }
        
        if (durations.length === 0) {
          const durationsRes = await axios.get('http://localhost:5000/api/services/durations');
          setDurations(durationsRes.data);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los servicios. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchData();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  // Handle virtual/presential switch
  const handleVirtualChange = (event) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      isVirtual: event.target.checked ? true : (event.target.checked === false ? false : null)
    }));
  };

  // Handle price range change
  const handlePriceChange = (event, newValue) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      minPrice: newValue[0],
      maxPrice: newValue[1]
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      categoryId: '',
      zoneId: '',
      durationId: '',
      minPrice: 0,
      maxPrice: 10000,
      isVirtual: null,
      orderBy: ''
    });
  };

  // Navigate to service details
  const handleServiceClick = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Encuentra tu entrenador personal
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Explora nuestra selección de entrenadores calificados en diversas categorías
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Filters Panel */}
        <Grid item xs={12} md={3}>
          <Card sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Filtros
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Categoría</InputLabel>
              <Select
                name="categoryId"
                value={filters.categoryId}
                label="Categoría"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Todas</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Zona</InputLabel>
              <Select
                name="zoneId"
                value={filters.zoneId}
                label="Zona"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Todas</MenuItem>
                {zones.map((zone) => (
                  <MenuItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Duración</InputLabel>
              <Select
                name="durationId"
                value={filters.durationId}
                label="Duración"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Todas</MenuItem>
                {durations.map((duration) => (
                  <MenuItem key={duration.id} value={duration.id}>
                    {duration.minutes} minutos
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography gutterBottom>Rango de precio</Typography>
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={10000}
              step={500}
            />
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body2">$0</Typography>
              <Typography variant="body2">$10,000</Typography>
            </Box>

            <FormGroup sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.isVirtual === true}
                    onChange={handleVirtualChange}
                  />
                }
                label="Virtual / Presencial"
              />
              <Typography variant="body2" color="text.secondary">
                {filters.isVirtual === true 
                  ? 'Virtual' 
                  : filters.isVirtual === false 
                    ? 'Presencial' 
                    : 'Ambos'}
              </Typography>
            </FormGroup>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                name="orderBy"
                value={filters.orderBy}
                label="Ordenar por"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Relevancia</MenuItem>
                <MenuItem value="price_asc">Precio: menor a mayor</MenuItem>
                <MenuItem value="price_desc">Precio: mayor a menor</MenuItem>
                <MenuItem value="rating_desc">Calificación: alta a baja</MenuItem>
                <MenuItem value="rating_asc">Calificación: baja a alta</MenuItem>
              </Select>
            </FormControl>

            <Button 
              variant="outlined" 
              fullWidth 
              onClick={handleResetFilters}
            >
              Limpiar filtros
            </Button>
          </Card>
        </Grid>

        {/* Services List */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box textAlign="center" p={4}>
              <Typography color="error">{error}</Typography>
              <Button 
                variant="contained" 
                sx={{ mt: 2 }} 
                onClick={() => window.location.reload()}
              >
                Reintentar
              </Button>
            </Box>
          ) : services.length === 0 ? (
            <Box textAlign="center" p={4}>
              <Typography>No se encontraron servicios que coincidan con los filtros.</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {services.map((service) => (
                <Grid item xs={12} sm={6} md={4} key={service.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardActionArea onClick={() => handleServiceClick(service.id)}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={`https://source.unsplash.com/random/300x200/?fitness,${service.category_name}`}
                        alt={service.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div" noWrap>
                          {service.title}
                        </Typography>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Rating value={service.average_rating || 0} precision={0.5} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary" ml={1}>
                            ({service.average_rating ? service.average_rating.toFixed(1) : 'Sin calificaciones'})
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" mb={1}>
                          {service.description.length > 100 
                            ? `${service.description.substring(0, 100)}...` 
                            : service.description}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
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
                            sx={{ mr: 1 }} 
                          />
                          <Chip 
                            label={service.is_virtual ? 'Virtual' : 'Presencial'} 
                            size="small" 
                          />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 