//Función para agregar un producto al carrito
function agregarProducto(nombre, precio) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let producto = { nombre: nombre, precio: precio };
    carrito.push(producto);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    mostrarMensaje("¡Producto agregado al carrito!");
    actualizarContador();
}
//Funcion que actualiza el carrito
function actualizarContador() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let contador = document.querySelector('.contador');
    if (contador) {
        contador.textContent = carrito.length;
    }
}

// Función para mostrar mensaje temporalmente
function mostrarMensaje(mensaje) {
    var mensajeContainer = document.getElementById('mensajeContainer');
    var cartMessage = document.getElementById('cartMessage');
    if (mensajeContainer && cartMessage) {
        cartMessage.textContent = mensaje;
        mensajeContainer.style.display = 'block';
        setTimeout(() => {
            mensajeContainer.style.display = 'none';
        }, 2000);
    }
}

// Función para mostrar los productos en el carrito
function mostrarProductosEnCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let productList = document.getElementById('cartProductList');
    let checkoutContainer = document.getElementById('checkoutContainer');
    
    // Limpiar la lista de productos y el contenedor del botón
    productList.innerHTML = ''; 
    checkoutContainer.innerHTML = ''; 

    if (carrito.length === 0) {
        // Si el carrito está vacío, mostrar mensaje
        checkoutContainer.innerHTML = '<p>El carrito está vacío.</p>';
    } else {
        carrito.forEach((producto, index) => {
            let li = document.createElement('li');
            
            let productDetails = document.createElement('span');
            productDetails.textContent = `${producto.nombre} - $${producto.precio} x ${producto.cantidad}`;
            
            let productControls = document.createElement('div');
            productControls.className = 'product-controls';
            
            // Agregar botón de decrementar
            let decrementButton = document.createElement('button');
            decrementButton.textContent = '-';
            decrementButton.onclick = () => decrementarCantidad(index);
            productControls.appendChild(decrementButton);

            // Agregar cantidad
            let quantitySpan = document.createElement('span');
            quantitySpan.textContent = producto.cantidad;
            productControls.appendChild(quantitySpan);
            
            // Agregar botón de incrementar
            let incrementButton = document.createElement('button');
            incrementButton.textContent = '+';
            incrementButton.onclick = () => incrementarCantidad(index);
            productControls.appendChild(incrementButton);

            // Agregar botón de eliminar
            let deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.className = 'delete-button';
            deleteButton.onclick = () => eliminarProducto(index);
            
            li.appendChild(productDetails);
            li.appendChild(productControls);
            li.appendChild(deleteButton);

            productList.appendChild(li);
        });

        // Agregar botón de confirmar compra
        let checkoutButton = document.createElement('button');
        checkoutButton.textContent = 'Confirmar Compra';
        checkoutButton.id = 'checkoutButton';
        checkoutButton.onclick = () => confirmarCompra(); // Verificar tarjeta antes de confirmar compra
        checkoutContainer.appendChild(checkoutButton);
    }
}

// Función para eliminar un producto del carrito
function eliminarProducto(index) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito.splice(index, 1); // Eliminar el producto
    localStorage.setItem('carrito', JSON.stringify(carrito)); // Actualizar el localStorage
    mostrarProductosEnCarrito(); // Actualizar la vista del carrito
}

// Función para decrementar la cantidad de un producto en el carrito
function decrementarCantidad(index) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    if (carrito[index].cantidad > 1) {
        carrito[index].cantidad--; // Decrementar la cantidad
    } else {
        carrito.splice(index, 1); // Eliminar el producto si la cantidad es 1
    }
    localStorage.setItem('carrito', JSON.stringify(carrito)); // Actualizar el localStorage
    mostrarProductosEnCarrito(); // Actualizar la vista del carrito
}

// Función para incrementar la cantidad de un producto en el carrito
function incrementarCantidad(index) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito[index].cantidad++; // Incrementar la cantidad
    localStorage.setItem('carrito', JSON.stringify(carrito)); // Actualizar el localStorage
    mostrarProductosEnCarrito(); // Actualizar la vista del carrito
}

// Función para añadir un producto al carrito
function añadirProducto(producto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let existingProductIndex = carrito.findIndex(item => item.nombre === producto.nombre);
    if (existingProductIndex > 0) {
        // Si el producto ya existe en el carrito, incrementar la cantidad
        carrito[existingProductIndex].cantidad++;
    } else {
        // Si el producto no existe en el carrito, añadirlo con cantidad 1
        producto.cantidad = 1;
        carrito.push(producto);
    }
    localStorage.setItem('carrito', JSON.stringify(carrito)); // Actualizar el localStorage
    mostrarProductosEnCarrito(); // Actualizar la vista del carrito
}

// Llamar a la función para mostrar los productos al cargar la página
document.addEventListener('DOMContentLoaded', mostrarProductosEnCarrito);
