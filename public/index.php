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



$router->get('/admin', [AdminController::class, 'index']);

// Barberias
$router->post('/admin/barberia/save', [AdminController::class, 'saveBarberia']);
$router->post('/admin/barberia/delete', [AdminController::class, 'deleteBarberia']);
$router->post('/admin/barberia/list', [AdminController::class, 'listBarberias']);

// Servicios
$router->post('/admin/servicio/save', [AdminController::class, 'saveServicio']);
$router->post('/admin/servicio/delete', [AdminController::class, 'deleteServicio']);
$router->post('/admin/servicio/list', [AdminController::class, 'listServicios']);

// Horarios
$router->post('/admin/horario/save', [AdminController::class, 'saveHorario']);
$router->post('/admin/horario/delete', [AdminController::class, 'deleteHorario']);
$router->post('/admin/horario/list', [AdminController::class, 'listHorarios']);

// Barberos (usuarios)
$router->post('/admin/barbero/save', [AdminController::class, 'saveBarbero']);
$router->post('/admin/barbero/delete', [AdminController::class, 'deleteBarbero']);
$router->post('/admin/barbero/list', [AdminController::class, 'listBarberos']);

// Turnos / Citas
$router->post('/admin/turnos/list', [AdminController::class, 'listTurnos']);
$router->post('/admin/cita/cancel', [AdminController::class, 'cancelCita']);
$router->post('/admin/cita/list', [AdminController::class, 'listCitas']);
$router->post('/admin/cita/get', [AdminController::class, 'getCita']);







// Comprueba y valida las rutas, que existan y les asigna las funciones del Controlador
$router->comprobarRutas();