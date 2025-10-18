<?php
namespace Model;

class Cita extends ActiveRecord {
    protected static $tabla = 'citas';
    protected static $columnasDB = ['id','id_turno','id_cliente','id_barbero','id_servicio','creado_en'];

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->id_turno = $args['id_turno'] ?? null;
        $this->id_cliente = $args['id_cliente'] ?? null;
        $this->id_barbero = $args['id_barbero'] ?? null;
        $this->id_servicio = $args['id_servicio'] ?? null;
        parent::__construct($args);
    }
}
