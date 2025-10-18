<?php
namespace Model;

class Servicio extends ActiveRecord {
    protected static $tabla = 'servicios';
    protected static $columnasDB = ['id','id_barberia','nombre','duracion_min','precio'];

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->id_barberia = $args['id_barberia'] ?? null;
        $this->nombre = $args['nombre'] ?? null;
        $this->duracion_min = $args['duracion_min'] ?? null;
        $this->precio = $args['precio'] ?? null;
        parent::__construct($args);
    }
}
