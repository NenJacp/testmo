const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes'); // Importar las rutas

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos desde el directorio 'zombiz-master'
app.use(express.static(path.join(__dirname, 'zombiz-master')));

// Usar las rutas
app.use('/', routes);

// Configurar el puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});