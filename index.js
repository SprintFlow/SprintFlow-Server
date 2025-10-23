const express = require("express");

// Imports
const userRoutes = require('./src/routes/userRoutes.js');

// App Initialization
const app = express();
const PORT = 4000;

// Middlewares
app.use(express.json());

// Mount user route
app.use('/api/users', userRoutes);
// Health check route
app.get("/", (req, res) => {
res.send("Servidor funcionando 😎");
});

// Server Activation
app.listen(PORT, () => {
console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

