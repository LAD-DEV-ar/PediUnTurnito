<?php
namespace Controllers;

use MVC\Router;
use Model\Usuario;
use Model\Servicio;
use Model\HorarioBarberia;
use Model\Turno;
use Model\Cita;

class BookingController {

    // GET /booking
    public static function index(Router $router) {
        $services = Servicio::all();
        $barberos = Usuario::allBarberos(); // devuelve objetos Usuario con es_barbero = 1

        $barberiaId = isset($_GET['barberia']) ? intval($_GET['barberia']) : null;
        if ($barberiaId) {
            // filtrar servicios y barberos por barberia
            $services = Servicio::whereAll('id_barberia', $barberiaId);
            // barberos por barberia: busco usuarios con id_barberia y es_barbero=1
            $barbers = array_filter(Usuario::allBarberos(), function($b) use ($barberiaId) {
                return intval($b->id_barberia) === $barberiaId;
            });
        } else {
            $services = Servicio::all();
            $barbers = Usuario::allBarberos();
        }

        $router->render('booking/index', [
            'services' => $services,
            'barbers'  => $barberos
        ]);
    }

    // POST /booking/slots
    public static function availableSlots(Router $router) {
        $date = $_POST['date'] ?? null;
        $barberId = intval($_POST['barber_id'] ?? 0);
        $serviceId = intval($_POST['service_id'] ?? 0);

        if (!$date || !$barberId || !$serviceId) {
            http_response_code(400);
            echo json_encode(['error' => 'Parámetros incompletos']);
            return;
        }

        // Obtener barber y verificar
        $barber = Usuario::find($barberId);
        if (!$barber || intval($barber->es_barbero) !== 1) {
            http_response_code(404); echo json_encode(['error'=>'Barbero no encontrado']); return;
        }

        // Obtener horario de barberia para el día
        $dias = [
          1 => 'lunes', 2 => 'martes', 3 => 'miércoles', 4 => 'jueves',
          5 => 'viernes', 6 => 'sábado', 7 => 'domingo'
        ];
        $dt = new \DateTime($date);
        $dow = (int)$dt->format('N'); // 1 (lun) - 7 (dom)
        $diaNombre = $dias[$dow] ?? null;

        $horario = HorarioBarberia::findByBarberiaAndDay($barber->id_barberia, $diaNombre);
        if (!$horario) {
            // cerrado ese día
            header('Content-Type: application/json');
            echo json_encode(['intervals'=>[], 'base'=>null, 'duration'=>null, 'message'=>'Cerrado ese día']);
            return;
        }

        $base = intval($horario->intervalo_min ?? 30);

        // Obtener servicio
        $service = Servicio::find($serviceId);
        if (!$service) { http_response_code(404); echo json_encode(['error'=>'Servicio no encontrado']); return; }
        $duration = intval($service->duracion_min ?? 30);

        // Generar intervalos entre apertura y cierre
        $start = new \DateTime($horario->hora_apertura);
        $end   = new \DateTime($horario->hora_cierre);
        $intervalos = [];
        $cur = clone $start;
        while ($cur < $end) {
            $s = $cur->format('H:i:s');
            $cur->modify("+{$base} minutes");
            $e = $cur->format('H:i:s');
            $intervalos[] = ['start'=>$s,'end'=>$e];
        }

        // Obtener turnos existentes para ese barbero y fecha
        $takenMap = Turno::findByBarberAndDate($barberId, $date); // ['10:30:00' => 'reservado', ...]

        // validar disponibilidad considerando duración (n bloques consecutivos)
        $needed = (int) ceil($duration / $base);
        $available = [];

        for ($i = 0; $i < count($intervalos); $i++) {
            $ok = true;
            for ($j = 0; $j < $needed; $j++) {
                $idx = $i + $j;
                if ($idx >= count($intervalos)) { $ok = false; break; }
                $startTime = $intervalos[$idx]['start'];
                // si existe en takenMap y está 'reservado' => no disponible
                if (isset($takenMap[$startTime]) && $takenMap[$startTime] === 'reservado') { $ok = false; break; }
                if (isset($takenMap[$startTime]) && $takenMap[$startTime] === 'cancelado') {
                    // canceled => treat as libre (ok)
                }
                // si existe y 'libre' => ok
            }
            $available[] = [
                'start' => $intervalos[$i]['start'],
                'end' => $intervalos[$i]['end'],
                'available' => $ok
            ];
        }

        header('Content-Type: application/json');
        echo json_encode(['intervals'=>$available,'base'=>$base,'duration'=>$duration]);
    }

