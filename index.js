const express = require("express");
const app = express();
const PORT = 4000;
app.use(express.json());
app.get("/", (req, res) => {
res.send("Servidor funcionando 😎");
});
app.listen(PORT, () => {
console.log(`Servidor escuchando en http://localhost:${PORT}`);
});