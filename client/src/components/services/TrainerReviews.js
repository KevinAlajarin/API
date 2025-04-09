import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Rating,
  Divider,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  Grid,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Reply as ReplyIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';

const TrainerReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para responder a reseñas
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState(null);
  
  // Filtros y ordenación
  const [activeTab, setActiveTab] = useState(0); // 0: Todas, 1: Sin responder, 2: Respondidas
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, highest, lowest
  
  // Estadísticas
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    respondedReviews: 0,
    pendingReviews: 0
  });
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        // Obtener todas las reseñas asociadas a los servicios del entrenador
        const response = await axios.get(`http://localhost:5000/api/reviews/trainer/${user.id}`);
        
        const fetchedReviews = response.data;
        setReviews(fetchedReviews);
        
        // Calcular estadísticas
        const totalReviews = fetchedReviews.length;
        const averageRating = totalReviews > 0 
          ? fetchedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0;
        const respondedReviews = fetchedReviews.filter(review => review.trainer_reply).length;
        
        setStats({
          totalReviews,
          averageRating,
          respondedReviews,
          pendingReviews: totalReviews - respondedReviews
        });
        
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las reseñas. Por favor, intente de nuevo más tarde.');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchReviews();
  }, [user.id]);
  
  // Manejar cambio de filtro
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Filtrar reseñas según el tab activo
  const getFilteredReviews = () => {
    let filtered = [...reviews];
    
    // Filtrar por estado de respuesta
    if (activeTab === 1) {
      filtered = filtered.filter(review => !review.trainer_reply);
    } else if (activeTab === 2) {
      filtered = filtered.filter(review => review.trainer_reply);
    }
    
    // Ordenar
    switch (sortBy) {
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
  
  // Manejar el diálogo de respuesta
  const handleOpenReplyDialog = (review) => {
    setSelectedReview(review);
    setReplyText(review.trainer_reply || '');
    setReplyDialogOpen(true);
    setReplyError(null);
  };
  
  const handleCloseReplyDialog = () => {
    setReplyDialogOpen(false);
    setSelectedReview(null);
    setReplyText('');
  };
  
  // Enviar respuesta
  const handleSubmitReply = async () => {
    if (!selectedReview || !replyText.trim()) {
      setReplyError('Por favor, ingresa una respuesta.');
      return;
    }
    
    try {
      setReplySubmitting(true);
      
      await axios.post(`http://localhost:5000/api/reviews/${selectedReview.id}/reply`, {
        reply: replyText
      });
      
      // Actualizar la lista local
      setReviews(reviews.map(review => 
        review.id === selectedReview.id ? { ...review, trainer_reply: replyText } : review
      ));
      
      // Actualizar estadísticas
      setStats({
        ...stats,
        respondedReviews: stats.respondedReviews + (selectedReview.trainer_reply ? 0 : 1),
        pendingReviews: stats.pendingReviews - (selectedReview.trainer_reply ? 0 : 1)
      });
      
      setReplySubmitting(false);
      setReplyDialogOpen(false);
    } catch (err) {
      setReplyError('Error al enviar la respuesta. Por favor, intenta de nuevo.');
      setReplySubmitting(false);
      console.error(err);
    }
  };
  
  // Renderizar tarjeta de estadísticas
  const renderStatsCard = () => (
    <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom fontWeight="medium">
        Estadísticas de Reseñas
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={6} sm={3}>
          <Box textAlign="center">
            <Typography variant="h4" color="primary" fontWeight="bold">
              {stats.totalReviews}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de reseñas
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box textAlign="center">
            <Typography variant="h4" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stats.averageRating.toFixed(1)}
              <StarIcon fontSize="small" sx={{ ml: 0.5, color: 'gold' }} />
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Calificación promedio
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box textAlign="center">
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {stats.respondedReviews}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reseñas respondidas
            </Typography>
          </Box>
        </Grid>
        
        <Grid item xs={6} sm={3}>
          <Box textAlign="center">
            <Typography variant="h4" color={stats.pendingReviews > 0 ? "warning.main" : "text.disabled"} fontWeight="bold">
              {stats.pendingReviews}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pendientes de respuesta
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
  
  // Renderizar contenido principal
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
  
  const filteredReviews = getFilteredReviews();
  
  return (
    <Box>
      {/* Estadísticas */}
      {renderStatsCard()}
      
      {/* Filtros y ordenación */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Todas" />
          <Tab label={`Sin responder (${stats.pendingReviews})`} />
          <Tab label="Respondidas" />
        </Tabs>
        
        <Box display="flex" alignItems="center">
          <Typography variant="body2" mr={1}>
            Ordenar por:
          </Typography>
          <TextField
            select
            size="small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            SelectProps={{
              native: true,
            }}
            sx={{ minWidth: 150 }}
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguas</option>
            <option value="highest">Mayor calificación</option>
            <option value="lowest">Menor calificación</option>
          </TextField>
        </Box>
      </Box>
      
      {/* Lista de reseñas */}
      {filteredReviews.length === 0 ? (
        <Alert severity="info">
          {activeTab === 0 
            ? "No tienes reseñas todavía. Cuando los clientes dejen reseñas en tus servicios, aparecerán aquí."
            : activeTab === 1 
              ? "No tienes reseñas pendientes de respuesta. ¡Buen trabajo!"
              : "No has respondido a ninguna reseña todavía."}
        </Alert>
      ) : (
        <Stack spacing={3}>
          {filteredReviews.map((review) => (
            <Paper key={review.id} elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center">
                  <Chip 
                    label={review.service_title}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  
                  {review.trainer_reply ? (
                    <Chip 
                      label="Respondida" 
                      color="success" 
                      size="small" 
                      variant="outlined"
                    />
                  ) : (
                    <Chip 
                      label="Sin respuesta" 
                      color="warning" 
                      size="small" 
                      variant="outlined"
                    />
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  <CalendarIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  {format(new Date(review.created_at), 'dd MMM yyyy', { locale: es })}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="flex-start" mb={2}>
                <Avatar 
                  src={review.user_photo}
                  alt={review.user_name}
                  sx={{ width: 40, height: 40, mr: 2 }}
                >
                  {review.user_name?.charAt(0)}
                </Avatar>
                
                <Box flex={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle1" fontWeight="medium">
                      {review.user_name || 'Cliente'}
                    </Typography>
                    
                    <Rating value={review.rating} precision={0.5} readOnly />
                  </Box>
                  
                  <Typography variant="body1" paragraph>
                    {review.comment || "El cliente no dejó comentarios."}
                  </Typography>
                </Box>
              </Box>
              
              {review.trainer_reply && (
                <Box sx={{ pl: 2, pr: 2, py: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="medium">
                    Tu respuesta:
                  </Typography>
                  <Typography variant="body2">
                    {review.trainer_reply}
                  </Typography>
                </Box>
              )}
              
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant={review.trainer_reply ? "outlined" : "contained"}
                  color="primary"
                  startIcon={<ReplyIcon />}
                  onClick={() => handleOpenReplyDialog(review)}
                  size="small"
                >
                  {review.trainer_reply ? "Editar respuesta" : "Responder"}
                </Button>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
      
      {/* Diálogo para responder */}
      <Dialog 
        open={replyDialogOpen} 
        onClose={handleCloseReplyDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedReview?.trainer_reply ? "Editar respuesta" : "Responder reseña"}
        </DialogTitle>
        <DialogContent>
          {selectedReview && (
            <>
              <Box mb={3} p={2} bgcolor="grey.100" borderRadius={1}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Reseña de {selectedReview.user_name || 'Cliente'}
                  </Typography>
                  <Rating value={selectedReview.rating} precision={0.5} readOnly size="small" />
                </Box>
                <Typography variant="body2">
                  {selectedReview.comment || "El cliente no dejó comentarios."}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Para el servicio: {selectedReview.service_title}
                </Typography>
              </Box>
              
              {replyError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {replyError}
                </Alert>
              )}
              
              <TextField
                fullWidth
                label="Tu respuesta"
                multiline
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Agradece al cliente por su feedback y proporciona cualquier aclaración o información adicional..."
                variant="outlined"
              />
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Las respuestas respetuosas y constructivas ayudan a construir confianza con los clientes.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReplyDialog} disabled={replySubmitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitReply} 
            variant="contained"
            disabled={replySubmitting || !replyText.trim()}
            color="primary"
          >
            {replySubmitting ? 'Enviando...' : selectedReview?.trainer_reply ? 'Actualizar respuesta' : 'Enviar respuesta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrainerReviews; 