    // POST /booking/reserve
    // Requiere: date, barber_id, service_id, start
    // Cliente: usa session $_SESSION['id'] si está logueado; si no, espera client_id en POST
    public static function reserve(Router $router) {
        if (session_status() !== PHP_SESSION_ACTIVE) session_start();
        $date = $_POST['date'] ?? null;
        $barberId = intval($_POST['barber_id'] ?? 0);
        $serviceId = intval($_POST['service_id'] ?? 0);
        $start = $_POST['start'] ?? null;
        $clientId = $_SESSION['id'] ?? intval($_POST['client_id'] ?? 0);

        

        if (!$date || !$barberId || !$serviceId || !$start || !$clientId) {
            http_response_code(400); echo json_encode(['error'=>'Faltan parámetros o usuario no autenticado']); return;
        }

        // buscar servicio para calcular hora fin
        $service = Servicio::find($serviceId);
        if (!$service) { http_response_code(404); echo json_encode(['error'=>'Servicio no encontrado']); return; }
        $duration = intval($service->duracion_min ?? 30);

        // calcular hora fin
        $dt = \DateTime::createFromFormat('H:i:s', $start) ?: \DateTime::createFromFormat('H:i', $start);
        if (!$dt) { http_response_code(400); echo json_encode(['error'=>'Formato de hora inválido']); return; }
        $dt->modify("+{$duration} minutes");
        $end = $dt->format('H:i:s');

        // Buscar turno exacto
        $existing = Turno::findExact($barberId, $date, (strpos($start, ':')===false ? $start . ':00' : $start));
        // Si existe y está reservado -> conflicto
        if ($existing && $existing->estado === 'reservado') {
            http_response_code(409); echo json_encode(['error'=>'El horario ya está reservado']); return;
        }

        // Si existe y está libre -> actualizar a reservado
        if ($existing && $existing->estado === 'libre') {
            $existing->estado = 'reservado';
            $okUpdate = $existing->guardar();
            if (!$okUpdate) { http_response_code(500); echo json_encode(['error'=>'No se pudo reservar (actualizar turno)']); return; }
            $turnoId = $existing->id;
        } else {
            // crear nuevo turno (si no existía)
            $turno = new Turno([
                'id_barberia' => Usuario::find($barberId)->id_barberia ?? null,
                'id_barbero' => $barberId,
                'fecha' => $date,
                'hora_inicio' => (strpos($start, ':')===false ? $start . ':00' : $start),
                'hora_fin' => $end,
                'estado' => 'reservado'
            ]);
            $ok = $turno->guardar();
            if (!$ok) { http_response_code(500); echo json_encode(['error'=>'No se pudo crear turno']); return; }
            $turnoId = $turno->id;
        }

        // Crear la cita vinculada
        $cita = new Cita([
            'id_turno' => $turnoId,
            'id_cliente' => $clientId,
            'id_barbero' => $barberId,
            'id_servicio' => $serviceId
        ]);
        $okC = $cita->guardar();
        if (!$okC) {
            // intentar revertir: marcar turno como libre (si creamos nuevo)
            if (isset($turno) && $turno->id) {
                $turno->estado = 'libre';
                $turno->guardar();
            }
            http_response_code(500); echo json_encode(['error'=>'No se pudo crear la cita']); return;
        }

        header('Content-Type: application/json');
        echo json_encode(['success'=>true,'cita_id'=>$cita->id,'turno_id'=>$turnoId]);
    }
}
