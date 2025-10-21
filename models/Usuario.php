<?php
namespace Model;

class Usuario extends ActiveRecord {
    protected static $tabla = 'usuarios';
    protected static $columnasDB = [
        'id','id_barberia','nombre','email','telefono','password','confirmado','es_barbero','creado_en','actualizado_en'
    ];

    public function __construct($args = []) {
        $this->id = $args['id'] ?? null;
        $this->id_barberia = $args['id_barberia'] ?? null;
        $this->nombre = $args['nombre'] ?? null;
        $this->email = $args['email'] ?? null;
        $this->telefono = $args['telefono'] ?? null;
        $this->password = $args['password'] ?? null;
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
    public function validarLogin(): array {
        self::clearAlertas();
        if (!$this->email) self::addAlert('error', 'El email es obligatorio');
        if (!$this->password) self::addAlert('error', 'La contraseña es obligatoria');
        return self::getAlertas();
    }
    public function comprobarPassword(string $passwordIngresado): bool {
        // Si en BD se guardó hash, password_verify; si por algún motivo está plain (no recomendable) fallback a comparación simple
        if (empty($this->password)) return false;
        if (password_needs_rehash($this->password, PASSWORD_BCRYPT)) {
            // aún así verificamos antes de re-hashear
        }
        return password_verify($passwordIngresado, $this->password);
    }
}
