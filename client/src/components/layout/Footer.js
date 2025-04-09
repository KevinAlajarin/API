import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'primary.main',
        color: 'white'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Personal Trainers
            </Typography>
            <Typography variant="body2">
              Conectamos a entrenadores personales con clientes que buscan mejorar su bienestar físico.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Enlaces Útiles
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Inicio
            </Link>
            <Link component={RouterLink} to="/reviews" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Comentarios
            </Link>
            <Link component={RouterLink} to="/register" color="inherit" sx={{ display: 'block' }}>
              Registrarse
            </Link>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Contacto
            </Typography>
            <Typography variant="body2">
              Email: contacto@personaltrainers.com
            </Typography>
            <Typography variant="body2">
              Teléfono: +54 11 1234-5678
            </Typography>
          </Grid>
        </Grid>
        
        <Box mt={3}>
          <Typography variant="body2" align="center">
            {'© '}
            {new Date().getFullYear()}
            {' Personal Trainers. Todos los derechos reservados.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 