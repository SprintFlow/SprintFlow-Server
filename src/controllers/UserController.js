const User = require('../models/UserModel.js');

// Controllers

/**
 * @desc    Register a new user
 * @route   POST /api/users/register
 * @access  Public
 */

const registerUser = async (req, res) => {
    try {
        // Get data from request body
        const { name, email, password } = req.body;

        // Basic validation: Check if all required fields are present
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Por favor, incluye nombre, email y contraseña' });
        }

        // Check if user already exists in the database
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(409).json({ message: 'El email ya está registrado' });
        }

        // Create a new user instance
        const newUser = new User({
            name,
            email,
            password // The password will be hashed automatically by the pre-save middleware in the model
        });

        // Save the new user to the database
        await newUser.save();

        // Send a success response (without sending back the password)
        res.status(201).json({ message: 'Usuario registrado con éxito' });

    } catch (error) {
        console.error('Error durante el registro del usuario:', error);
        res.status(500).json({ message: 'Error del servidor al registrar el usuario' });
    }
};


module.exports = { registerUser };
