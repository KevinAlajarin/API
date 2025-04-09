import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Link,
  Grid,
  Alert,
  IconButton,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      const success = await login(formData.email, formData.password);
      
      setIsSubmitting(false);
      
      if (success) {
        navigate('/');
      }
    }
  };

  // Password reset dialog handlers
  const handleOpenResetDialog = () => {
    setOpenResetDialog(true);
    setResetSuccess(false);
    setResetError('');
  };

  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
  };

  const handleResetEmailChange = (e) => {
    setResetEmail(e.target.value);
  };

  const handleResetPassword = async () => {
    if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
      setResetError('Por favor, ingresa un email válido');
      return;
    }

    try {
      // Aquí se implementaría la llamada al backend para solicitar restablecimiento
      // Por ahora simulamos una respuesta exitosa
      // await axios.post('http://localhost:5000/api/users/reset-password', { email: resetEmail });
      
      setResetSuccess(true);
      setResetError('');
    } catch (error) {
      setResetError(error.response?.data?.message || 'Error al solicitar restablecimiento de contraseña');
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" gutterBottom>
            Iniciar sesión
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
            
            <Grid container>
              <Grid item xs>
                <Link component="button" variant="body2" onClick={handleOpenResetDialog}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  {"¿No tienes cuenta? Regístrate"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>

      {/* Dialog for password reset */}
      <Dialog open={openResetDialog} onClose={handleCloseResetDialog}>
        <DialogTitle>Restablecer contraseña</DialogTitle>
        <DialogContent>
          {resetSuccess ? (
            <DialogContentText>
              Hemos enviado un enlace de recuperación a tu correo electrónico. Por favor, revisa tu bandeja de entrada.
            </DialogContentText>
          ) : (
            <>
              <DialogContentText>
                Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="resetEmail"
                label="Dirección de correo electrónico"
                type="email"
                fullWidth
                variant="outlined"
                value={resetEmail}
                onChange={handleResetEmailChange}
                error={!!resetError}
                helperText={resetError}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          {resetSuccess ? (
            <Button onClick={handleCloseResetDialog}>Cerrar</Button>
          ) : (
            <>
              <Button onClick={handleCloseResetDialog}>Cancelar</Button>
              <Button onClick={handleResetPassword}>Enviar</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login; 