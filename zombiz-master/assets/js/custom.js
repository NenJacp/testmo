$(document).ready(function(){
	"use strict";

    // 1. Scroll To Top 
		$(window).on('scroll',function () {
			if ($(this).scrollTop() > 600) {
				$('.return-to-top').fadeIn();
			} else {
				$('.return-to-top').fadeOut();
			}
		});
		$('.return-to-top').on('click',function(){
				$('html, body').animate({
				scrollTop: 0
			}, 1500);
			return false;
		});
	
	
	// 2 . hcsticky 

		$('#menu').hcSticky();

		
});	
///////////////////////////////////////////////////////
// Guardar la ID del usuario en localStorage al iniciar sesión
document.addEventListener('DOMContentLoaded', function() {
    let idUsuario = localStorage.getItem('idUsuario');

    if (idUsuario) {
        // Aquí puedes realizar acciones adicionales con la ID del usuario si es necesario
    }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////
function confirmarCompra() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let idUsuario = parseInt(localStorage.getItem('idUsuario'), 10); // Convertir a entero con base 10

    if (carrito.length > 0) {
        if (!isNaN(idUsuario)) {
            // Verificar si el usuario tiene una tarjeta registrada
            fetch(`/api/tarjeta/${idUsuario}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // El usuario tiene una tarjeta, proceder con la compra
                        guardarProductosEnTabla(carrito, idUsuario) // Guardar productos en la tabla
                            .then(() => enviarCorreoCompra(idUsuario, carrito)) // Enviar correo después de guardar
                            .then(() => {
                                localStorage.removeItem('carrito');
                                actualizarContador();
                                mostrarProductosEnCarrito();
                                alert("Compra confirmada");
                            });
                    } else {
                        // El usuario no tiene una tarjeta registrada
                        alert("No tienes una tarjeta registrada. Por favor, añade una tarjeta para completar la compra.");
                    }
                })
                .catch(error => {
                    console.error('Error al verificar la tarjeta:', error);
                    alert("Hubo un error al verificar la tarjeta. Inténtalo de nuevo.");
                });
        } else {
            console.error('ID de usuario no válido');
        }
    } else {
        alert("El carrito está vacío");
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////7

// Función para enviar correo de compra
function enviarCorreoCompra(idUsuario, carrito) {
    return fetch(`/enviar-correo`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idUsuario, carrito })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Correo enviado exitosamente");
        } else {
            console.error("Error al enviar el correo:", data.message);
        }
    })
    .catch(error => {
        console.error('Error al enviar el correo:', error);
    });
}

function guardarProductosEnTabla(productos, idUsuario) {
    return new Promise((resolve, reject) => { // Asegúrate de devolver una promesa
        if (!isNaN(idUsuario)) {
            const formData = {
                productos: productos,
                id_comprador: idUsuario
            };

            // Enviar los datos al servidor usando fetch
            fetch('/confirmar-compra', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log("Productos guardados en la tabla Compras");
                    resolve(); // Resuelve la promesa
                } else {
                    console.error("Error al guardar productos en la tabla Compras:", data.message);
                    reject(data.message); // Rechaza la promesa
                }
            })
            .catch(error => {
                console.error('Error:', error);
                reject(error); // Rechaza la promesa
            });
        } else {
            console.error('ID de usuario no válido en guardarProductosEnTabla');
            reject('ID de usuario no válido'); // Rechaza la promesa
        }
    });
}

function confirmarSalir() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let idUsuario = parseInt(localStorage.getItem('idUsuario'), 10); // Convertir a entero con base 10

    if (carrito.length > 0) {
        alert("Carrito Guardado");
        console.log(idUsuario);
        // Verificar si el ID es un número válido antes de enviarlo
        if (!isNaN(idUsuario)) {
            guardarCarritoEnTabla(carrito, idUsuario); // Pasar el ID del usuario como un entero a la función
            console.log(idUsuario);
            localStorage.removeItem('carrito');
            actualizarContador();
        } else {
            console.error('ID de usuario no válido');
        }
    } else {
        window.location.href = '../Inicio_Sesion.html';
    }
    console.log(carrito);
}

function guardarCarritoEnTabla(productos, idUsuario) {
    if (!isNaN(idUsuario)) {
        const formData = {
            productos: productos,
            id_comprador: idUsuario
        };

        // Enviar los datos al servidor usando fetch
        fetch('/guardar_carrito', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("Productos guardados en la tabla Carrito");
                window.location.href = '../Inicio_Sesion.html';
                localStorage.clear();

            } else {
                console.error("Error al guardar productos en la tabla Carrito:", data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        console.error('ID de usuario no válido en guardarProductosEnTabla');
    }
}
// Ejecutar solo en la página de productos
if (document.querySelector('.team')) {
    document.querySelectorAll('.cart-button').forEach(button => {
        button.addEventListener('click', (event) => {
            let card = event.target.closest('.card');
            let nombre = card.querySelector('.brand h2').textContent;
            let precio = card.querySelector('.price').dataset.price;
            agregarProducto(nombre, precio);
        });
    });
}
// Ejecutar solo en la página del carrito
if (document.getElementById('cartProductList')) {
    mostrarProductosEnCarrito();
    document.getElementById('checkoutButton').addEventListener('click', confirmarCompra);
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('btnSalir')) {
        document.getElementById('btnSalir').addEventListener('click', confirmarSalir);
    }
});
// Actualizar el contador en ambas páginas
document.addEventListener('DOMContentLoaded', actualizarContador);
///////////////////////////////////////////////////////////////////////
// Validar registro
function validateForm() {
    
    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const email = document.getElementById("email").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Verificar que todos los campos estén llenos
    if (!nombre || !apellido || !email || !direccion || !telefono || !password || !confirmPassword) {
        alert("Por favor, llene todos los campos del formulario.");
        return false;
    }

    // Validar nombre y apellido
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/;
    if (!nameRegex.test(nombre)) {
        alert("El nombre solo debe contener letras y ciertos caracteres especiales.");
        return false;
    }

    if (!nameRegex.test(apellido)) {
        alert("El apellido solo debe contener letras y ciertos caracteres especiales.");
        return false;
    }

    // Validar teléfono
    const telefonoRegex = /^\d{10}$/;
    if (!telefonoRegex.test(telefono)) {
        alert("El teléfono debe contener exactamente 10 dígitos.");
        return false;
    }

    // Validar contraseña y confirmación de contraseña
    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return false;
    }

    const formData = {
        nombre: nombre,
        apellido: apellido,
        email: email,
        direccion: direccion,
        telefono: telefono,
        password: password
    };

    // Enviar los datos al servidor usando fetch
    fetch('/submit-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirigir a la página de perfil si la respuesta es exitosa
            window.location.href = 'inicio_Sesion.html';
        } else {
            // Mostrar mensaje de error si algo sale mal
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Registrado Correctamente.');
    });

    return false; // Evitar el envío del formulario de forma tradicional
}
/////////////////////////////////////////////////////////////
// Mostrar datos de perfil al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const idUsuario = localStorage.getItem('idUsuario');
    const carrito = localStorage.getItem('carrito');

    

    // Realizar acciones adicionales con la ID del usuario si es necesario
    if (idUsuario) {
        // Aquí puedes realizar acciones adicionales con la ID del usuario si es necesario
        console.log('ID del usuario:', idUsuario);
       
       
    }

    // Opcional: Mostrar el carrito en la página si es necesario
    if (carrito) {
        // Aquí puedes mostrar el carrito en la página si es necesario
        console.log('Carrito:', carrito);
    }
});

// Guardar datos del perfil en localStorage al enviar el formulario
document.querySelector('.profile-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const nombre = document.getElementById('Pnombre').value;
    const apellido = document.getElementById('Papellido').value;
    const email = document.getElementById('Pemail').value;
    const telefono = document.getElementById('Ptelefono').value;
    const direccion = document.getElementById('Pdireccion').value;

    localStorage.setItem('nombre', nombre);
    localStorage.setItem('apellido', apellido);
    localStorage.setItem('email', email);
    localStorage.setItem('telefono', telefono);
    localStorage.setItem('direccion', direccion);

    // Opcional: mostrar mensaje de éxito u otra acción

    // Evitar el envío del formulario
   
});

/*--------------------------------------mio----------------------------*/


// Ruta para obtener los datos del usuario
document.addEventListener("DOMContentLoaded", function() {
    const userId = localStorage.getItem('idUsuario');
    
    if (userId) {
        fetch(`/api/usuario/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('nombre').value = data.usuario.nombre;
                    document.getElementById('apellido').value = data.usuario.apellido;
                    document.getElementById('email').value = data.usuario.email;
                    document.getElementById('telefono').value = data.usuario.telefono;
                    document.getElementById('direccion').value = data.usuario.direccion;
                } else {
                    console.error(data.message);
                }
            })
            .catch(error => console.error('Error al obtener los datos del usuario:', error));
    } else {
        console.error('No se encontró el ID de usuario en localStorage');
    }
});

///-----------Guardar datos del perfil-----------///

// Función para actualizar los datos del usuario
function actualizarDatosUsuario() {
    const idUsuario = localStorage.getItem('idUsuario');
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;

    const formData = {
        id: idUsuario,
        nombre: nombre,
        apellido: apellido,
        email: email,
        telefono: telefono,
        direccion: direccion
    };

    fetch('/actualizar-usuario', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Datos actualizados correctamente.');
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//Ayuda a que carguen los datos del usuario en perfil.html
function actualizarContador() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let contador = document.querySelector('.contador');
    if (contador) {
        contador.textContent = carrito.length;
    }
}

// Evento para el botón "Guardar"
document.getElementById('guardarDatos').addEventListener('click', actualizarDatosUsuario);

//-------------------------------funcion del API------------------------------------------------------
