export const validateRegister = (req, res, next) => {
  const { name, email, password, securityQuestion, securityAnswer } = req.body;

  // Validar campos requeridos
  if (!name || !email || !password || !securityQuestion || !securityAnswer) {
    return res.status(400).json({ 
      error: 'Todos los campos son obligatorios',
      missing: {
        name: !name,
        email: !email,
        password: !password,
        securityQuestion: !securityQuestion,
        securityAnswer: !securityAnswer
      }
    });
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  // Validar password (mínimo 8 caracteres)
  if (password.length < 8) {
    return res.status(400).json({ 
      error: 'La contraseña debe tener al menos 8 caracteres' 
    });
  }

  // Validar respuesta de seguridad (mínimo 3 caracteres)
  if (securityAnswer.length < 3) {
    return res.status(400).json({ 
      error: 'La respuesta de seguridad debe tener al menos 3 caracteres' 
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email y contraseña son obligatorios',
      missing: {
        email: !email,
        password: !password
      }
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  next();
};

export const validateTask = (req, res, next) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'El título es obligatorio' });
  }

  if (title.length > 200) {
    return res.status(400).json({ 
      error: 'El título no puede exceder 200 caracteres' 
    });
  }

  next();
};

export const validateProject = (req, res, next) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ 
      error: 'El nombre del proyecto es obligatorio' 
    });
  }

  if (name.length > 100) {
    return res.status(400).json({ 
      error: 'El nombre no puede exceder 100 caracteres' 
    });
  }

  next();
};

export const validateSprint = (req, res, next) => {
  const { name, startDate, endDate } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ 
        error: 'Fechas inválidas' 
      });
    }
    
    if (start >= end) {
      return res.status(400).json({ 
        error: 'La fecha de inicio debe ser anterior a la fecha de fin' 
      });
    }
  }

  next();
};

export const validateStory = (req, res, next) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'El título es obligatorio' });
  }

  if (title.length > 200) {
    return res.status(400).json({ 
      error: 'El título no puede exceder 200 caracteres' 
    });
  }

  next();
};

export const validatePasswordReset = (req, res, next) => {
  const { email, securityAnswer, newPassword } = req.body;

  if (!email || !securityAnswer || !newPassword) {
    return res.status(400).json({ 
      error: 'Todos los campos son obligatorios' 
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ 
      error: 'La nueva contraseña debe tener al menos 8 caracteres' 
    });
  }

  next();
};