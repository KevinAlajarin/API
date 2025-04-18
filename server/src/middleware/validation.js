const yup = require('yup');

const userSchema = yup.object().shape({
  firstName: yup.string().required('El nombre es requerido'),
  lastName: yup.string().required('El apellido es requerido'),
  email: yup.string().email('Email inválido').required('El email es requerido'),
  password: yup.string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'La contraseña debe contener al menos una mayúscula, un número y un carácter especial'
    ),
  birthDate: yup.date().required('La fecha de nacimiento es requerida'),
  gender: yup.string().oneOf(['male', 'female'], 'El género debe ser masculino o femenino').required('El género es requerido'),
  role: yup.string().oneOf(['client', 'trainer'], 'El rol debe ser cliente o entrenador').required('El rol es requerido')
});

const loginSchema = yup.object().shape({
  email: yup.string().email('Email inválido').required('El email es requerido'),
  password: yup.string().required('La contraseña es requerida')
});

const serviceSchema = yup.object().shape({
  title: yup.string().required('El título es requerido'),
  description: yup.string().required('La descripción es requerida'),
  price: yup.number().required('El precio es requerido').positive('El precio debe ser positivo'),
  categoryId: yup.number().required('La categoría es requerida'),
  durationId: yup.number().required('La duración es requerida'),
  zones: yup.array()
    .of(yup.number())
    .min(1, 'Debe seleccionar al menos una zona')
    .max(3, 'No se pueden seleccionar más de 3 zonas')
    .required('Las zonas son requeridas'),
  isVirtual: yup.boolean().required('La modalidad es requerida')
});

const bookingSchema = yup.object().shape({
  serviceId: yup.number().required('El servicio es requerido'),
  scheduledDate: yup.date()
    .min(new Date(), 'La fecha debe ser futura')
    .required('La fecha es requerida'),
  notes: yup.string().max(500, 'Las notas no pueden exceder los 500 caracteres')
});

const validateUser = async (req, res, next) => {
  try {
    await userSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Error de validación',
      errors: error.inner.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }
};

const validateLogin = async (req, res, next) => {
  try {
    await loginSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Error de validación',
      errors: error.inner.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }
};

const validateService = async (req, res, next) => {
  try {
    await serviceSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Error de validación',
      errors: error.inner.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }
};

const validateBooking = async (req, res, next) => {
  try {
    await bookingSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: 'Error de validación',
      errors: error.inner.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }
};

module.exports = {
  validateUser,
  validateLogin,
  validateService,
  validateBooking
}; 