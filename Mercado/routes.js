const express = require('express');
const nodemailer = require('nodemailer'); // para que se envien al correo
const conexion = require('./db'); // Importar la conexión a la base de datos
const router = express.Router();

// Configuración de nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com', // Servidor SMTP de Hotmail/Outlook
    port: 587, // Puerto para TLS
    secure: false, // true para 465, false para otros puertos
    auth: {
        user: 'Agrega correo aqui', // Tu correo de Hotmail
        pass: 'contraseña aqui' // Tu contraseña de Hotmail
    }
});

// Ruta para servir Registro.html como la página de inicio
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'zombiz-master', 'Registro.html'));
});

// Ruta para manejar el registro de usuarios
router.post('/submit-form', (req, res) => {
    const { nombre, apellido, email, direccion, telefono, password } = req.body;

    const sql = `INSERT INTO Usuarios (nombre, apellido, email, direccion, telefono, password) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    conexion.query(sql, [nombre, apellido, email, direccion, telefono, password], (err, result) => {
        if (err) {
            console.error("Error al guardar los datos en la base de datos:", err);
            return res.status(500).json({ success: false, message: 'Error al guardar los datos en la base de datos.' });
        }
        console.log("Datos insertados correctamente en la base de datos");
        res.status(200).json({ success: true, message: 'Datos guardados correctamente.' });
    });
});

// Ruta para manejar el login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sqlAuth = 'SELECT id FROM usuarios WHERE email = ? AND password = ?';
    conexion.query(sqlAuth, [email, password], (err, results) => {
        if (err) {
            console.error("Error al autenticar el usuario:", err);
            return res.status(500).json({ success: false, message: 'Error al autenticar el usuario.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas.' });
        }

        const idUsuario = results[0].id;

        const sqlCarrito = 'SELECT nombre_producto, precio FROM carrito WHERE comprador = ?';
        conexion.query(sqlCarrito, [idUsuario], (err, carritoResults) => {
            if (err) {
                console.error("Error al obtener el carrito del usuario:", err);
                return res.status(500).json({ success: false, message: 'Error al obtener el carrito.' });
            }

            const productosCarrito = carritoResults.map(row => ({
                nombre: row.nombre_producto,
                precio: row.precio
            }));

            if (productosCarrito.length > 0) {
                const sqlDeleteCarrito = 'DELETE FROM carrito WHERE comprador = ?';
                conexion.query(sqlDeleteCarrito, [idUsuario], (err, result) => {
                    if (err) {
                        console.error("Error al eliminar los datos del carrito:", err);
                        return res.status(500).json({ success: false, message: 'Error al limpiar el carrito.' });
                    }

                    console.log("Productos del carrito eliminados de la tabla carrito");

                    res.status(200).json({
                        success: true,
                        idUsuario: idUsuario,
                        carrito: productosCarrito
                    });
                });
            } else {
                res.status(200).json({
                    success: true,
                    idUsuario: idUsuario,
                    carrito: productosCarrito
                });
            }
        });
    });
});

// Ruta para confirmar la compra
router.post('/confirmar-compra', (req, res) => {
    const productos = req.body.productos;
    const idComprador = req.body.id_comprador;

    const sql = 'INSERT INTO Compras (nombre_producto, precio, comprador) VALUES ?';
    const values = productos.map(producto => [producto.nombre, producto.precio, idComprador]);

    conexion.query(sql, [values], (err, result) => {
        if (err) {
            console.error("Error al guardar los datos en la tabla Compras:", err);
            return res.status(500).json({ success: false, message: 'Error al confirmar la compra.' });
        }
        
        console.log("Productos comprados guardados en la tabla Compras");

        res.status(200).json({ success: true, message: 'Compra confirmada exitosamente.' });
    });
});

// Ruta para guardar el carrito
router.post('/guardar_carrito', (req, res) => {
    const productos = req.body.productos;
    const idComprador = req.body.id_comprador;

    console.log("ID del comprador recibido:", idComprador); // Verifica qué valor muestra aquí

    const sql = 'INSERT INTO carrito (nombre_producto, precio, comprador) VALUES ?';
    const values = productos.map(producto => [producto.nombre, producto.precio, idComprador]);

    conexion.query(sql, [values], (err, result) => {
        if (err) {
            console.error("Error al guardar los datos en la tabla carrito:", err);
            return res.status(500).json({ success: false, message: 'Error al guardar el carrito.' });
        }
        
        console.log("Productos del carrito guardados en la tabla carrito");

        res.status(200).json({ success: true, message: 'Carrito guardado exitosamente.' });
    });
});

// Ruta para obtener datos del usuario
router.get('/api/usuario/:id', (req, res) => {
    const userId = req.params.id;

    const sql = 'SELECT nombre, apellido, email, direccion, telefono FROM usuarios WHERE id = ?';
    conexion.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Error al obtener los datos del usuario:", err);
            return res.status(500).json({ success: false, message: 'Error al obtener los datos del usuario.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }

        const usuario = results[0];
        res.status(200).json({ success: true, usuario: usuario });
    });
});

// Ruta para actualizar datos del usuario
router.post('/actualizar-usuario', (req, res) => {
    const { id, nombre, apellido, email, telefono, direccion } = req.body;

    const sql = `UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?`;
    
    conexion.query(sql, [nombre, apellido, email, telefono, direccion, id], (err, result) => {
        if (err) {
            console.error("Error al actualizar los datos en la base de datos:", err);
            return res.status(500).json({ success: false, message: 'Error al actualizar los datos en la base de datos.' });
        }
        console.log("Datos actualizados correctamente en la base de datos");
        res.status(200).json({ success: true, message: 'Datos actualizados correctamente.' });
    });
});

// Ruta para enviar correo
router.post('/enviar-correo', (req, res) => {
    const { idUsuario, carrito } = req.body;

    // Obtener datos del usuario
    const sql = 'SELECT nombre, apellido, email, direccion, telefono FROM usuarios WHERE id = ?';
    conexion.query(sql, [idUsuario], (err, results) => {
        if (err) {
            console.error("Error al obtener los datos del usuario:", err);
            return res.status(500).json({ success: false, message: 'Error al obtener los datos del usuario.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }

        const usuario = results[0];

        // Crear el contenido del correo
        const mailOptions = {
            from: 'PON EL CORREO AQUI', // Tu correo de Hotmail
            to: usuario.email,
            subject: 'Confirmación de Compra',
            text: `Hola ${usuario.nombre} ${usuario.apellido},\n\nGracias por tu compra!\n\nDetalles de la compra:\n${carrito.map(producto => `${producto.nombre} - $${producto.precio}`).join('\n')}\n\nDirección de envío: ${usuario.direccion}\nTeléfono: ${usuario.telefono}\n\n¡Gracias por elegirnos!`
        };

        // Enviar el correo
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error al enviar el correo:", error);
                return res.status(500).json({ success: false, message: 'Error al enviar el correo.' });
            }
            console.log('Correo enviado: ' + info.response);
            res.status(200).json({ success: true, message: 'Correo enviado exitosamente.' });
        });
    });
});

// Ruta para obtener datos de la tarjeta
router.get('/api/tarjeta/:idUsuario', (req, res) => {
    const idUsuario = req.params.idUsuario;

    const sql = 'SELECT Numeros, Fecha, CVV, NombreBanco FROM tarjeta WHERE IDUsuario = ?';
    conexion.query(sql, [idUsuario], (err, results) => {
        if (err) {
            console.error("Error al obtener los datos de la tarjeta:", err);
            return res.status(500).json({ success: false, message: 'Error al obtener los datos de la tarjeta.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Tarjeta no encontrada.' });
        }

        const tarjeta = results[0];
        res.status(200).json({ success: true, tarjeta: tarjeta });
    });
});

// Ruta para guardar o modificar tarjeta
router.post('/guardar-tarjeta', (req, res) => {
    const { numeros, fecha, cvv, nombreBanco, idUsuario } = req.body;

    const checkSql = 'SELECT * FROM tarjeta WHERE IDUsuario = ?';
    conexion.query(checkSql, [idUsuario], (err, results) => {
        if (err) {
            console.error("Error al verificar la tarjeta:", err);
            return res.status(500).json({ success: false, message: 'Error al verificar la tarjeta.' });
        }

        if (results.length > 0) {
            // Si la tarjeta ya existe, actualizarla
            const updateSql = 'UPDATE tarjeta SET Numeros = ?, Fecha = ?, CVV = ?, NombreBanco = ? WHERE IDUsuario = ?';
            conexion.query(updateSql, [numeros, fecha, cvv, nombreBanco, idUsuario], (err, result) => {
                if (err) {
                    console.error("Error al actualizar la tarjeta:", err);
                    return res.status(500).json({ success: false, message: 'Error al actualizar la tarjeta.' });
                }
                console.log("Tarjeta actualizada correctamente");
                res.status(200).json({ success: true, message: 'Tarjeta actualizada exitosamente.' });
            });
        } else {
            // Si la tarjeta no existe, insertarla
            const insertSql = 'INSERT INTO tarjeta (Numeros, Fecha, CVV, NombreBanco, IDUsuario) VALUES (?, ?, ?, ?, ?)';
            conexion.query(insertSql, [numeros, fecha, cvv, nombreBanco, idUsuario], (err, result) => {
                if (err) {
                    console.error("Error al guardar la tarjeta:", err);
                    return res.status(500).json({ success: false, message: 'Error al guardar la tarjeta.' });
                }
                console.log("Tarjeta guardada correctamente");
                res.status(200).json({ success: true, message: 'Tarjeta guardada exitosamente.' });
            });
        }
    });
});

module.exports = router;