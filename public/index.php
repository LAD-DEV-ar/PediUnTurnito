<?php 

require_once __DIR__ . '/../includes/app.php';

use MVC\Router;
use Controllers\BookingController;
use Controllers\HomeController;
use Controllers\AdminController;

$router = new Router();


// Reservas
$router->get('/booking', [BookingController::class, 'index']);
$router->post('/booking/slots', [BookingController::class, 'availableSlots']);
$router->post('/booking/reserve', [BookingController::class, 'reserve']);

// Home
$router->get('/', [HomeController::class, 'index']);
$router->post('/barberias/search', [HomeController::class, 'search']);




// Comprueba y valida las rutas, que existan y les asigna las funciones del Controlador
$router->comprobarRutas();