import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  CardActionArea,
  Typography, 
  Chip,
  Rating,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Stack,
  IconButton,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const ServiceList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  
  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [modalityFilter, setModalityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Paginación
  const [page, setPage] = useState(1);
  const servicesPerPage = 9;
  
  // Cargar servicios y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesResponse, categoriesResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/services'),
          axios.get('http://localhost:5000/api/categories')
        ]);
        
        const availableServices = servicesResponse.data.filter(service => service.is_published);
        setServices(availableServices);
        setFilteredServices(availableServices);
        setCategories(categoriesResponse.data);
        
        // Establecer precio máximo basado en los servicios disponibles
        if (availableServices.length > 0) {
          const maxServicePrice = Math.max(...availableServices.map(service => service.price));
          setMaxPrice(maxServicePrice);
          setPriceRange([0, maxServicePrice]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los servicios. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchData();
  }, []);
  
  // Aplicar filtros cuando cambien los criterios
  useEffect(() => {
    filterServices();
  }, [searchQuery, selectedCategory, priceRange, modalityFilter, sortBy, services]);
  
  // Función para filtrar servicios
  const filterServices = () => {
    let filtered = [...services];
    
    // Filtrar por texto de búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service => 
        service.title?.toLowerCase().includes(query) || 
        service.description?.toLowerCase().includes(query) ||
        service.zones?.toLowerCase().includes(query) ||
        service.trainer_first_name?.toLowerCase().includes(query) ||
        service.trainer_last_name?.toLowerCase().includes(query)
      );
    }
    
    // Filtrar por categoría
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category_id === selectedCategory);
    }
    
    // Filtrar por rango de precio
    filtered = filtered.filter(service => 
      service.price >= priceRange[0] && service.price <= priceRange[1]
    );
    
    // Filtrar por modalidad
    if (modalityFilter === 'virtual') {
      filtered = filtered.filter(service => service.is_virtual);
    } else if (modalityFilter === 'presential') {
      filtered = filtered.filter(service => service.is_presential);
    }
    
    // Ordenar resultados
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }
    
    setFilteredServices(filtered);
    setPage(1); // Resetear a la primera página al filtrar
  };
  
  // Restablecer todos los filtros
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange([0, maxPrice]);
    setModalityFilter('all');
    setSortBy('newest');
  };
  
  // Calcular servicios para la página actual
  const getCurrentPageServices = () => {
    const startIndex = (page - 1) * servicesPerPage;
    const endIndex = startIndex + servicesPerPage;
    return filteredServices.slice(startIndex, endIndex);
  };
  
  // Manejar clic en un servicio
  const handleServiceClick = (serviceId) => {
    navigate(`/services/${serviceId}`);
  };
  
  // Mostrar cargando
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Mostrar error
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Barra de búsqueda y filtros */}
      <Box mb={4}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar entrenadores, servicios, ubicaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={8} md={4}>
            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                label="Ordenar por"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">Más recientes</MenuItem>
                <MenuItem value="rating">Mejor valorados</MenuItem>
                <MenuItem value="price_asc">Precio: menor a mayor</MenuItem>
                <MenuItem value="price_desc">Precio: mayor a menor</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} md={2}>
            <Button 
              fullWidth 
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros
            </Button>
          </Grid>
        </Grid>
        
        {/* Panel de filtros expandible */}
        {showFilters && (
          <Box mt={2} p={2} bgcolor="background.paper" borderRadius={1} boxShadow={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Categoría"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <MenuItem value="">Todas las categorías</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Modalidad</InputLabel>
                  <Select
                    value={modalityFilter}
                    label="Modalidad"
                    onChange={(e) => setModalityFilter(e.target.value)}
                  >
                    <MenuItem value="all">Ambas modalidades</MenuItem>
                    <MenuItem value="virtual">Virtual</MenuItem>
                    <MenuItem value="presential">Presencial</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography id="price-range-slider" gutterBottom>
                  Rango de precio: ${priceRange[0]} - ${priceRange[1]}
                </Typography>
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={maxPrice}
                  step={100}
                  aria-labelledby="price-range-slider"
                />
              </Grid>
              <Grid item xs={12} display="flex" justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  onClick={resetFilters}
                  startIcon={<ClearIcon />}
                >
                  Limpiar filtros
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {/* Resultados y estadísticas */}
        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Mostrando {Math.min(filteredServices.length, servicesPerPage)} de {filteredServices.length} resultados
          </Typography>
          {filteredServices.length === 0 && (
            <Typography variant="body2" color="error">
              No se encontraron servicios con los filtros seleccionados
            </Typography>
          )}
        </Box>
      </Box>
      
      {/* Listado de servicios */}
      {filteredServices.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {getCurrentPageServices().map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea onClick={() => handleServiceClick(service.id)}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={service.image_url || '/static/images/service-placeholder.jpg'}
                      alt={service.title}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography
                          variant="subtitle1"
                          component="h2"
                          fontWeight="bold"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {service.title}
                        </Typography>
                        <Typography variant="subtitle1" color="primary" fontWeight="bold">
                          ${service.price}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={1}>
                        <Rating
                          value={service.average_rating || 0}
                          precision={0.5}
                          size="small"
                          readOnly
                        />
                        <Typography variant="body2" color="text.secondary" ml={0.5}>
                          ({service.review_count || 0})
                        </Typography>
                      </Box>
                      
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mb: 1,
                          height: '40px',
                        }}
                      >
                        {service.description}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <CategoryIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {service.category_name || 'Sin categoría'}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" mb={0.5}>
                        <TimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          {service.duration_minutes} minutos
                        </Typography>
                      </Box>
                      
                      {service.zones && (
                        <Box display="flex" alignItems="flex-start" mb={0.5}>
                          <LocationIcon fontSize="small" color="action" sx={{ mr: 1, mt: 0.3 }} />
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {service.zones}
                          </Typography>
                        </Box>
                      )}
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box display="flex" alignItems="center" mt={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {service.trainer_first_name} {service.trainer_last_name}
                        </Typography>
                      </Box>
                      
                      <Box mt={1} display="flex" gap={0.5}>
                        {service.is_virtual && (
                          <Chip 
                            label="Virtual" 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        )}
                        {service.is_presential && (
                          <Chip 
                            label="Presencial" 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Paginación */}
          {filteredServices.length > servicesPerPage && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={Math.ceil(filteredServices.length / servicesPerPage)}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      ) : (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          py={8}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No se encontraron servicios
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" mb={3}>
            Prueba a cambiar los filtros o realizar una búsqueda diferente
          </Typography>
          <Button 
            variant="contained" 
            onClick={resetFilters}
            startIcon={<ClearIcon />}
          >
            Limpiar filtros
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ServiceList; 