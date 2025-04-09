import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Rating, 
  Divider, 
  Avatar, 
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    rating: '',
    sortBy: 'newest'
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // En un caso real, aquí filtrarías las reseñas en el backend
        const response = await axios.get('http://localhost:5000/api/reviews');
        setReviews(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las reseñas. Por favor, intenta de nuevo más tarde.');
        setLoading(false);
        console.error(err);
      }
    };

    fetchReviews();
  }, []);

  // Filtrar y ordenar reseñas
  const getFilteredReviews = () => {
    let filtered = [...reviews];
    
    // Filtrar por texto
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(review => 
        review.comment?.toLowerCase().includes(searchTerm) ||
        review.user_name?.toLowerCase().includes(searchTerm) ||
        review.service_title?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtrar por calificación
    if (filters.rating) {
      filtered = filtered.filter(review => review.rating === parseInt(filters.rating));
    }
    
    // Ordenar
    switch (filters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }
    
    return filtered;
  };

  // Paginación
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Manejo de filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setPage(1); // Reset a la primera página al filtrar
  };

  // Renderizar contenido
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
      </Container>
    );
  }

  const filteredReviews = getFilteredReviews();
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const currentReviews = filteredReviews.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reseñas de Clientes
      </Typography>
      
      {/* Filtros */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Buscar"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Calificación</InputLabel>
              <Select
                name="rating"
                value={filters.rating}
                label="Calificación"
                onChange={handleFilterChange}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="5">5 estrellas</MenuItem>
                <MenuItem value="4">4 estrellas</MenuItem>
                <MenuItem value="3">3 estrellas</MenuItem>
                <MenuItem value="2">2 estrellas</MenuItem>
                <MenuItem value="1">1 estrella</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                name="sortBy"
                value={filters.sortBy}
                label="Ordenar por"
                onChange={handleFilterChange}
              >
                <MenuItem value="newest">Más recientes</MenuItem>
                <MenuItem value="oldest">Más antiguas</MenuItem>
                <MenuItem value="highest">Mayor calificación</MenuItem>
                <MenuItem value="lowest">Menor calificación</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {/* Lista de reseñas */}
      {currentReviews.length === 0 ? (
        <Alert severity="info">
          No se encontraron reseñas que coincidan con tus criterios de búsqueda.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {currentReviews.map((review) => (
              <Grid item xs={12} sm={6} md={4} key={review.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          sx={{ mr: 2 }}
                          src={review.user_photo}
                        >
                          {review.user_name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {review.user_name || 'Cliente'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(review.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Rating value={review.rating} readOnly size="small" />
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box mb={2}>
                      <Chip 
                        label={review.service_title} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                    
                    <Typography variant="body2" paragraph sx={{ minHeight: '80px' }}>
                      {review.comment || "El cliente no dejó comentarios."}
                    </Typography>
                    
                    {review.trainer_reply && (
                      <Box sx={{ mt: 2, px: 2, py: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" fontWeight="medium">
                          Respuesta del entrenador:
                        </Typography>
                        <Typography variant="body2">
                          {review.trainer_reply}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination 
                count={totalPages} 
                page={page}
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Reviews; 