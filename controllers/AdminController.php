<?php
namespace Controllers;

use MVC\Router;
use Model\Barberia;
use Model\Servicio;
use Model\HorarioBarberia;
use Model\Usuario;
use Model\Turno;
use Model\Cita;

class AdminController {

    // Dashboard / admin UI
    public static function index(Router $router) {
        // Requiere login simple (ajusta redirect si querés)
        

        // require_login_simple('/');
        

        // opcional: datos resumidos para el dashboard
        $totalBarberias = count(Barberia::all());
        $totalServicios = count(Servicio::all());
        $totalBarberos = count(Usuario::allBarberos());
        $recentCitas = Cita::get(8);

        $router->render('admin/index', [
            'totalBarberias' => $totalBarberias,
            'totalServicios' => $totalServicios,
            'totalBarberos'  => $totalBarberos,
            'recentCitas'    => $recentCitas
        ]);
    }

    // ===== Barberias CRUD (AJAX) =====
    public static function listBarberias() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');
        $items = Barberia::all();
        echo json_encode(['items' => array_values($items)]);
    }

    public static function saveBarberia() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');

        $id = intval($_POST['id'] ?? 0);
        $nombre = trim($_POST['nombre'] ?? '');
        $localidad = trim($_POST['localidad'] ?? '');
        $calle = trim($_POST['calle'] ?? '');
        $altura = trim($_POST['altura'] ?? '');

        if ($nombre === '') {
            http_response_code(400); echo json_encode(['error'=>'El nombre es requerido']); return;
        }

        if ($id > 0) {
            $bar = Barberia::find($id);
            if (!$bar) { http_response_code(404); echo json_encode(['error'=>'Barbería no encontrada']); return; }
            $bar->nombre = $nombre;
            $bar->localidad = $localidad;
            $bar->calle = $calle;
            $bar->altura = $altura;
            $ok = $bar->guardar();
        } else {
            $bar = new Barberia(['nombre'=>$nombre,'localidad'=>$localidad,'calle'=>$calle,'altura'=>$altura]);
            $ok = $bar->guardar();
        }

        if ($ok) echo json_encode(['success'=>true,'id'=>$bar->id]);
        else { http_response_code(500); echo json_encode(['error'=>'Error al guardar barbería']); }
    }

    public static function deleteBarberia() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');
        $id = intval($_POST['id'] ?? 0);
        if (!$id) { http_response_code(400); echo json_encode(['error'=>'id requerido']); return; }
        $bar = Barberia::find($id);
        if (!$bar) { http_response_code(404); echo json_encode(['error'=>'Barbería no encontrada']); return; }
        $ok = $bar->eliminar();
        echo json_encode(['success' => (bool)$ok]);
    }

    // ===== Servicios CRUD =====
    public static function listServicios() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');
        $barberia = intval($_POST['id_barberia'] ?? 0);
        $items = $barberia ? Servicio::whereAll('id_barberia', $barberia) : Servicio::all();
        echo json_encode(['items' => array_values($items)]);
    }

    public static function saveServicio() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');

        $id = intval($_POST['id'] ?? 0);
        $id_barberia = intval($_POST['id_barberia'] ?? 0);
        $nombre = trim($_POST['nombre'] ?? '');
        $duracion = intval($_POST['duracion_min'] ?? 30);
        $precio = floatval($_POST['precio'] ?? 0);

        if ($nombre === '' || !$id_barberia) { http_response_code(400); echo json_encode(['error'=>'Datos incompletos']); return; }

        if ($id > 0) {
            $s = Servicio::find($id);
            if (!$s) { http_response_code(404); echo json_encode(['error'=>'Servicio no encontrado']); return; }
            $s->nombre = $nombre; $s->duracion_min = $duracion; $s->precio = $precio;
            $ok = $s->guardar();
        } else {
            $s = new Servicio(['id_barberia'=>$id_barberia,'nombre'=>$nombre,'duracion_min'=>$duracion,'precio'=>$precio]);
            $ok = $s->guardar();
        }
        if ($ok) echo json_encode(['success'=>true,'id'=>$s->id]); else { http_response_code(500); echo json_encode(['error'=>'Error al guardar servicio']); }
    }

    public static function deleteServicio() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');
        $id = intval($_POST['id'] ?? 0);
        if (!$id) { http_response_code(400); echo json_encode(['error'=>'id requerido']); return; }
        $s = Servicio::find($id);
        if (!$s) { http_response_code(404); echo json_encode(['error'=>'Servicio no encontrado']); return; }
        $ok = $s->eliminar();
        echo json_encode(['success' => (bool)$ok]);
    }

    // ===== Horarios barbería =====
    public static function listHorarios() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');
        $id_barberia = intval($_POST['id_barberia'] ?? 0);
        if (!$id_barberia) { http_response_code(400); echo json_encode(['error'=>'id_barberia requerido']); return; }
        $items = HorarioBarberia::whereAll('id_barberia', $id_barberia);
        echo json_encode(['items' => array_values($items)]);
    }

    public static function saveHorario() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');

        $id = intval($_POST['id'] ?? 0);
        $id_barberia = intval($_POST['id_barberia'] ?? 0);
        $dia = trim($_POST['dia_semana'] ?? '');
        $hora_ap = trim($_POST['hora_apertura'] ?? '');
        $hora_ci = trim($_POST['hora_cierre'] ?? '');
        $intervalo = intval($_POST['intervalo_min'] ?? 30);

        if (!$id_barberia || !$dia || !$hora_ap || !$hora_ci) { http_response_code(400); echo json_encode(['error'=>'Datos incompletos']); return; }

        if ($id > 0) {
            $h = HorarioBarberia::find($id);
            if (!$h) { http_response_code(404); echo json_encode(['error'=>'Horario no encontrado']); return; }
            $h->dia_semana = $dia; $h->hora_apertura = $hora_ap; $h->hora_cierre = $hora_ci; $h->intervalo_min = $intervalo;
            $ok = $h->guardar();
        } else {
            $h = new HorarioBarberia(['id_barberia'=>$id_barberia,'dia_semana'=>$dia,'hora_apertura'=>$hora_ap,'hora_cierre'=>$hora_ci,'intervalo_min'=>$intervalo]);
            $ok = $h->guardar();
        }
        if ($ok) echo json_encode(['success'=>true,'id'=>$h->id]); else { http_response_code(500); echo json_encode(['error'=>'Error al guardar horario']); }
    }

    public static function deleteHorario() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');
        $id = intval($_POST['id'] ?? 0);
        if (!$id) { http_response_code(400); echo json_encode(['error'=>'id requerido']); return; }
        $h = HorarioBarberia::find($id);
        if (!$h) { http_response_code(404); echo json_encode(['error'=>'Horario no encontrado']); return; }
        $ok = $h->eliminar();
        echo json_encode(['success' => (bool)$ok]);
    }

    // ===== Barberos (usuarios) =====
    public static function listBarberos() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');
        $id_barberia = intval($_POST['id_barberia'] ?? 0);
        if ($id_barberia) {
            $items = \Model\Usuario::whereAll('id_barberia', $id_barberia);
            // filter by es_barbero
            $items = array_filter($items, function($u){ return intval($u->es_barbero) === 1; });
        } else {
            $items = Usuario::allBarberos();
        }
        echo json_encode(['items' => array_values($items)]);
    }

    public static function saveBarbero() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');

        $id = intval($_POST['id'] ?? 0);
        $id_barberia = intval($_POST['id_barberia'] ?? 0);
        $nombre = trim($_POST['nombre'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $telefono = trim($_POST['telefono'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if ($nombre === '' || $email === '' || !$id_barberia) { http_response_code(400); echo json_encode(['error'=>'Datos incompletos']); return; }

        if ($id > 0) {
            $u = Usuario::find($id);
            if (!$u) { http_response_code(404); echo json_encode(['error'=>'Usuario no encontrado']); return; }
            $u->nombre = $nombre; $u->email = $email; $u->telefono = $telefono;
            if ($password !== '') $u->contrasena = password_hash($password, PASSWORD_DEFAULT);
            $ok = $u->guardar();
        } else {
            $u = new Usuario(['id_barberia'=>$id_barberia,'nombre'=>$nombre,'email'=>$email,'telefono'=>$telefono,'contrasena'=>(password_hash($password?:bin2hex(random_bytes(4)), PASSWORD_DEFAULT)),'confirmado'=>1,'es_barbero'=>1]);
            $ok = $u->guardar();
        }
        if ($ok) echo json_encode(['success'=>true,'id'=>$u->id]); else { http_response_code(500); echo json_encode(['error'=>'Error al guardar barbero']); }
    }

    public static function deleteBarbero() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');
        $id = intval($_POST['id'] ?? 0);
        if (!$id) { http_response_code(400); echo json_encode(['error'=>'id requerido']); return; }
        $u = Usuario::find($id);
        if (!$u) { http_response_code(404); echo json_encode(['error'=>'Usuario no encontrado']); return; }
        $ok = $u->eliminar();
        echo json_encode(['success' => (bool)$ok]);
    }

    // ===== Turnos y Citas (revisión) =====
    public static function listTurnos() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');

        $filters = [];
        if (!empty($_POST['id_barberia'])) $filters['id_barberia'] = intval($_POST['id_barberia']);
        if (!empty($_POST['id_barbero'])) $filters['id_barbero'] = intval($_POST['id_barbero']);
        if (!empty($_POST['fecha'])) $filters['fecha'] = $_POST['fecha'];

        // construir query simple
        $where = [];
        foreach ($filters as $k=>$v) {
            $val = is_int($v) ? intval($v) : (Turno::getDB()->escape_string($v));
            $where[] = "{$k} = '" . $val . "'";
        }
        $sql = "SELECT * FROM turnos" . (count($where) ? " WHERE " . implode(" AND ", $where) : "") . " ORDER BY fecha DESC, hora_inicio ASC LIMIT 200";
        $items = Turno::SQL($sql);
        echo json_encode(['items' => array_values($items)]);
    }

    public static function listCitas() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');
        // similar filters as listTurnos, pero unimos con usuarios y servicios si queremos (simple list)
        $sql = "SELECT c.*, t.fecha, t.hora_inicio, t.hora_fin, u.nombre AS cliente_nombre, b.nombre AS barbero_nombre, s.nombre AS servicio_nombre
                FROM citas c
                LEFT JOIN turnos t ON c.id_turno = t.id
                LEFT JOIN usuarios u ON c.id_cliente = u.id
                LEFT JOIN usuarios b ON c.id_barbero = b.id
                LEFT JOIN servicios s ON c.id_servicio = s.id
                ORDER BY c.creado_en DESC LIMIT 200";
        $dbItems = Cita::SQL($sql);
        echo json_encode(['items' => array_values($dbItems)]);
    }

    public static function cancelCita() {
        require_login_simple('/');
        header('Content-Type: application/json; charset=utf-8');
        $id = intval($_POST['id'] ?? 0);
        if (!$id) { http_response_code(400); echo json_encode(['error'=>'id requerido']); return; }

        $c = Cita::find($id);
        if (!$c) { http_response_code(404); echo json_encode(['error'=>'Cita no encontrada']); return; }

        // marcar turno como libre y eliminar la cita
        $turno = Turno::find($c->id_turno);
        if ($turno) {
            $turno->estado = 'libre';
            $turno->guardar();
        }
        $ok = $c->eliminar();
        echo json_encode(['success' => (bool)$ok]);
    }
}
