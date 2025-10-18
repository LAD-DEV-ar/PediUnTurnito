<?php
namespace Model;

class Usuario extends ActiveRecord {
    protected static $tabla = 'usuarios';
    protected static $columnasDB = [
        'id','id_barberia','nombre','email','telefono','contrasena','confirmado','es_barbero','creado_en','actualizado_en'
    ];

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->id_barberia = $args['id_barberia'] ?? null;
        $this->nombre = $args['nombre'] ?? null;
        $this->email = $args['email'] ?? null;
        $this->telefono = $args['telefono'] ?? null;
        $this->contrasena = $args['contrasena'] ?? null;
        $this->confirmado = $args['confirmado'] ?? null;
        $this->es_barbero = $args['es_barbero'] ?? null;
        parent::__construct($args);
    }

    // Devuelve todos los barberos de una barbería
    public static function barberosPorBarberia($id_barberia) {
        return self::whereAll('id_barberia', $id_barberia); // filtrado general; podrías filtrar es_barbero = 1 si lo prefieres
    }

    // Devuelve sólo barberos (es_barbero = 1)
    public static function allBarberos() {
        $query = "SELECT * FROM " . self::$tabla . " WHERE es_barbero = 1 ORDER BY nombre";
        return self::consultarSQL($query);
    }
}
