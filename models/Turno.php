<?php
namespace Model;

class Turno extends ActiveRecord {
    protected static $tabla = 'turnos';
    protected static $columnasDB = ['id','id_barberia','id_barbero','fecha','hora_inicio','hora_fin','estado'];

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->id_barberia = $args['id_barberia'] ?? null;
        $this->id_barbero = $args['id_barbero'] ?? null;
        $this->fecha = $args['fecha'] ?? null;
        $this->hora_inicio = $args['hora_inicio'] ?? null;
        $this->hora_fin = $args['hora_fin'] ?? null;
        $this->estado = $args['estado'] ?? 'libre';
        parent::__construct($args);
    }

    // Devuelve array de start_time => estado para un barbero en cierta fecha
    public static function findByBarberAndDate($barberId, $date) {
        $db = self::getDB();
        $b = (int)$barberId;
        $dateEsc = $db->escape_string($date);
        $sql = "SELECT hora_inicio, estado FROM " . self::$tabla . " WHERE id_barbero = {$b} AND fecha = '{$dateEsc}'";
        $res = $db->query($sql);
        $out = [];
        if ($res) {
            while ($r = $res->fetch_assoc()) {
                $out[$r['hora_inicio']] = $r['estado'];
            }
            $res->free();
        }
        return $out; // ej: ['10:30:00' => 'reservado', ...]
    }

    // Busca un turno exacto
    public static function findExact($barberId, $date, $hora_inicio) {
        $db = self::getDB();
        $b = (int)$barberId;
        $dateEsc = $db->escape_string($date);
        $horaEsc = $db->escape_string($hora_inicio);
        $sql = "SELECT * FROM " . self::$tabla . " WHERE id_barbero = {$b} AND fecha = '{$dateEsc}' AND hora_inicio = '{$horaEsc}' LIMIT 1";
        $res = $db->query($sql);
        if (!$res) return null;
        $row = $res->fetch_assoc();
        $res->free();
        return $row ? static::crearObjeto($row) : null;
    }
}
