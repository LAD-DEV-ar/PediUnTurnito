<?php
namespace Model;

class HorarioBarberia extends ActiveRecord {
    protected static $tabla = 'horarios_barberia';
    protected static $columnasDB = ['id','id_barberia','dia_semana','hora_apertura','hora_cierre','intervalo_min'];

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->id_barberia = $args['id_barberia'] ?? null;
        $this->dia_semana = $args['dia_semana'] ?? null;
        $this->hora_apertura = $args['hora_apertura'] ?? null;
        $this->hora_cierre = $args['hora_cierre'] ?? null;
        $this->intervalo_min = $args['intervalo_min'] ?? null;
        parent::__construct($args);
    }

    // Buscar horario por barberia y día (ej: 'lunes', 'martes', 'miércoles' ...)
    public static function findByBarberiaAndDay($id_barberia, $dia_semana) {
        $db = self::getDB();
        $idb = (int)$id_barberia;
        $diaEsc = $db->escape_string($dia_semana);
        $sql = "SELECT * FROM " . self::$tabla . " WHERE id_barberia = {$idb} AND dia_semana = '{$diaEsc}' LIMIT 1";
        $res = $db->query($sql);
        if (!$res) return null;
        $row = $res->fetch_assoc();
        $res->free();
        if (!$row) return null;
        return static::crearObjeto($row);
    }
}
