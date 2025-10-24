require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

// Imports
const userRoutes = require('./src/routes/userRoutes.js');

// App Initialization
const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
    res.send("Servidor funcionando 😎");
});

// Mount user routes
app.use('/api/users', userRoutes);

// Server Activation
const startServer = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error("MONGO_URI is not defined in the .env file");
        }
        const connection = await mongoose.connect(MONGO_URI);
        console.log("Conectado a MongoDB! 🚀");

        // Listar colecciones de la base de datos
        const db = connection.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("Colecciones disponibles en la DB:");
        collections.forEach(col => console.log(`- ${col.name}`));

        app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error.message);
    }
};

startServer();
