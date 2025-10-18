<?php 

require_once __DIR__ . '/../includes/app.php';

use MVC\Router;
use Controllers\BookingController;

$router = new Router();

$router->get('/booking', [BookingController::class, 'index']);
$router->post('/booking/slots', [BookingController::class, 'availableSlots']);
$router->post('/booking/reserve', [BookingController::class, 'reserve']);




// Comprueba y valida las rutas, que existan y les asigna las funciones del Controlador
$router->comprobarRutas();