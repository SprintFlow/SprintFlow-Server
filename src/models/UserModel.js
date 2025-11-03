import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User Schema Definition
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
    }
}, { timestamps: true });

// Mongoose Middleware
userSchema.pre('save', async function() {
    // Solo hashea la contraseña si ha sido modificada (o es nueva).
    // Con funciones async, Mongoose gestiona el `next()` automáticamente.
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Model Export
export default mongoose.model('Users', userSchema);