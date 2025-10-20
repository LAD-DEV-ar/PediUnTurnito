<?php
namespace Model;

class Barberia extends ActiveRecord {
    protected static $tabla = 'barberias';
    protected static $columnasDB = ['id','nombre','localidad','calle','altura','creado_en'];

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->nombre = $args['nombre'] ?? null;
        $this->localidad = $args['localidad'] ?? null;
        $this->calle = $args['calle'] ?? null;
        $this->altura = $args['altura'] ?? null;
        $this->creado_en = $args['creado_en'] ?? null;
        parent::__construct($args);
    }
}
