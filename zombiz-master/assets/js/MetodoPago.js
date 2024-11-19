document.addEventListener('DOMContentLoaded', function() {
    // Código para la página del producto
    if (document.querySelector('.buy-button')) {
        document.querySelectorAll('.buy-button').forEach(function(button) {
            button.addEventListener('click', function() {
                var priceElement = this.closest('.card').querySelector('.price');
                var price = priceElement.getAttribute('data-price').replace(/,/g, ''); // Eliminar comas del precio
                window.location.href = 'service.html?price=' + price;
            });
        });
    }

    // Código para la página de pago
    if (document.getElementById('paypal-button-container')) {
        // Esperar a que el SDK de PayPal se cargue
        if (typeof paypal !== 'undefined') {
            // Obtener el precio del producto de la URL
            var urlParams = new URLSearchParams(window.location.search);
            var price = urlParams.get('price');
            document.getElementById('product-price').textContent = price;

            // Configurar y renderizar el botón de PayPal
            paypal.Buttons({
                createOrder: function(data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: price, // Precio del producto
                            }
                        }]
                    });
                },
                onApprove: function(data, actions) {
                    return actions.order.capture().then(function(details) {
                        alert('Pago completado por ' + details.payer.name.given_name);
                    });
                }
            }).render('#paypal-button-container'); // Renderizar el botón en el div con id "paypal-button-container"
        } else {
            console.error('El SDK de PayPal no se cargó correctamente.');
        }
    }
});

