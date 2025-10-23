const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        enum: ['Developer', 'QA', 'Scrum Master'],
        default: 'Developer'
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Mongoose Middleware
// Hash password before saving the user document to the database.
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next(); // ⚠️ ESTO FALTA - es crucial para que el middleware termine
    } catch (error) {
        next(error); // Propagar el error si algo falla
    }
});

// Model Export
module.exports = mongoose.model('User', userSchema);