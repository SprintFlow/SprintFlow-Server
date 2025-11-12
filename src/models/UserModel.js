import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria']
  },
  role: {
    type: String,
    enum: ['Developer', 'QA', 'Scrum Master', 'Admin'],
    default: 'Developer'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    default: null
  },
  // ✅ NUEVO: Pregunta de seguridad
  securityQuestion: {
    question: {
      type: String,
      default: "¿Cuál es el nombre de tu primera mascota?" // Pregunta por defecto
    },
    answer: {
      type: String,
      default: "mascota" // Respuesta por defecto
    }
  },
  // ✅ NUEVO: Para forzar configuración en primer login
  hasConfiguredSecurity: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// ✅ Hashea la contraseña solo si ha sido modificada o es nueva
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Método para comparar contraseñas (login seguro)
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Evita que Mongoose registre el modelo más de una vez en entornos con hot-reload
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;