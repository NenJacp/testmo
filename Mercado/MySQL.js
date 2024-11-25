const mysql = require('mysql');

const conexion = mysql.createConnection({
    host: "localhost",
    database: "mercado",
    user: "root",
    password: ""
});

conexion.connect(function(err) {
    if (err) {
        throw err;
    }
    console.log("Conexión exitosa");
});

module.exports = conexion;